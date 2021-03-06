class MCDirComponentController {
    /*@ngInject*/
    constructor(mcFileOpsDialogs) {
        this.mcFileOpsDialogs = mcFileOpsDialogs;
        this.selected = false;
        this.selectedFiles = [];
        this.moveFiles = false;
    }

    $onInit() {
        this.isNotRoot = this.dir.data.path.indexOf('/') !== -1;
    }

    $onChanges(changes) {
        if (changes.dir) {
            this.dir = changes.dir.currentValue;
            this.isNotRoot = this.dir.data.path.indexOf('/') !== -1;
        }
    }

    onSelected(selected) {
        this.selected = selected.length !== 0;
        this.selectedFiles = selected;
    }

    renameDirectory() {
        this.mcFileOpsDialogs.renameDirectory(this.dir.data.name).then(name => this.onRenameDir({dir: this.dir, newDirName: name}));
    }

    createDirectory() {
        this.mcFileOpsDialogs.createDirectory(this.dir.data.name).then(name => this.onCreateDir({parent: this.dir, createDirName: name}));
    }

    deleteDir() {
        this.mcFileOpsDialogs.deleteDir(this.dir.data).then(
            () => this.onDelete({items: [this.dir.data]})
        );
    }

    uploadFiles() {
        this.onUploadFiles();
    }

    handleDownloadFiles() {
        this.downloadState = 'preparing';
        this.onDownloadFiles({files: this.selectedFiles}).then(
            downloadUrl => {
                this.downloadUrl = downloadUrl;
                this.downloadState = 'done';
            }
        );
    }

    handleMove(item) {
        return this.onMove({dir: this.dir, file: item});
    }

    handleDelete() {
        this.mcFileOpsDialogs.deleteFiles(this.selectedFiles).then(
            () => this.onDelete({dir: this.dir, files: this.selectedFiles})
        );
    }
}

angular.module('materialscommons').component('mcDir', {
    template: require('./mc-dir.html'),
    controller: MCDirComponentController,
    bindings: {
        dir: '<',
        onRenameDir: '&',
        onCreateDir: '&',
        onUploadFiles: '&',
        onDownloadFiles: '&',
        onDelete: '&',
        onMove: '&'
    }
});
