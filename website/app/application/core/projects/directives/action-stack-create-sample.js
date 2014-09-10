Application.Directives.directive('actionCreateSample', actionCreateSampleDirective);

function actionCreateSampleDirective() {
    return {
        scope: {},
        controller: "actionCreateSampleController",
        restrict: "A",
        templateUrl: "application/core/projects/directives/action-stack-create-sample.html"
    };
}

Application.Controllers.controller('actionCreateSampleController',
    ["$scope", "mcapi", "$stateParams", "model.projects","$injector", "toaster", actionCreateSampleController]);

function actionCreateSampleController($scope,mcapi,$stateParams, Projects, $injector, toaster) {
    var $validationProvider = $injector.get('$validation');

    $scope.setDefaultProject = function () {
        $scope.doc = {
            name: '',
            notes: [],
            available: true,
            projects: [],
            properties: {'composition': {'value': [], 'unit': ''}}
        };
        $scope.bk = {
            selected_project: '',
            available: '',
            open: '',
            classification: ''
        };
        $scope.doc.projects.push({'id': $scope.project.id, 'name': $scope.project.name});
    };

    $scope.save = function (form) {
        $validationProvider.validate(form);
        var check = $validationProvider.checkValid(form);
        $scope.doc.path = $scope.doc.name;
        $scope.doc.project_id = $scope.project_id;
        if (check === true) {
            mcapi('/objects/new')
                .arg('order_by=birthtime')
                .success(function (data) {
                    toaster.pop('success', "Sample:", "Sample has been successfully created", 3000);
                    $scope.sample_obj = data;
                    mcapi('/objects/%', data.id)
                        .success(function (sample_obj) {
                            $scope.message = "New Sample has been saved.";
                            $scope.toggleCustom = false;

                        }).jsonp();
                    init();
                }).post($scope.doc);
        }else{
            toaster.pop('warning', "Sample:", "Field: 1)Sample Name is required", 5000);
        }
    };

    $scope.populateProjects = function () {
        $scope.doc.projects.push({'id': $scope.bk.selected_project.id, 'name': $scope.bk.selected_project.name});
    };

    $scope.clear = function () {
        $scope.setDefaultProject();
    };

    $scope.removeProjects = function (index) {
       $scope.doc.projects.splice(index, 1);
    };

    function init() {
        $scope.bk = {
            selected_project: ''
        };
        $scope.project_id = $stateParams.id;
        Projects.get($scope.project_id).then(function(project){
            $scope.project = project;
            $scope.setDefaultProject();
        });
       Projects.getList().then(function (data) {
            $scope.projects = data;
        });
    }

    init();
}
