class ProcessesAPIService {
    constructor(projectsAPIRoute, Restangular, toast) {
        this.projectsAPIRoute = projectsAPIRoute;
        this.Restangular = Restangular;
        this.toast = toast;
    }

    addSamplesToProcess(projectId, processId, samples, createSamples) {
        return this.Restangular.one('v3').one('addSamplesToProcess').customPOST({
            project_id: projectId,
            process_id: processId,
            samples: samples ? samples : [],
            create_samples: createSamples ? createSamples : [],
        }).then(
            (p) => p.plain().data,
            (e) => this.toast.error(e.data ? e.data.error : 'Failed adding samples to process')
        );
    }

    createProcess(projectId, experimentId, name) {
        return this.Restangular.one('v3').one('createProcess').customPOST({
            project_id: projectId,
            experiment_id: experimentId,
            name: name,
        }).then(
            p => p.plain().data,
            e => this.toast.error(e.data ? e.data.error : 'Failed creating process')
        );
    }

    ///////////////////////////////

    updateProcess(projectId, processId, updateArgs) {
        return this.projectsAPIRoute(projectId).one('processes', processId)
            .customPUT(updateArgs).then(p => p.plain());
    }

    getProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get().then(p => p.plain());
    }

    getDeleteProcessPreConditions(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).get();
    }

    deleteProcess(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).remove();
    }

    getProcessFiles(projectId, processId) {
        return this.projectsAPIRoute(projectId).one('processes', processId).one('files').getList()
            .then(files => files.plain());
    }

    updateFilesInProcess(projectId, processId, fileIdsToAdd, fileIdsToDelete) {
        let toAdd = fileIdsToAdd.map(fid => ({command: 'add', id: fid}));
        let toDelete = fileIdsToDelete.map(fid => ({command: 'delete', id: fid}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            files: toAdd.concat(toDelete)
        }).then(p => p.plain());
    }

    updateSamplesInProcess(projectId, processId, samplesToAdd, samplesToDelete) {
        let toAdd = samplesToAdd.map(s => ({command: 'add', id: s.id, property_set_id: s.property_set_id}));
        let toDelete = samplesToDelete.map(s => ({command: 'delete', id: s.id, property_set_id: s.property_set_id}));
        return this.projectsAPIRoute(projectId).one('processes', processId).customPUT({
            samples: toAdd.concat(toDelete)
        }).then(p => p.plain());
    }
}

angular.module('materialscommons').service('processesAPI', ProcessesAPIService);
