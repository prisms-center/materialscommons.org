var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);

var app = angular.module('materialscommons',
    [
        'ui',
        'ngCookies',
        'ui.router',
        'btford.socket-io',
        'restangular',
        'jmdobry.angular-cache',
        'validation', 'validation.rule',  'wu.masonry',
        'textAngular',
        'treeGrid',
        'ngDragDrop',
        'ng-context-menu',
        "cfp.hotkeys",
        '$strap.directives', 'ui.bootstrap', 'toastr',
        'application.core.constants', 'application.core.services', 'application.core.controllers',
        'application.core.filters', 'application.core.directives']);

// This factory needs to hang off of this module for some reason
app.factory('msocket', ["socketFactory", function (socketFactory) {
    var msocket = socketFactory({
        ioSocket: io.connect('https://localhost:8082')
    });
    msocket.forward('file');
    msocket.forward('connect');
    msocket.forward('disconnect');
    msocket.forward('error');
    return msocket;
}]);

app.config(["$stateProvider", "$validationProvider", function ($stateProvider, $validationProvider) {

    mcglobals = {};
    doConfig();
    $stateProvider
        // Navbar
        .state('home', {
            url: '/home',
            templateUrl: 'application/core/home/home.html'
        })
        .state('about', {
            url: '/about',
            templateUrl: 'application/core/about/about.html'
        })
        .state('modal', {
            url: '/modal',
            templateUrl: 'application/core/modal/test.html'
        })
        .state('sub', {
            url: '/sub',
            templateUrl: 'application/core/modal/sub.html'
        })
        .state('contact', {
            url: '/contact',
            templateUrl: 'application/core/contact/contact.html'
        })
        .state('help', {
            url: '/help',
            templateUrl: 'application/core/help/help.html'
        })
        .state('login', {
            url: '/login',
            templateUrl: 'application/core/login/login.html'
        })
        .state('logout', {
            url: '/logout',
            controller: 'logout'
        })
        .state('reviews', {
            url: '/reviews',
            templateUrl: 'application/core/reviews/reviews.html'
        })
        .state('machines', {
            url: '/machines',
            templateUrl: 'application/core/machines/machines.html'
        })

        /*
         ########################################################################
         ####################### Account ##################################
         ########################################################################
         */
        .state('account', {
            url: '/account',
            templateUrl: 'application/core/account/account.html'
        })
        .state('account.password', {
            url: '/password',
            templateUrl: 'application/core/account/password/password.html'
        })
        .state('account.apikey', {
            url: '/apikey',
            templateUrl: 'application/core/account/apikey/apikey.html'
        })
        .state('account.usergroup', {
            url: '/usergroup',
            templateUrl: 'application/core/account/usergroups/usergroup.html'
        })
        .state('account.usergroup.users', {
            url: '/users/:id',
            templateUrl: 'application/core/account/usergroups/users.html'
        })
        .state('account.templates', {
            url: '/templates',
            templateUrl: 'application/core/account/templates/templates.html'
        })

        /*
         ########################################################################
         ########################### Projects ###################################
         ########################################################################
         */
        .state('projects', {
            url: '/projects',
            templateUrl: 'application/core/projects/projects.html',
            resolve: {
                Projects: "model.projects",
                projects: function (Projects) {
                    return Projects.getList();
                },

                Templates: "model.templates",
                templates: function(Templates) {
                    return Templates.getList();
                }
            }
        })
        .state('projects.project', {
            url: '/project/:id',
            templateUrl: 'application/core/projects/project/project.html'

        })
        .state('projects.project.overview', {
            url: '/overview',
            templateUrl: 'application/core/projects/project/overview/overview.html'
        })
        .state('projects.project.overview.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/overview/view.html'
        })
        .state('projects.project.overview.permissions', {
            url: '/permissions',
            templateUrl: 'application/core/projects/project/overview/permissions.html'
        })
        .state('projects.project.files', {
            url: '/files',
            templateUrl: 'application/core/projects/project/files/files.html'
        })
        .state('projects.project.files.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/files/view.html'
        })
        .state('projects.project.samples', {
            url: '/samples',
            templateUrl: 'application/core/projects/project/samples/samples.html'
        })
        .state('projects.project.samples.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/samples/view.html'
        })
        .state('projects.project.provenance', {
            url: '/provenance',
            templateUrl: 'application/core/projects/project/provenance/provenance.html'
        })
        .state('projects.project.provenance.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/provenance/view.html'
        })
        .state('projects.project.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/projects/project/reviews/reviews.html'
        })
        .state('projects.project.reviews.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/reviews/view.html'
        })
        .state('projects.project.notes', {
            url: '/notes',
            templateUrl: 'application/core/projects/project/notes/notes.html'
        })
        .state('projects.project.notes.view', {
            url: '/view',
            templateUrl: 'application/core/projects/project/notes/view.html'
        });

    $validationProvider.setErrorHTML(function (msg) {
        return '<span class="validation-invalid">' + msg + '</span>';
    });

    $validationProvider.setSuccessHTML(function (msg) {
        return '<span class="validation-valid">' + msg + '</span>';
    });

}]);

app.run(["$rootScope", "User", "Restangular", "projectColors",
    function ($rootScope, User, Restangular, projectColors) {
        Restangular.setBaseUrl(mcglobals.apihost);
        //Restangular.setJsonp(true);
        //Restangular.setDefaultRequestParams('jsonp', {callback: 'JSON_CALLBACK'});
        $rootScope.colors = projectColors;

        $rootScope.$on('$stateChangeStart', function () {
            if (User.isAuthenticated()) {
                $rootScope.email_address = User.u();
            }
        });
    }]);
