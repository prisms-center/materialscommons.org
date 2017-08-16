class MCWorkflowFiltersComponentController {
    /*@ngInject*/
    constructor(experimentsAPI, $stateParams) {
        this.experimentsAPI = experimentsAPI;

        this.projectId = $stateParams.project_id;
        this.experimentId = $stateParams.experiment_id;
        this.showSamplesFilter = false;
        this.showProcessesFilter = true;
    }

    $onInit() {
        this.activateProcessesFilter();
    }

    activateProcessesFilter() {
        this.experimentsAPI.getProcessesForExperiment(this.projectId, this.experimentId).then(
            (processes) => {
                this.showProcessesFilter = true;
                this.showSamplesFilter = false;
                this.processes = processes;
            }
        );
    }

    activateSamplesFilter() {
        this.experimentsAPI.getSamplesForExperiment(this.projectId, this.experimentId).then(
            (samples) => {
                this.showProcessesFilter = false;
                this.showSamplesFilter = true;
                this.samples = samples;
            }
        );
    }
}

angular.module('materialscommons').component('mcWorkflowFilters', {
    templateUrl: 'app/project/experiments/experiment/components/workflow/mc-workflow-filters.html',
    controller: MCWorkflowFiltersComponentController
});