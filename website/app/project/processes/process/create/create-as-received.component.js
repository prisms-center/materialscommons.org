(function(module) {
    module.component('mcProcessCreateAsReceived', {
        templateUrl: 'project/processes/process/create/create-as-received.html',
        controller: 'MCProcessCreateAsReceivedComponentController'
    });

    module.controller('MCProcessCreateAsReceivedComponentController', MCProcessCreateAsReceivedComponentController);
    MCProcessCreateAsReceivedComponentController.$inject = [
        'template', 'processSelections', 'prepareCreatedSample', 'createProcess', 'toastr', 'previousStateService',
        '$state'
    ];
    function MCProcessCreateAsReceivedComponentController(template, processSelections,
                                                          prepareCreatedSample, createProcess,
                                                          toastr, previousStateService, $state) {
        var ctrl = this;
        ctrl.process = template.get();
        ctrl.sample = {
            name: '',
            description: '',
            old_properties: [],
            new_properties: [],
            files: []
        };
        ctrl.composition = {value: []};
        ctrl.sampleGroup = false;
        ctrl.sampleGroupSizing = 'set-size';
        ctrl.sampleGroupSize = 10;

        ctrl.chooseSamples = _.partial(processSelections.selectSamples, ctrl.process.input_samples);
        ctrl.chooseInputFiles = _.partial(processSelections.selectFiles, ctrl.process.input_files);
        ctrl.chooseOutputFiles = _.partial(processSelections.selectFiles, ctrl.process.output_files);
        ctrl.remove = removeById;
        ctrl.submit = submit;
        ctrl.submitAndAnother = submitAndAnother;
        ctrl.cancel = previousStateService.go;
        previousStateService.setMemo('process_create_previous', 'project.processes.create');

        /////////////////

        function submitAndAnother() {
            var go = _.partial($state.go, 'project.processes.create', {
                template_id: ctrl.process.process_name,
                process_id: ''
            });
            performSubmit(go);
        }

        function submit() {
            var go = _partial(previousStateService.go, 'process_create_previous');
            performSubmit(go);
        }

        function performSubmit(goFn) {
            if (ctrl.sample.name === '') {
                toastr.error("You must specify a sample name", 'Error', {closeButton: true});
                return;
            }
            prepareSample();
            createProcess($stateParams.project_id, ctrl.process)
                .then(
                    function success() {
                        ctrl.composition.value.length = 0;
                        goFn();
                    },

                    function failure() {
                        toastr.error('Unable to create sample', 'Error', {closeButton: true});
                    }
                );
        }

        function prepareSample() {
            prepareCreatedSample.filloutComposition(ctrl.sample, ctrl.composition);
            prepareCreatedSample.setupSampleGroup(sample, ctrl.sampleGroup, ctrl.sampleGroupSizing,
                ctrl.sampleGroupSize);
            prepareCreatedSample.addSampleInputFiles(sample, ctrl.process.input_files);
        }
    }
}(angular.module('materialscommons')));
