

/*@ngInject*/
class MCExperimentProcessesTableComponentController {
    constructor($mdDialog) {
        this.sortOrder = "name";
        this.$mdDialog = $mdDialog;
    }

    showProcess(process) {
        this.$mdDialog.show({
            templateUrl: 'app/modals/show-process-dialog.html',
            controllerAs: '$ctrl',
            controller: ShowProcessDialogController,
            bindToController: true,
            locals: {
                process: process
            }
        });
    }
}

class ShowProcessDialogController {
    /*@ngInject*/
    constructor($mdDialog) {
        this.$mdDialog = $mdDialog;
    }

    done() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('mcExperimentProcessesTable', {
    template: require('./mc-experiment-processes-table.html'),
    controller: MCExperimentProcessesTableComponentController,
    bindings: {
        processes: '<',
        filterBy: '='
    }
});
