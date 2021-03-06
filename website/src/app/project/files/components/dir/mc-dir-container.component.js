class MCDirContainerComponentController {
    /*@ngInject*/
    constructor($stateParams, mcStateStore, gridFiles, projectFileTreeAPI, fileTreeMoveService, fileTreeDeleteService, $state, $timeout) {
        this.$stateParams = $stateParams;
        this.mcStateStore = mcStateStore;
        this.gridFiles = gridFiles;
        this.projectFileTreeAPI = projectFileTreeAPI;
        this.fileTreeMoveService = fileTreeMoveService;
        this.fileTreeDeleteService = fileTreeDeleteService;
        this.$state = $state;
        this.$timeout = $timeout;
        /*
        The updated flag is used to toggle which mc-dir component is displayed. This is a work around since
        AngularJS is not detecting changes in the dir.children array. Toggling the flag causes the mc-dir
        component in the template to re-render so changes are picked up.
         */
        this.updated = false;
    }

    $onInit() {
        this._loadDir();
    }

    _loadDir() {
        this.project = this.mcStateStore.getState('project');
        const entry = this.gridFiles.findEntry(this.project.files[0], this.$stateParams.dir_id);
        if (!entry) {
            console.log(`MCDirContainer: Couldn't find entry ${this.$stateParams.dir_id}`)
        }
        this.dir = entry.model;

    }

    handleRenameDir(newDirName) {
        this.projectFileTreeAPI.renameProjectDir(this.$stateParams.project_id, this.$stateParams.dir_id, newDirName)
            .then((d) => this._updateCurrentProj(() => {
                this.dir.data.name = newDirName;
                this.dir.data.path = d.path
            }));
    }

    handleCreateDir(createDirName) {
        this.projectFileTreeAPI.createProjectDir(this.$stateParams.project_id, this.$stateParams.dir_id, createDirName).then(
            (d) => {
                let newDir = {
                    expanded: false,
                    children: [],
                    data: {
                        id: d.id,
                        name: createDirName,
                        path: d.name, // Returned value for path is in name field
                        otype: 'directory'
                    }
                };
                this._updateCurrentProj(() => this.dir.children.push(newDir));
            }
        );
    }

    handleDelete(items) {
        for (let file of items) {
            if (file.otype === 'file') {
                this.fileTreeDeleteService.deleteFile(this.$stateParams.project_id, file.id).then(
                    () => {
                        const i = _.findIndex(this.dir.children, (f) => f.data.id === file.id);
                        if (i !== -1) {
                            this._updateCurrentProj(() => {
                                this.dir.children.splice(i, 1);
                                this.updated = !this.updated;
                            });
                        }
                    }
                );
            } else {
                this.fileTreeDeleteService.deleteDir(this.$stateParams.project_id, file.id).then(
                    () => {
                        let parentDir = this.gridFiles.findParent(this.project.files[0], this.dir);
                        parentDir = parentDir.model;
                        const i = _.findIndex(parentDir.children, (f) => f.data.id === file.id);
                        if (i !== -1) {
                            this._updateCurrentProj(() => {
                                parentDir.children.splice(i, 1);
                                this.updated = !this.updated;
                            });
                        }
                        const root = this.fileTreeMoveService.getTreeRoot();
                        this.$state.go('project.files.dir', {dir_id: root.model.data.id})//, {reload: true});
                    }
                );
            }
        }
    }

    handleUploadFiles() {
        this.$state.go('project.files.uploads2', {directory_id: this.dir.data.id});
    }

    _updateCurrentProj(fn) {
        return this.mcprojstore.updateCurrentProject(() => {
            fn();
            return this.project;
        });
    }

    handleDownloadFiles(files) {
        const fileIds = files.map(f => f.id);
        return this.projectFileTreeAPI.downloadProjectFiles(fileIds);
    }

    handleMove(item) {
        if (this._itemAlreadyInDir(item.data.id)) {
            return false;
        }
        if (item.data.otype === 'file') {
            this._moveFile(item);
        } else {
            this._moveDir(item);
        }
        return true;
    }

    _itemAlreadyInDir(itemId) {
        for (let entry of this.dir.children) {
            if (entry.data.id === itemId) {
                return true;
            }
        }

        return false;
    }

    _moveFile(file) {
        const root = this.fileTreeMoveService.getTreeRoot();
        const node = this.fileTreeMoveService.findNodeByID(root, file.data.id);
        const nodePath = node.getPath();
        const fileDir = nodePath[nodePath.length - 2].model;
        this.fileTreeMoveService.moveFile(file.data.id, fileDir.data.id, this.dir.data.id).then(
            () => this.dir.children.push(file)
        );
    }

    _moveDir(dir) {
        this.fileTreeMoveService.moveDir(dir.data.id, this.dir.data.id).then(
            () => this.dir.children.push(dir)
        );
    }
}

angular.module('materialscommons').component('mcDirContainer', {
    template: require('./mc-dir-container.html'),
    controller: MCDirContainerComponentController
});
