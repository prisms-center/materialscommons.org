from ..mcapp import app
from ..decorators import crossdomain, apikey
from flask import jsonify, g, request
import rethinkdb as r
from .. import access
from .. import error
from .. import dmutil
from loader.model import sample
from mcapi import mcexceptions
import traceback


class StateCreateSaver(object):
    def __init__(self):
        self.objects = {}

    def insert(self, table, entry):
        rv = r.table('saver').insert(entry).run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return id

    def insert_newval(self, table, entry):
        rv = r.table('saver').insert(entry, return_vals=True).run(g.conn)
        id = rv['generated_keys'][0]
        self.objects[id] = table
        return rv

    def move_to_tables(self):
        for key in self.objects:
            table_name = self.objects[key]
            o = r.table('saver').get(key).run(g.conn, time_format='raw')
            r.table(table_name).insert(o).run(g.conn)

    def delete_tables(self):
        for key in self.objects:
            r.table('saver').get(key).delete().run(g.conn)
        self.objects.clear()


class ProvenanceSaver(object):
    def __init__(self, draft_id, user):
        self.draft_id = draft_id
        self.user = user
        self.saver = StateCreateSaver()
        self.process_id = None
        self.project_id = ""
        self.owner = user

    def save(self):
        try:
            self.load_draft()
            return self.process_id
        except mcexceptions.RequiredAttributeException as rae:
            traceback.print_exc()
            self.saver.delete_tables()
            print "Missing attribute: %s" % (rae.attr)
        finally:
            self.saver.delete_tables()

    def load_draft(self):
        process_id = self.load_provenance_from_draft()
        r.table('drafts').get(self.draft_id).delete().run(g.conn)
        self.saver.move_to_tables()
        self.saver.delete_tables()
        return process_id

    def load_provenance_from_draft(self):
            draft = r.table('drafts').get(self.draft_id).run(g.conn)
            attributes = draft['attributes']
            self.owner = draft['owner']
            self.project_id = attributes['project_id']
            self.create_process(attributes['process'])
            if 'input_files' in attributes:
                input_files = {'input_files': attributes['input_files']}
                r.table('saver').get(self.process_id)\
                                .update(input_files).run(g.conn)
            if 'output_files' in attributes:
                output_files = {'output_files': attributes['output_files']}
                r.table('saver').get(self.process_id)\
                                .update(output_files).run(g.conn)
            input_conditions = dmutil.get_optional('input_conditions',
                                                   attributes, [])
            output_conditions = dmutil.get_optional('output_conditions',
                                                    attributes, [])
            self.create_conditions(input_conditions, output_conditions)

    def create_process(self, j):
        process = self.new_process(j)
        self.process_id = self.saver.insert('processes', process)
        self.saver.insert('project2processes', {'project_id': self.project_id,
                                                'process_id': self.process_id})

    def new_process(self, j):
        p = dict()
        p['project'] = self.project_id
        p['name'] = dmutil.get_required('name', j)
        p['model'] = dmutil.get_required('model', j)
        p['birthtime'] = r.now()
        p['mtime'] = p['birthtime']
        p['machine'] = dmutil.get_optional('machine', j)
        p['template'] = dmutil.get_required('template', j)
        p['notes'] = dmutil.get_optional('notes', j, [])
        p['input_conditions'] = dmutil.get_optional('input_conditions', j, [])
        p['input_files'] = dmutil.get_optional('input_files', j, [])
        p['output_conditions'] = dmutil.get_optional('output_conditions',
                                                     j, [])
        p['output_files'] = dmutil.get_optional('output_files', j, [])
        p['runs'] = dmutil.get_optional('runs', j, [])
        p['experiment_run_date'] = dmutil.get_optional(
            'experiment_run_date', j)
        return p

    def create_conditions(self, input_conditions, output_conditions):
        for key in input_conditions:
            values = input_conditions[key]
            values['condition_type'] = 'input_conditions'
            self.create_condition(values)
        for key in output_conditions:
            values = output_conditions[key]
            values['condition_type'] = 'output_conditions'
            self.create_condition(values)

    def create_condition(self, j):
        condition = self.new_condition(j)
        type_of_condition = dmutil.get_required('condition_type', j)
        if (condition['template'] == 'Transformed Sample'):
            s = sample.Sample(condition['model'], condition['owner'])
            sample_id = dmutil.insert_entry_id('samples', s.__dict__)
            condition['sample_id'] = sample_id
        c_id = self.saver.insert('conditions', condition)
        new_conditions = r.table('saver')\
                          .get(self.process_id)[type_of_condition]\
                          .append(c_id).run(g.conn)
        r.table('saver').get(self.process_id)\
                        .update({type_of_condition: new_conditions})\
                        .run(g.conn)

    def new_condition(self, j):
        c = dict()
        c['owner'] = self.owner
        c['template'] = dmutil.get_required('template_name', j)
        c['sample_id'] = dmutil.get_optional('sample_id', j)
        c['properties'] = {}

        default_properties = dmutil.get_required('default_properties', j)
        self._add_properties(default_properties, c)

        added_properties = dmutil.get_optional('added_properties', j, [])
        self._add_properties(added_properties, c)
        return c

    def _add_properties(self, properties, condition):
        for prop in properties:
            attr_name, prop_vals = self.new_condition_attributes(prop)
            if attr_name is not None:
                condition['properties'][attr_name] = prop_vals

    def new_condition_attributes(self, attrs):
        attr_name = dmutil.get_optional('attribute', attrs, None)
        if attr_name is None:
            return None, None
        attr_props = {}
        value = dmutil.get_optional('value', attrs, "")
        if value == "":
            return None, None
        attr_props['value'] = value
        attr_props['unit'] = dmutil.get_optional('unit', attrs)
        attr_props['name'] = dmutil.get_optional('name', attrs)
        return attr_name, attr_props


@app.route('/provenance', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_provenance():
    user = access.get_user()
    j = request.get_json()
    draft_id = dmutil.get_required('draft_id', j)
    p = ProvenanceSaver(draft_id, user)
    process_id = p.save()
    if (process_id):
        return jsonify({'success': True, 'process': process_id})
    else:
        return error.bad_request('unable to create process')
