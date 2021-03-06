class MCProcessTemplateComponentController {
    /*@ngInject*/
    constructor($scope, editorOpts, processesAPI, toast, $stateParams, mcbus, mcprojstore, mcshow) {
        this.processesAPI = processesAPI;
        this.toast = toast;
        this.projectId = $stateParams.project_id;
        $scope.editorOptions = editorOpts({height: 25, width: 20});
        this.processDescription = this.process.description;
        this.mcbus = mcbus;
        this.mcprojstore = mcprojstore;
        this.mcshow = mcshow;
    }

    $onChanges(changes) {
        this.process = changes.process.currentValue;
        if (!this.process.filesLoaded && this.process.files_count) {
            this.processesAPI.getProcessFiles(this.projectId, this.process.id).then(
                (files) => {
                    this.mcprojstore.updateCurrentProcess(currentProcess => {
                        currentProcess.files = files;
                        currentProcess.filesLoaded = true;
                        return currentProcess;
                    }).then(() => {
                        this.process.files = files;
                        this.process.filesLoaded = true;
                    });
                }
            );
        }
    }

    showJson() {
        this.mcshow.showJson(this.process);
    }

    updateProcessName() {
        if (this.readonly) {
            return;
        }
        this.processesAPI.updateProcess(this.projectId, this.process.id, {name: this.process.name})
            .then(
                () => {
                    if (this.onChange) {
                        this.onChange();
                    }
                    //this.mcbus.send('PROCESS$CHANGE', this.process);
                    this.mcprojstore.updateCurrentProcess(currentProcess => {
                        currentProcess.name = this.process.name;
                        return currentProcess;
                    });
                },
                () => this.toast.error('Unable to update process name')
            );
    }

    updateProcessDescription() {
        if (this.readonly) {
            return;
        }
        if (this.processDescription === this.process.description) {
            return;
        }

        if (this.process.description === null) {
            return;
        }

        this.processesAPI.updateProcess(this.projectId, this.process.id, {description: this.process.description}).then(
            () => this.processDescription = this.process.description,
            () => this.toast.error('Unable to update process description')
        );
    }
}


angular.module('materialscommons').component('mcProcessTemplate', {
    template: require('./mc-process-template.html'),
    controller: MCProcessTemplateComponentController,
    bindings: {
        process: '<',
        onChange: '&',
        readonly: '@'
    }
});
