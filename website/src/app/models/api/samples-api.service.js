class SamplesAPIService {
    constructor(projectsAPIRoute) {
        this.projectsAPIRoute = projectsAPIRoute;
    }

    addSamplesToExperiment(projectId, experimentId, sampleIds) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples')
            .customPOST({samples: sampleIds});
    }

    createSamplesInProjectForProcess(projectId, processId, samples) {
        return this.projectsAPIRoute(projectId).one('samples').customPOST({process_id: processId, samples: samples});
    }

    getProjectSamples(projectID) {
        return this.projectsAPIRoute(projectID).one('samples').getList();
    }

    getProjectSample(projectId, sampleId) {
        return this.projectsAPIRoute(projectId).one('samples', sampleId).get();
    }

    deleteSamplesFromExperiment(projectId, experimentId, processId, sampleIds) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').one('delete')
            .customPOST({process_id: processId, samples: sampleIds});
    }

    updateSampleInExperiment(projectId, experimentId, processId, sample) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples')
            .customPUT({
                process_id: processId,
                samples: [sample]
            });
    }

    addMeasurementsToSamples(projectId, experimentId, processId, samplesMeasurements) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').one('measurements')
            .customPOST({
                process_id: processId,
                properties: samplesMeasurements
            });
    }

    updateMeasurementsToSamples(projectId, experimentId, processId, samplesMeasurements) {
        return this.projectsAPIRoute(projectId).one('experiments', experimentId).one('samples').one('measurements')
            .customPUT({
                process_id: processId,
                properties: samplesMeasurements
            });
    }

    createSamplesPropertyMeasurements(samples, addAs, property, measurements) {
        if (addAs !== 'shared' && addAs !== 'separate') {
            return null;
        }
        return {
            samples: samples,
            add_as: addAs,
            property: property,
            measurements: measurements
        }
    }

    createProperty(name, attribute) {
        return {
            name: name,
            attribute: attribute
        }
    }

    createMeasurement(otype, property, unit, value) {
        return {
            name: property.name,
            attribute: property.attribute,
            otype: otype,
            unit: unit,
            value: value
        }
    }

    updateSampleFiles(projectId, sampleId, filesToAdd, filesToDelete) {
        let toAdd = filesToAdd.map(f => ({command: 'add', id: f.id}));
        let toDelete = filesToDelete.map(f => ({command: 'delete', id: f.id}));
        return this.projectsAPIRoute(projectId).one('samples', sampleId).one('files').customPUT({
            files: toAdd.concat(toDelete)
        });
    }
}

angular.module('materialscommons').service('samplesAPI', SamplesAPIService);