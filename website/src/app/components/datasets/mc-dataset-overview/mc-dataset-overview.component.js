class MCDatasetOverviewComponentController {
    /*@ngInject*/
    constructor(User, $mdDialog, publicDatasetsAPI) {
        this.isAuthenticated = User.isAuthenticated();
        this.userId = User.u();
        this.$mdDialog = $mdDialog;
        this.showProcessesWorkflow = false;
        this.publicDatasetsAPI = publicDatasetsAPI;
    }

    $onInit() {
        console.log("MCDatasetOverviewComponentController; $onInit(): ", this.dataset);
    }

    $onChanges(changes) {
        if (!changes.dataset.isFirstChange()) {
            this.dataset = changes.dataset.currentValue;
            console.log("dataset changed");
        }
    }

    clickUsefulToggle() {
        console.log("clickUsefulToggle");
        this.onToggleUseful();
    }

    onShowOthersUseful() {
        this.showOthersUsefulDialog()
    }

    showOthersUsefulDialog() {
        let dataset = this.dataset;
        return this.$mdDialog.show({
            templateUrl: 'app/components/datasets/mc-dataset-overview/dialog-show-useful-others.html',
            controller: ShowUsefulOtherDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {
                dataset: dataset
            }
        })
    }

}

angular.module('materialscommons').component('mcDatasetOverview', {
    templateUrl: 'app/components/datasets/mc-dataset-overview/mc-dataset-overview.html',
    controller: MCDatasetOverviewComponentController,
    bindings: {
        dataset: '<',
        onToggleUseful: '&'
    }
});


class ShowUsefulOtherDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    close() {
        this.$mdDialog.hide();
    }

}


