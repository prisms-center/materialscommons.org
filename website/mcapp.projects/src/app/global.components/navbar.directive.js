/*@ngInject*/
class NavbarComponentController {
    /*@ngInject*/
    constructor(User, $state, $stateParams, searchQueryText, mcstate, navbarOnChange, projectsAPI, demoProjectService,
                blockUI, toast, mcbus, $mdDialog) {
        this.User = User;
        this.$state = $state;
        this.$stateParams = $stateParams;
        this.searchQueryText = searchQueryText;
        this.mcstate = mcstate;
        this.navbarOnChange = navbarOnChange;
        this.projectsAPI = projectsAPI;
        this.demoProjectService = demoProjectService;
        this.blockUI = blockUI;
        this.toast = toast;
        this.mcbus = mcbus;
        this.inProjectsState = $state.includes('projects');
        this.project = mcstate.get(mcstate.CURRENT$PROJECT);
        this.query = searchQueryText.get();
        this.navbarSearchText = this.inProjectsState ? 'SEARCH PROJECTS...' : 'SEARCH PROJECT...';
        this.user = User.attr().fullname;
        this.isAdmin = User.attr().admin;
        this.isBetaUser = User.attr().beta_user;
        this.$mdDialog = $mdDialog;
    }

    $onInit() {
        this.searchQueryText.setOnChange(() => {
            this.query = this.searchQueryText.get();
        });

        this.navbarOnChange.setOnChange(() => {
            // Hack, change this later
            if (this.$stateParams.project_id) {
                this.projectsAPI.getProject(this.$stateParams.project_id).then(
                    (proj) => this.mcstate.set(this.mcstate.CURRENT$PROJECT, proj)
                );
            }
        });

        this.mcstate.subscribe(this.mcstate.CURRENT$PROJECT, 'navbar', () => {
            this.project = this.mcstate.get(this.mcstate.CURRENT$PROJECT);
            this.published = this.project.datasets.filter(d => d.published);
            this.unusedSamples = this.project.samples.filter(s => s.processes.length === 1);
            this.measuredSamples = this.project.samples.filter(s => s.processes.length > 1);
        });

        this.mcbus.subscribe('USER$NAME', 'NavbarDirectiveController', () => {
            this.user = this.User.attr().fullname;
        });
    }

    buildDemoProject() {
        this.blockUI.start("Building demo project (this may take a few seconds)...");
        this.demoProjectService.buildDemoProject(this.User.attr().email).then(
            () => {
                this.blockUI.stop();
                this.mcbus.send('PROJECTS$REFRESH');
            },
            (error) => {
                this.blockUI.stop();
                let message = `Status: ${error.status}; Message: ${error.data}`;
                this.toast.error(message, 'top right');
            }
        );
    }

    search() {
        if (this.query !== '') {
            this.$state.go('project.search', {query: this.query}, {reload: true});
        }
    }

    home() {
        this.$state.go('projects');
    }

    logout() {
        this.User.setAuthenticated(false);
        this.$state.go('login');
    }

    switchToUser() {
        this.$mdDialog.show({
            templateUrl: 'app/global.components/switch-user-dialog.html',
            controller: MCSwitchUserDialogController,
            controllerAs: '$ctrl',
            bindToController: true
        });
    }
}

class MCSwitchUserDialogController {
    /*@ngInject*/
    constructor(User, $mdDialog, toast) {
        this.User = User;
        this.$mdDialog = $mdDialog;
        this.toast = toast;
        this.email = "";
    }

    done() {
        this.User.switchToUser(this.email).then(
            (user) => this.User.setAuthenticated(true, user.plain()),
            () => this.toast.error(`Unable to switch to user ${this.email}`)
        );
        this.$mdDialog.hide();
    }

    cancel() {
        this.$mdDialog.cancel();
    }
}

angular.module('materialscommons').component('navbar', {
    templateUrl: 'app/global.components/navbar.html',
    controller: NavbarComponentController
});

