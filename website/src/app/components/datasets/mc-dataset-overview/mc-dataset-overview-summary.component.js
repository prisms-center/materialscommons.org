class MCDatasetOverviewSummaryComponentController {
    /*@ngInject*/
    constructor(User) {
        this.isAuthenticated = User.isAuthenticated();
    }
}

angular.module('materialscommons').component('mcDatasetOverviewSummary', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview-summary.html',
    controller: MCDatasetOverviewSummaryComponentController,
    bindings: {
        dataset: '<'
    }
});