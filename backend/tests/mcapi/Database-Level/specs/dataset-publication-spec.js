'use strict';
require('mocha');
import {it} from 'mocha';
require('co-mocha');
const _ = require('lodash');
const chai = require('chai');
const assert = chai.assert;
const should = chai.should();

const r = require('rethinkdbdash')({
    db: process.env.MCDB || 'materialscommons',
    port: process.env.MCDB_PORT || 30815
});
const mcapi_base = '../../../../servers/mcapi';
const backend_base = mcapi_base + "/db/model";
const build_project_base = mcapi_base + "/build-demo";

const dbModelUsers = require(backend_base + '/users');
const projects = require(backend_base + '/projects');
const directories = require(backend_base + '/directories');
const experiments = require(backend_base + '/experiments');
const processes = require(backend_base + '/processes');
const experimentDatasets = require(backend_base + '/experiment-datasets');

const helper = require(build_project_base + '/build-demo-project-helper');
const demoProjectConf = require(build_project_base + '/build-demo-project-conf');
const buildDemoProject = require(build_project_base + '/build-demo-project');

const base_project_name = "Test directory";

let random_name = function () {
    let number = Math.floor(Math.random() * 10000);
    return base_project_name + number;
};

let userId = "test@test.mc";

let project = null;
let experiment = null;
let process_list = null;
let sample_list = null;
let file_list = null;
let dataset1 = null;
let dataset2 = null;

before(function*() {

    this.timeout(8000); // this test suite can take up to 8 seconds

    let user = yield dbModelUsers.getUser(userId);
    assert.isOk(user, "No test user available = " + userId);
    assert.equal(userId, user.id);

    let valOrError = yield buildDemoProject.findOrBuildAllParts(user, demoProjectConf.datapathPrefix);
    assert.isUndefined(valOrError.error, "Unexpected error from createDemoProjectForUser: " + valOrError.error);
    let results = valOrError.val;
    project = results.project;
    experiment = results.experiment;
    process_list = results.processes;
    sample_list = results.samples;
    file_list = results.files;

    let project_id = project.id;
    let experiment_id = experiment.id;

    let name = random_name();
    let description = "Changed the name of the demo project to " + name;
    let updateData = {
        name: name,
        description: description
    };
    let updated_project = yield projects.update(project.id, updateData);
    assert.equal(updated_project.otype, "project");
    assert.equal(updated_project.owner, userId);
    assert.equal(updated_project.name, name);
    assert.equal(updated_project.description, description);
    assert.equal(updated_project.id, project_id);
    project = updated_project;

    // dataset1 contains a process with samples, should be able to publish.
    let processesToAdd = [
        {id: process_list[0].id}
    ];

    let processesToDelete = [];

    let datasetArgs = {
        title: "Test Dataset1",
        description: "Dataset for testing"
    };

    results = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    dataset1 = results.val;
    assert.isOk(dataset1);

    results = yield experimentDatasets.updateProcessesInDataset(dataset1.id, processesToAdd, processesToDelete);
    dataset1 = results.val;
    assert.isOk(dataset1);
    assert.isOk(dataset1.processes);
    assert.equal(dataset1.processes.length, 1);

    let probe = dataset1.processes[0];
    assert.equal(probe.otype, "process");
    assert.equal(probe.template_id, 'global_Create Samples');
    assert.equal(probe.output_samples.length, 1);
    assert.equal(probe.category, 'create_sample');


    // dataset2 contains no processes or samples, should not do able to publish.
    datasetArgs = {
        title: "Test Dataset2",
        description: "Dataset for testing"
    };

    results = yield experimentDatasets.createDatasetForExperiment(experiment_id, userId, datasetArgs);
    dataset2 = results.val;
    assert.isOk(dataset2);
    assert.isOk(dataset2.processes);
    assert.equal(dataset2.processes.length, 0);

    results = yield experimentDatasets.getDatasetsForExperiment(experiment_id);
    let dataset_list = results.val;
    assert.isOk(dataset_list);
    assert.equal(dataset_list.length, 2);

});

describe('Feature - Datasets: ', function () {
    describe('publication: ', function () {
        it("publishes a dataset with processes and samples",function* (){
            let results = yield experimentDatasets.publishDataset(dataset1.id);
            assert.isOk(results);
            assert.isOk(results.val);
            let dataset = results.val;
            assert.equal(dataset.otype,'dataset');
            assert.isTrue(dataset.published);
        });
        it("will not publish a dataset without processes or samples", function* (){
            let results = yield experimentDatasets.publishDataset(dataset2.id);
            assert.isOk(results);
            assert.isOk(results.error);
            let error = results.error;
            assert.isTrue(error.startsWith("Can not publish dataset"));
            assert.isTrue(error.endsWith(" it needs both processes and samples."));
        });
    });
});