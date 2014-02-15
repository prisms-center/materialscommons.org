from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import g, request
import rethinkdb as r
from .. import args
from datadirs import DItem, DEncoder, buildTreeFromSelection
from os.path import dirname, basename
import json
from .. import access
from .. import dmutil
from .. import validate
from .. import error
from loader.model import project
from loader.model import datadir


@app.route('/projects', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_projects():
    user = access.get_user()
    rr = r.table('projects').filter({'owner': user})
    rr = args.add_all_arg_options(rr)
    items = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(items)


@app.route('/projects/by_group', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_all_group_projects():
    user = access.get_user()
    list_projects = []
    if access.is_administrator(user):
        all_users = list(r.table('users').pluck('email').run(g.conn))
        allowedUsers = []
        for u in all_users:
            allowedUsers.append(u['email'])
    else:
        allowedUsers = list(r.table('usergroups')
                            .filter(r.row['users'].contains(user))
                            .concat_map(lambda g: g['users'])
                            .distinct().run(g.conn))
    users = '(' + '|'.join(allowedUsers) + ')'
    if allowedUsers == []:
        rr = r.table('projects').filter({'owner': user})
        rr = args.add_all_arg_options(rr)
        items = list(rr.run(g.conn, time_format='raw'))
        return args.json_as_format_arg(items)
    else:
        rr = r.table('projects').filter(r.row['owner'].match(users))
        rr = args.add_all_arg_options(rr)
        selection = list(rr.run(g.conn, time_format='raw'))
        for proj in selection:
            if access.allowed(user, proj[u'owner']):
                list_projects.append(proj)
        return args.json_as_format_arg(list_projects)


@app.route('/projects/<id>', methods=['GET'])
@apikey(shared=True)
@jsonp
def get_project(id):
    proj = r.table('projects').get(id) \
                              .run(g.conn, time_format='raw')
    if proj is None:
        return error.not_found("No such project %s" % (id))
    user = access.get_user()
    if not access.allowed(user, proj['owner']):
        return error.not_authorized("No access to project %s" % (id))
    return args.json_as_format_arg(proj)


@app.route('/projects/<project_id>/datafiles')
@apikey
@jsonp
def get_datafiles_for_project(project_id):
    user = access.get_user()
    proj = r.table('projects').get(project_id).run(g.conn)
    if proj is None:
        return error.bad_request("Unknown project id: %s" % (project_id))
    access.check(user, proj['owner'])
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    rr = rr.pluck('id', 'name', 'owner', 'datafiles').order_by('name')
    rr = rr.map(r.row.merge({'datadir_path': r.row['name'],
                             'datadir_id': r.row['id']}))
    rr = rr.outer_join(r.table('datafiles'),
                       #.pluck('id', 'name', 'size', 'owner', 'birthtime'),
                       lambda ddrow, drow: ddrow['datafiles']
                       .contains(drow['id'])).zip()
    rr = rr.pluck('datadir_id', 'datadir_path', 'id',
                  'name', 'checksum', 'size')
    selection = list(rr.run(g.conn, time_format='raw'))
    return args.json_as_format_arg(selection)


@app.route('/projects/<project_id>/datadirs')
@apikey(shared=True)
@jsonp
def get_datadirs_for_project(project_id):
    user = access.get_user()
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    selection = list(rr.run(g.conn, time_format='raw'))
    if len(selection) > 0 and selection[0]['owner'] == user:
        return args.json_as_format_arg(selection)
    return args.json_as_format_arg([])


@app.route('/projects/<project_id>/tree2')
@apikey(shared=True)
@jsonp
def get_project_tree2(project_id):
    user = access.get_user()
    proj = r.table('projects').get(project_id).run(g.conn)
    if proj is None:
        return error.bad_request("Unknown project id: %s" % (project_id))
    access.check(user, proj['owner'])
    selection = list(r.table('project2datadir')
                     .get_all(project_id, index='project_id')
                     .eq_join("datadir_id", r.table('datadirs_denorm'))
                     .zip().run(g.conn, time_format='raw'))
    return build_tree(selection)


class DItem2:
    def __init__(self, id, name, type, owner, birthtime, size):
        self.id = id
        self.selected = False
        self.c_id = ""
        self.level = 0
        self.parent_id = ""
        self.name = name
        self.owner = owner
        self.birthtime = birthtime
        self.size = size
        self.displayname = basename(name)
        self.type = type
        self.children = []


class DEncoder2(json.JSONEncoder):
    def default(self, o):
        return o.__dict__


def build_tree(datadirs):
    next_id = 0
    all_data_dirs = {}
    top_level_dirs = []
    for ddir in datadirs:
        ditem = DItem2(ddir['id'], ddir['name'], 'datadir', ddir['owner'],
                       ddir['birthtime'], 0)
        ditem.level = ditem.name.count('/')
        ditem.c_id = next_id
        next_id = next_id + 1
        #
        # The item may have been added as a parent
        # before it was actually seen. We check for
        # this case and grab the children to add to
        # us now that we have the details for the ditem.
        if ditem.name in all_data_dirs:
            existing_ditem = all_data_dirs[ditem.name]
            ditem.children = existing_ditem.children
        all_data_dirs[ditem.name] = ditem
        if ditem.level == 0:
            top_level_dirs.append(ditem)
        for df in ddir['datafiles']:
            dfitem = DItem2(df['id'], df['name'], 'datafile',
                            df['owner'], df['birthtime'], df['size'])
            dfitem.c_id = next_id
            next_id = next_id + 1
            ditem.children.append(dfitem)
        parent_name = dirname(ditem.name)
        if parent_name in all_data_dirs:
            parent = all_data_dirs[parent_name]
            parent.children.append(ditem)
        else:
            # We haven't seen the parent yet, but we need
            # to add the children. So, create a parent with
            # name and add children. When we finally see it
            # we will grab the children and add them to the
            # real object.
            parent = DItem2('', parent_name, 'datadir', '', '', 0)
            parent.children.append(ditem)
            all_data_dirs[parent_name] = parent
    return json.dumps(top_level_dirs, cls=DEncoder2)


@app.route('/projects/<project_id>/tree')
@apikey(shared=True)
@jsonp
def get_project_tree(project_id):
    user = access.get_user()
    proj = r.table('projects').get(project_id).run(g.conn)
    if proj is None:
        return error.bad_request("Unknown project id: %s" % (project_id))
    access.check(user, proj['owner'])
    rr = r.table('project2datadir').get_all(project_id, index='project_id')
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    rr = rr.pluck('id', 'name', 'owner', 'datafiles', 'birthtime', 'size')
    rr = rr.order_by('name')
    rr = rr.outer_join(r.table('datafiles')
                       .pluck('id', 'name', 'size', 'owner',
                              'birthtime', 'notes', 'tags'),
                       lambda ddrow, drow: ddrow['datafiles']
                       .contains(drow['id']))
    selection = list(rr.run(g.conn, time_format='raw'))
    return buildTreeFromSelection(selection)


@app.route('/projects/<project_id>/datadirs/tree')
@apikey(shared=True)
@jsonp
def get_datadirs_as_tree_for_project(project_id):
    user = access.get_user()
    rr = r.table('project2datadir').filter({'project_id': project_id})
    rr = rr.eq_join('project_id', r.table('projects')).zip()
    rr = rr.eq_join('datadir_id', r.table('datadirs')).zip()
    rr = rr.pluck('id', 'name', 'owner').order_by('name')
    selection = list(rr.run(g.conn, time_format='raw'))
    if len(selection) > 0 and selection[0]['owner'] != user:
        return args.json_as_format_arg([])
    next_id = 1
    all_data_dirs = {}
    top_level_dirs = []
    ddir = selection[0]
    current_datadir = add_to_top_level(ddir, top_level_dirs)
    all_data_dirs[current_datadir.name] = current_datadir
    for ddir in selection:
        if ddir['name'] != current_datadir.name:
            if ddir['name'] not in all_data_dirs:
                if is_top_level(ddir):
                    dd = add_to_top_level(ddir, top_level_dirs, next_id)
                    next_id = next_id + 1
                    all_data_dirs[dd.name] = dd
                elif ddir['name'] in all_data_dirs:
                    dd = all_data_dirs[ddir['name']]
                else:
                    dd = DItem(ddir['id'], ddir['name'], "datadir")
                    dd.c_id = str(next_id)
                    next_id = next_id + 1
                    all_data_dirs[dd.name] = dd
                    dir_to_add_to = all_data_dirs[dirname(dd.name)]
                    dd.parent_id = dir_to_add_to.c_id
                    dir_to_add_to.children.append(dd)
                current_datadir = dd
            else:
                current_datadir = all_data_dirs[ddir['name']]
    return json.dumps(top_level_dirs, indent=4, cls=DEncoder)


def is_top_level(ddir):
    return "/" not in ddir['name']


def add_to_top_level(ddir, top_level_dirs, c_id):
    item = find_in_ditem_list(ddir['name'], top_level_dirs)
    if not item:
        dd = DItem(ddir['id'], ddir['name'], "datadir")
        dd.c_id = str(c_id)
        top_level_dirs.append(dd)
        item = dd
    return item


def find_in_ditem_list(name, items):
    for item in items:
        if item.name == name:
            return item
    return None


@app.route('/project/provenance/<project_id>', methods=['GET'])
@apikey
@jsonp
def get_provenance(project_id):
    prov = {}
    rr = r.table('project2processes').filter({'project_id': project_id})
    rr = rr.eq_join('process_id', r.table('processes')).zip()
    rr = rr.pluck('id', 'name', 'input_files',
                  'input_conditions', 'output_files', 'output_conditions')
    items = list(rr.run(g.conn, time_format='raw'))
    for process in items:
        prov = {'process': process['name'],
                'input_files': get_datafiles(process['input_files']),
                'output_files': get_datafiles(process['output_files']),
                'input_conditions': get_otherfiles(
                    process['input_conditions']),
                'output_conditions': get_otherfiles(
                    process['output_conditions'])}
    return args.json_as_format_arg(prov)


def get_datafiles(files):
    result = []
    for id in files:
        result.append(dmutil.get_single_from_table('datafiles', id))
    return result


def get_otherfiles(files):
    result = []
    for id in files:
        result.append(dmutil.get_single_from_table('conditions', id))
    return result


@app.route('/projects', methods=['POST'])
@apikey
@crossdomain(origin='*')
def create_project():
    j = request.get_json()
    user = access.get_user()
    name = dmutil.get_required('name', j)
    if validate.project_name_exists(name, user):
        return get_project_toplevel_datadir(name, user)
    datadir_id = make_toplevel_datadir(j, user)
    proj = project.Project(name, datadir_id, user)
    project_id = dmutil.insert_entry_id('projects', proj.__dict__)
    proj2datadir = {'project_id': project_id, 'datadir_id': proj.datadir}
    dmutil.insert_entry('project2datadir', proj2datadir)
    return args.json_as_format_arg(proj2datadir)


def get_project_toplevel_datadir(project, user):
    filter_by = {'name': project, 'owner': user}
    selection = list(r.table('projects').filter(filter_by).run(g.conn))
    proj = selection[0]
    rv = {'project_id': proj['id'], 'datadir_id': proj['datadir']}
    return args.json_as_format_arg(rv)


def make_toplevel_datadir(j, user):
    name = dmutil.get_required('name', j)
    access = dmutil.get_optional('access', j, "private")
    ddir = datadir.DataDir(name, access, user, "")
    return dmutil.insert_entry_id('datadirs', ddir.__dict__)
