Application.Directives.directive("displayTemplate", displayTemplateDirective);
function displayTemplateDirective() {
    return {
        restrict: "E",
        replace: true,
        scope: {
            template: "=template",
        },
        controller: "displayTemplateDirectiveController",
        templateUrl: "application/core/projects/project/provenance/wizard/display-template.html"
    };
}
Application.Controllers.controller("displayTemplateDirectiveController",
                                   ["$scope", "$state", "pubsub",
                                    displayTemplateDirectiveController]);

function displayTemplateDirectiveController($scope, $state, pubsub) {
    $scope.templateChosen = function() {
        if ($scope.useTemplate) {
            pubsub.send("new-wizard.template.selected", $scope.template.id);
            $state.go("projects.project.new-wizard.create-process", {template_id: $scope.template.id});
        }
    };
}
