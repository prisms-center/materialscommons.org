Application.Directives.directive('homeSamples', homeSamplesDirective);

function homeSamplesDirective() {
    return {
        restrict: "A",
        controller: 'homeSamplesController',
        scope: {
            project: '=project'
        },
        templateUrl: 'application/core/projects/project/home/directives/home-samples.html'
    };
}

Application.Controllers.controller("homeSamplesController",
                                   ["$scope", "ui",
                                    homeSamplesController]);

function homeSamplesController($scope, ui) {

    $scope.project.samples.forEach(function(sample) {
        if (!('showDetails' in sample)) {
            sample.showDetails = false;
        }
    });

    $scope.minimize = function() {
        ui.togglePanelState($scope.project.id, 'samples');
    };

    $scope.toggleExpanded = function() {
        ui.toggleIsExpanded($scope.project.id, "samples");
    };

    $scope.isExpanded = function() {
        return ui.isExpanded($scope.project.id, "samples");
    };

    $scope.createSample = function(){
        $scope.model.createSample = true;
    };

    $scope.splitScreen = function(what, col){
        ui.toggleColumns($scope.project.id, what, col);
    };

    $scope.isSplitExpanded = function () {
        return ui.getSplitStatus($scope.project.id);
    };

    $scope.model = {
        createSample: false
    };
}
