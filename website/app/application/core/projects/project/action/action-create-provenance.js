Application.Directives.directive('actionCreateProvenance2', actionCreateProvenance2);

function actionCreateProvenance2() {
    return {
        scope: {
            project: "="
        },
        controller: "actionCreateProvenanceController2",
        restrict: "AE",
        templateUrl: "application/core/projects/project/action/action-create-provenance.html"
    };
}

Application.Controllers.controller('actionCreateProvenanceController2',
                                   ["$scope", "$stateParams", "model.templates",
                                    "model.projects", "User", "$filter", "pubsub",
                                    actionCreateProvenanceController2]);

function actionCreateProvenanceController2($scope, $stateParams, templates, projects,
                                          User, $filter) {

    function setupCurrentDraft() {
        $scope.project.currentDraft.process = {
            name: "",
            description: "",
            run_dates: [],
            notes: [],
            tags: [],
            custom_properties:{},
            stepType: "process",
            currentStep: "process",
            additional_properties: {}
        };

        $scope.project.currentDraft.inputs = {};
        $scope.project.currentDraft.outputs = {};
        $scope.project.selectedTemplate.input_templates.forEach(function(t) {
            $scope.project.currentDraft.inputs[t.id] = {};
            $scope.project.currentDraft.inputs[t.id].properties = {};
            $scope.project.currentDraft.inputs[t.id].custom_properties = {};
            $scope.project.currentDraft.inputs[t.id].additional_properties = {};
            t.default_properties.forEach(function(p) {
                $scope.project.currentDraft.inputs[t.id].properties[p.attribute] = {
                    value: "",
                    unit: ""
                };
            });
            if (t.template_pick == "pick_sample") {
                $scope.project.currentDraft.inputs[t.id].properties.sample = {
                    id: "",
                    value: "",
                    unit: "n/a"
                };
            }
        });

        if ($scope.project.selectedTemplate.required_input_files) {
            $scope.project.currentDraft.inputs["files"] = [];
        }

        $scope.project.selectedTemplate.output_templates.forEach(function(t) {
            $scope.project.currentDraft.outputs[t.id] = {};
            $scope.project.currentDraft.outputs[t.id].properties = {};
            $scope.project.currentDraft.outputs[t.id].custom_properties = {};
            $scope.project.currentDraft.outputs[t.id].additional_properties = {};
            t.default_properties.forEach(function(p) {
                $scope.project.currentDraft.outputs[t.id].properties[p.attribute] = {
                    value: "",
                    unit: ""
                };
            });
            if (t.template_pick == "pick_sample") {
                $scope.project.currentDraft.outputs[t.id].properties.sample = {
                    value: "",
                    unit: "n/a"
                };
            }
        });

        if ($scope.project.selectedTemplate.required_input_files) {
            $scope.project.currentDraft.outputs["files"] = [];
        }
    }

    $scope.start = function() {
        var templateName = $scope.project.selectedTemplate.template_name;
        var title = "Wizard Process Step (" + templateName + ")";
        $scope.showChooseProcess = false;
        $scope.toggleStackAction('create-provenance');
        $scope.toggleStackAction('wizard-process-step', title);
        setupCurrentDraft();
    };

    $scope.cancel = function() {
        $scope.wizard.showOverview = false;
        $scope.toggleStackAction('create-provenance');
    };

    function init() {
        console.log("init for action-create-provenance");
        templates.getList().then(function(templates) {
            $scope.templates = $filter('byKey')(templates, 'template_type', 'process');

            // Set the category name for sorting purposes
            $scope.templates.forEach(function(template) {
                template.category = "Process - " + template.category;
            });
            // Add the preferred templates
            if (User.attr().preferences.templates.length !== 0) {
                User.attr().preferences.templates.forEach(function(t) {
                    var template = $filter('byKey')(templates, 'id', t.id);
                    var preferred;
                    if (template) {
                        preferred = angular.copy(template[0]);
                        preferred.category = "Preferred";
                        $scope.templates.push(preferred);
                    }
                });
            }
        });

        projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
            $scope.project.selectedTemplate = "";
            $scope.project.currentDraft = {
            };
        });

        $scope.showChooseProcess = true;

        $scope.wizard = {
            showOverview: false
        };
    }

    init();
}
