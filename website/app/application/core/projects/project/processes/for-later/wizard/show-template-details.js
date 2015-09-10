(function (module) {
    module.directive("showTemplateDetails",
        ["RecursionHelper", showTemplateDetailsDirective]);
    function showTemplateDetailsDirective(RecursionHelper) {
        return {
            restrict: "E",
            replace: true,
            scope: {
                template: "=template",
            },
            controller: "showTemplateDetailsDirectiveController",
            templateUrl: "/show-template-details.html",
            compile: function (element) {
                return RecursionHelper.compile(element, function (scope, iElement, iAttrs, controller, transcludeFn) {
                });
            }
        };
    }

    module.controller("showTemplateDetailsDirectiveController", showTemplateDetailsDirectiveController)
    showTemplateDetailsDirectiveController.$inject = ["$scope", "templateConstructer"];

    function showTemplateDetailsDirectiveController($scope, templateConstructer) {
        $scope.template = templateConstructer.constructTemplate($scope.template);
    }

}(angular.module('materialscommons')));
