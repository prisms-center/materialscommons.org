from ..mcapp import app
from ..decorators import crossdomain, apikey, jsonp
from flask import jsonify, g, request, send_from_directory
from ..utils import mkdirp
import rethinkdb as r
import os.path
import os
from ..args import json_as_format_arg
import tempfile
from loader.tasks.db import load_data_dir, import_data_dir_to_repo
from celery import chain
from .. import access

@app.route('/udqueue')
@apikey
@jsonp
def get_udqueue():
    user = access.get_user()
    selection = list(r.table('udqueue').filter({'owner':user}).run(g.conn))
    return json_as_format_arg(selection)

@app.route('/upload', methods=['POST'])
@apikey
@crossdomain(origin='*')
def upload_file():
    user = access.get_user()
    state_id = request.form['state_id']
    mkdirp('/tmp/uploads')
    tdir = tempfile.mkdtemp(dir='/tmp/uploads')
    for key in request.files.keys():
        datadir = request.form[key + "_datadir"]
        file = request.files[key]
        dir = os.path.join(tdir, datadir)
        mkdirp(dir)
        filepath = os.path.join(dir, file.filename)
        file.save(filepath)
    chain(load_data_dir.si(user, tdir, state_id)\
          | import_data_dir_to_repo.si(tdir))()
    return jsonify({'success': True})

@app.route('/download/<path:datafile>')
#@apikey
def download_file(datafile):
    user = access.get_user()
    return send_from_directory('/tmp', 'ReviewQueue.png', as_attachment=True)
    #df = r.table('datafiles').get(datafile).run(g.conn)
    #if not checkAccess(user, df):
    #   return error_not_found_response()
    #return None
