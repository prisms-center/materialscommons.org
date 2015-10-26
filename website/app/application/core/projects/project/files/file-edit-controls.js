(function (module) {
    module.directive('fileEditControls', fileEditControlsDirective);
    function fileEditControlsDirective() {
        return {
            restrict: "E",
            scope: {
                file: "="
            },
            controller: 'FileEditControlsDirectiveController',
            controllerAs: 'ctrl',
            bindToController: true,
            templateUrl: 'application/core/projects/project/files/file-edit-controls.html'
        };
    }

    module.controller('FileEditControlsDirectiveController', FileEditControlsDirectiveController);
    FileEditControlsDirectiveController.$inject = ['mcfile', 'pubsub', 'toastr', 'selectItems'];

    function FileEditControlsDirectiveController(mcfile, pubsub, toastr, selectItems) {
        var ctrl = this;

        ctrl.newName = ctrl.file.name;
        ctrl.renameActive = false;
        ctrl.renameFile = renameFile;
        ctrl.downloadSrc = downloadSrc;
        ctrl.deleteFile = deleteFile;
        ctrl.linkTo = linkTo;

        ////////////////////////////////

        function linkTo(what) {
            switch (what) {
            case "processes":
                displayProcesses();
                break;
            //case "samples":
            //    displaySamples();
            //    break;
            //case "notes":
            //    displayNotes();
            //    break;
            }
        }

        function displayProcesses() {
            selectItems.open('processes').then(function(items) {
                var processCommands = toInputProcessCommands(items.processes).
                    concat(toOutputProcessCommands(items.processes));
                ctrl.file.customPUT({processes: processCommands}).then(function() {
                });
            });
        }

        function toInputProcessCommands(processes) {
            return processes.filter(function(p) {
                return p.input;
            }).map(function(p) {
                return {
                    command: 'add',
                    process_id: p.id,
                    direction: 'in'
                };
            });
        }

        function toOutputProcessCommands(processes) {
            return processes.filter(function(p) {
                return p.output;
            }).map(function(p) {
                return {
                    command: 'add',
                    process_id: p.id,
                    direction: 'out'
                };
            });
        }

        function deleteFile() {
            //TODO: Ask user if they really wants to delete the file.
            ctrl.file.remove().then(function () {
                // do something here with deleted the file.
            }).catch(function (err) {
                toastr.error("File deletion failed: " + err.error, "Error");
            });
        }

        function renameFile() {
            if (ctrl.newName === "") {
                return;
            } else if (ctrl.newName === ctrl.file.name) {
                ctrl.renameActive = false;
                return;
            }
            ctrl.file.name = ctrl.newName;
            ctrl.file.customPUT({name: ctrl.newName}).then(function (f) {
                ctrl.file.name = f.name;
                ctrl.renameActive = false;
                pubsub.send('files.refresh', ctrl.file);
            }).catch(function (err) {
                toastr.error("File rename failed: " + err.error, "Error");
            });
        }

        function downloadSrc() {
            return mcfile.downloadSrc(ctrl.file.id);
        }
    }

}(angular.module('materialscommons')));

