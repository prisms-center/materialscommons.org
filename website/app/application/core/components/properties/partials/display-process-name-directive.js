Application.Directives.directive('displayProcessName', displayProcessNameDirective);
function displayProcessNameDirective() {
    return {
        restrict: "EA",
        scope: true,
        templateUrl: 'application/core/components/properties/partials/display-process-name.html'
    };
}
