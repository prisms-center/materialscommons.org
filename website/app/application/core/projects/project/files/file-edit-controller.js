(function (module) {
    module.controller("FilesEditController", FilesEditController);

    FilesEditController.$inject = ["mcfile", "pubsub","toastr", "file"];

    /* @ngInject */
    function FilesEditController(mcfile, pubsub, toastr, file) {
        var ctrl = this;

        ctrl.newName = "";
        ctrl.renameActive = false;
        ctrl.file = file;
        ctrl.renameFile = renameFile;
        ctrl.updateTags = updateTags;
        ctrl.downloadSrc = downloadSrc;
        ctrl.saveNewNote = saveNewNote;
        ctrl.cancelNote = cancelNote;
        ctrl.updateNote = updateNote;
        ctrl.deleteFile = deleteFile;
        ctrl.addNoteActive = false;
        ctrl.newNote = {
            note: '',
            title: ''
        };

        //////////////////////

        function deleteFile() {

        }

        function updateNote(note) {
            var notes = [];
            notes.push(note);
            file.customPUT({notes: notes}).then(function(f) {
                file.notes = f.notes;
                note.edit = false;
            }).catch(function(err) {
                toastr.error("Failed updating note: " + err.error, "Error");
            });
        }

        function saveNewNote(note) {
            var notes = [];
            notes.push({note: note.note, title: note.title});
            file.customPUT({notes: notes}).then(function(f) {
                file.notes = f.notes;
                ctrl.addNoteActive = false;
                ctrl.newNote.note = '';
                ctrl.newNote.title = '';
            }).catch(function(err) {
                toastr.error("Failed adding note: " + err.error, "Error");
            });
        }

        function cancelNote(note) {
            ctrl.addNoteActive = false;
            note.edit = false;
        }

        function renameFile() {
            if (ctrl.newName === "") {
                return;
            } else if (ctrl.newName === file.name) {
                return;
            }
            file.name = ctrl.newName;
            file.customPUT({name: ctrl.newName}).then(function (f) {
                file.name = f.name;
                ctrl.renameActive = false;
                pubsub.send('files.refresh', file);
            }).catch(function (err) {
                toastr.error("File rename failed: " + err.error, "Error");
            });
        }

        function updateTags() {
            file.customPUT({tags: ctrl.file.tags}).then(function() {
            }).catch(function(err) {
                toastr.error("Failed updating tags: " + err.error, "Error");
            });
        }

        function downloadSrc() {
            return mcfile.downloadSrc(file.id);
        }
    }
}(angular.module('materialscommons')));

////////////////////////////////

//
//function createFolder() {
//    var modalInstance = $modal.open({
//        size: 'sm',
//        templateUrl: 'application/core/projects/project/files/create-folder.html',
//        controller: 'FileModalController',
//        controllerAs: 'folder',
//        resolve: {
//            file: function () {
//                return ctrl.active;
//            }
//        }
//    });
//    modalInstance.result.then(function (name) {
//        mcapi('/datadirs')
//            .success(function (datadir) {
//                datadir.parent = ctrl.active;
//                datadir.group = true;
//                ctrl.active.addFolder = false;
//                ctrl.active.children.push(datadir);
//                pubsub.send('files.refresh');
//            })
//            .error(function (err) {
//                toastr.error("Create folder failed: " + err.error, "Error");
//            })
//            .post({
//                project_id: project.id,
//                parent: ctrl.active.datafile_id,
//                name: ctrl.active.name + '/' + name,
//                level: ctrl.active.level + 1
//            });
//    });
//}