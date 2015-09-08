(function (module) {
    module.controller('setupInstanceController',setupInstanceController);
    setupInstanceController.$inject = ["$scope", "project", "$state", "$log", "modal", "processTemplates"];

    function setupInstanceController($scope, project, $state, $log, modal, processTemplates) {
        $scope.modal = modal;
        $scope.selected = {
            item: {}
        };
        var template = processTemplates.getActiveTemplate();

        $scope.settings = template.setup.settings[0].properties;

        $scope.ok = function () {
            $scope.modal.instance.close($scope.selected.item);
            //pubsub.send('addSetupToSample', $scope.selected.item);
            $state.go('projects.project.processes.create');
        };

        $scope.cancel = function () {
            $scope.modal.instance.dismiss('cancel');
        };

        $scope.modal.instance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;

        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    }
}(angular.module('materialscommons')));
