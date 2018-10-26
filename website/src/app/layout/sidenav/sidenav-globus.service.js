class SidenavGlobusService {
    /*@ngInject*/
    constructor(User, etlServerAPI, $mdDialog) {
        this.User = User;
        this.etlServerAPI = etlServerAPI;
        this.$mdDialog = $mdDialog;
    }

    globusDownload(project) {
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-download-dialog.html',
                controller: GlobusDownloadDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    globusUpload(project) {
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-upload-url-dialog.html',
                controller: GlobusUploadTransferDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    showGlobusTasks(project) {
        return this.$mdDialog.show({
                templateUrl: 'app/modals/globus-report-status-dialog.html',
                controller: GlobusReportStatusDialogController,
                controllerAs: '$ctrl',
                bindToController: true,
                locals: {
                    project: project,
                }
            }
        );
    }

    loginToGlobus() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/globus-login-logout-dialog.html',
            controller: GlobusLoginLogoutDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {}
        });
    }

    logoutFromGlobus() {
        return this.$mdDialog.show({
            templateUrl: 'app/modals/globus-login-logout-dialog.html',
            controller: GlobusLoginLogoutDialogController,
            controllerAs: '$ctrl',
            bindToController: true,
            locals: {}
        });
    }

    isAuthenticated() {
        return this.etlServerAPI.getGlobusAuthStatus().then(authStatus => authStatus.status.authenticated, () => false);
    }
}

class GlobusUploadTransferDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI, globusEndpointSaver) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.globusEndpointSaver = globusEndpointSaver;
        let globusEndpoint = globusEndpointSaver.getNonEtlEndpoint();
        this.endpoint = globusEndpoint.uuid;
        this.endpointPath = globusEndpoint.path;
        this.uploadName = 'undefined';
        this.uploadUniquename = 'undefined';
        this.uploadId = 'undefined';
        this.status = '';
        this.endpoint_id = 'abddfdbe-bdcb-11e8-8c1e-0a1d4c5c824a';
        this.fake_url = 'https://www.globus.org/app/transfer?destination_id=abddfdbe-bdcb-11e8-8c1e-0a1d4c5c824a&destination_path=%2F__upload_staging%2Fproject-8afbb6ab-73c7-4f76-97ca-82960ff7144b%2Fupload-abddfdbe-bdcb-11e8-8c1e-0a1d4c5c824a%2F'
    }

    getDestinationEndpoint() {
        return this.fake_url
    }

    dismiss() {
        this.$mdDialog.cancel();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusDownloadDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.url = null;
        this.error = null;
        this.etlServerAPI.setupGlobusDownloadTransfer(this.project.id).then(
            results => {
                if (results.url) {
                    this.url = results.url;
                } else {
                    this.error = results.error;
                    if (!this.error) {
                        this.error = 'Unexpected error: please contact site admin';
                    }
                }
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }

}

class GlobusReportStatusDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.statusReportList = [];
        console.log('GlobusReportStatusDialogController - Fetching status');
        this.etlServerAPI.getRecentGlobusStatus(this.project.id)
            .then(results => {
                this.statusReportList = results.status_list;
                for (let i = 0; i < this.statusReportList.length; i++) {
                    let d = new Date(0);
                    d.setUTCSeconds(this.statusReportList[i].timestamp);
                    let iso = d.toISOString().match(/(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2}:\d{2})/);
                    this.statusReportList[i].timestamp = iso[1] + ' ' + iso[2];
                }
                console.log(this.statusReportList);
            });
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

class GlobusLoginLogoutDialogController {
    /*@ngInject*/
    constructor($mdDialog, etlServerAPI) {
        this.$mdDialog = $mdDialog;
        this.etlServerAPI = etlServerAPI;
        this.refreshGlobusStatus();
    }

    globusLogin() {
        this.etlServerAPI.globusLogin().then(
            (login) => {
                this.loginUrl = login.url;
                this.loggedin = true;
            }
        );
    }

    globusLogout() {
        this.etlServerAPI.globusLogout().then(
            (retVal) => {
                this.logoutUrl = retVal.url;
                this.loggedin = false;
            }
        );
    }

    resetFromLogin() {
        this.loginUrl = null;
        this.globusStatus = null;
        this.loggedin = false;
        this.$mdDialog.hide();
    }

    resetFromLogout() {
        this.logoutUrl = null;
        this.globusStatus = null;
        this.loggedin = true;
        this.$mdDialog.hide();
    }

    refreshGlobusStatus() {
        console.log('refreshGlobusStatus');
        this.etlServerAPI.getGlobusAuthStatus().then(
            (retVal) => {
                this.details = [];
                this.globusStatus = retVal.status;
                this.loggedIn = this.globusStatus.authenticated;
                if (this.loggedIn) {
                    let token_keys = ['auth.globus.org', 'transfer.api.globus.org'];
                    for (let i = 0; i < token_keys.length; i++) {
                        let key = token_keys[i];
                        this.details.push(key + ', access: ' + this.globusStatus.validated[key].access);
                        this.details.push(key + ', refresh: ' + this.globusStatus.validated[key].refresh);
                        console.log(this.globusStatus.validated[key].expires);
                        let s = this.globusStatus.validated[key].expires;
                        if (s > 0) {
                            let d = new Date();
                            d.setTime(1000 * s);
                            console.log(d.toString());
                            this.details.push(key + ', expires: ' + d.toString());
                        }
                    }
                }
                else {
                    this.details.push('Not Authenticated');
                }
            }
        );
    }

    cancel() {
        this.$mdDialog.cancel();
    }

}

angular.module('materialscommons').service('sidenavGlobus', SidenavGlobusService);