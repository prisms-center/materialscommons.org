module.exports = function(r) {

    async function allFilesInProject(projectId, fileIds) {
        let indexArgs = fileIds.map(fid => [projectId, fid]);
        let matches = await r.table('project2datafile').getAll(r.args(indexArgs), {index: 'project_datafile'});
        return matches.length === fileIds.length;
    }

    async function allSamplesInProject(projectId, sampleIds) {
        let indexArgs = sampleIds.map(sid => [projectId, sid]);
        let matches = await r.table('project2sample').getAll(r.args(indexArgs), {index: 'project_sample'});
        return matches.length === sampleIds.length;
    }

    async function datasetInProject(datasetId, projectId) {
        let d = await r.table('project2dataset').getAll([projectId, datasetId], {index: 'project_dataset'});
        return d.length !== 0;
    }

    async function directoryInProject(directoryId, projectId) {
        let entry = await r.table('project2datadir').getAll([projectId, directoryId], {index: 'project_datadir'});
        return entry.length !== 0;
    }

    async function isProjectOwner(projectId, userId) {
        let project = await r.table('projects').get(projectId);
        return project.owner === userId;
    }

    return {
        allFilesInProject,
        allSamplesInProject,
        datasetInProject,
        directoryInProject,
        isProjectOwner,
    };
};