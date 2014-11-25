Application.Controllers.controller("projectNotesEdit",
    ["$scope", "project", "User", "$stateParams", "recent", "projectState", "mcapi", projectNotesEdit]);

function projectNotesEdit($scope, project, User, $stateParams, recent, projectState, mcapi) {
    var stateID = $stateParams.sid;
    $scope.project = project;

    function saveNote() {
        mcapi('/notes')
            .success(function (note) {
                $scope.project.notes[$scope.index] = note;
                recent.gotoLast($scope.project.id);
            }).put({'title': $scope.model.title, 'note': $scope.model.note, 'id': $scope.model.id});
    }

    $scope.updateNote = function () {
        saveNote();
        $scope.edit_index = -1;
    };

    $scope.cancel = function () {
        recent.delete($scope.project.id, stateID);
        projectState.delete($scope.project.id, stateID);
        recent.gotoLast($scope.project.id);
    };

    function init() {
        var note_id = $stateParams.note_id;
        $scope.index = _.indexOf(project.notes, function (each_note) {
            return note_id === each_note.id;
        });
        if ($scope.index > -1) {
            $scope.model = project.notes[$scope.index];
        }
    }

    init();
}
