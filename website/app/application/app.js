var Application = Application || {};

Application.Constants = angular.module('application.core.constants', []);
Application.Services = angular.module('application.core.services', []);
Application.Controllers = angular.module('application.core.controllers', []);
Application.Filters = angular.module('application.core.filters', []);
Application.Directives = angular.module('application.core.directives', []);

Application.Provenance = {};
Application.Provenance.Constants = angular.module('application.provenance.constants', []);
Application.Provenance.Services = angular.module('application.provenance.services', []);
Application.Provenance.Controllers = angular.module('application.provenance.controllers', []);
Application.Provenance.Filters = angular.module('application.provenance.filters', []);
Application.Provenance.Directives = angular.module('application.provenance.directives', []);

var app = angular.module('materialscommons',
    ['ui',
         'ui.bootstrap',
        'ngCookies', '$strap.directives', 'ui.router', 'ngResource',
        'Provenance', 'ngQuickDate', 'application.core.constants',
        'application.core.services', 'application.core.controllers', 'application.core.filters',
        'application.core.directives', 'application.provenance.constants', 'application.provenance.services',
        'application.provenance.controllers', 'application.provenance.filters', 'application.provenance.directives']);

app.config(function ($stateProvider) {
    Stomp.WebSocketClass = SockJS;
    mcglobals = {};
    doConfig();
    $stateProvider
        // Navbar
        .state('home', {
            url: '/home',
            templateUrl: 'application/core/home/home.html'
        })
        .state('toolbar', {
            url: '/toolbar',
            templateUrl: 'application/core/toolbar/toolbar.html'
        })
        .state('about', {
            url: '/about',
            templateUrl: 'application/core/about/about.html'
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

        // Account
        .state('account', {
            url: '/account',
            templateUrl: 'application/core/account/account.html'
        })
        .state('account.groupcreate', {
            url: '/groupcreate',
            templateUrl: 'application/core/account/groupcreate/groupcreate.html'
        })
        .state('account.groupusers', {
            url: '/groupusers/:id',
            templateUrl: 'application/core/account/groupusers/groupusers.html'
        })

        // Toolbar Data Views
        .state('toolbar.mydatapage', {
            url: '/mydatapage',
            templateUrl: 'application/core/toolbar/mydatapage/mydatapage.html'
        })
        .state('toolbar.mydata', {
            url: '/mydata',
            templateUrl: 'application/core/toolbar/mydata/mydata.html'
        })
        .state('toolbar.thumbnails', {
            url: '/thumbnails',
            templateUrl: 'application/core/toolbar/thumbnails/thumbnails.html'
        })
        .state('toolbar.dataedit', {
            url: '/dataedit/:id',
            templateUrl: 'application/core/toolbar/dataedit/dataedit.html'
        })
        .state('toolbar.databytag', {
            url: '/databytag/:name',
            templateUrl: 'application/core/toolbar/databytag/databytag.html'
        })

        // Toolbar tag views
        .state('toolbar.tagspage', {
            url: '/tagspage',
            templateUrl: 'application/core/toolbar/tagspage/tagspage.html'
        })
        .state('toolbar.tags', {
            url: '/tags',
            templateUrl: 'application/core/toolbar/tags/tags.html'
        })
        .state('toolbar.globaltagcloud', {
            url: '/globaltagcloud',
            templateUrl: 'application/core/toolbar/globaltagcloud/globaltagcloud.html'
        })

        // Toolbar review views
        .state('toolbar.reviews', {
            url: '/reviews',
            templateUrl: 'application/core/toolbar/reviews/reviews.html'
        })

        // Toolbar machine views
        .state('toolbar.machines', {
            url: '/machines',
            templateUrl: 'application/core/toolbar/machines/machines.html'
        })

        // Toolbar materials views
        .state('toolbar.materials', {
            url: '/materials',
            templateUrl: 'application/core/toolbar/materials/materials.html'
        })

        // Toolbar projectspage views
        .state('toolbar.projectspage', {
            url: '/projectspage/:id/:draft_id',
            templateUrl: 'application/core/toolbar/projectspage/projectspage.html'
        })
        .state('toolbar.projectspage.overview', {
            url: '/overview',
            templateUrl: 'application/core/toolbar/projectspage/overview/overview.html'
        })
        .state('toolbar.projectspage.provenance', {
            url: '/provenance',
            templateUrl: 'application/provenance/provenance.html'
        })
        .state('toolbar.projectspage.provenance.process', {
            url: '/process',
            templateUrl: 'application/provenance/process/process.html'
        })
        .state('toolbar.projectspage.provenance.iosteps', {
            url: '/iosteps:iosteps',
            templateUrl: 'application/provenance/iosteps/iosteps.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.iostep', {
            url: '/iostep:iostep',
            templateUrl: 'application/provenance/iosteps/iostep/iostep.html'
        })
        .state('toolbar.projectspage.provenance.iosteps.files', {
            url: '/files:iostep',
            templateUrl: 'application/provenance/iosteps/files/files.html'
        })
        .state('toolbar.projectspage.provenance.finish', {
            url: '/finish',
            templateUrl: 'application/provenance/finish/finish.html'
        });

//        // Views
//        .state('mytools', {
//
//        })
//        // Projects views
//        .state('mytools.projects', {
//            url: '/projectspage/:id/:draft_id',
//            templateUrl: 'partials/project/projectspage.html'
//        })
//        .state('mytools.projects.overview', {
//            url: '/overview',
//            templateUrl: 'partials/project/overview.html'
//        })
//        .state('mytools.projects.provenance', {
//            url: '/provenance',
//            templateUrl: 'partials/project/provenance.html'
//        })
//        .state('mytools.projects.provenance.process', {
//            url: '/process',
//            templateUrl: 'partials/project/provenance/process.html'
//        })
//        .state('mytools.processreport', {
//            url: '/process/report/:process_id',
//            templateUrl: 'partials/process/report.html',
//            controller: 'ProcessReportController'
//        })
//        .state('mytools.tagbyname', {
//            url: '/data/bytag/:name',
//            templateUrl: 'partials/tags/databytag.html',
//            controller: 'TagDataController'
//        })


    /**
     * End To level navigation
     */


    /**
     * Mytools - Subpage is the parent and the rest inherit
     */

        //Provenance
//        .state('mytools.drafts', {
//            url: '/drafts',
//            templateUrl: 'partials/provenance/drafts-list.html',
//            controller: DraftsListController
//        })
//
//
//        .state('mytools.mytagslist', {
//            url: '/mytagslist',
//            templateUrl: 'partials/tags/my-tags.html',
//            controller: 'MyTagsController'
//        });


});

app.run(function ($rootScope, $state, $stateParams, $location, $cookieStore, User) {
    $rootScope.$on('$stateChangeStart', function (event, toState) {
        if (matchesPartial(toState, "partials/front-page", "HomeController")) {
            setActiveMainNav("#home-nav");
        } else if (matchesPartial(toState, "partials/my-tools", "FrontPageController")) {
            setActiveMainNav("#user-nav");
        } else if (matchesPartial(toState, "partials/explore", "ExploreController")) {
            setActiveMainNav("#explore-nav");
        } else if (matchesPartial(toState, "partials/about", "AboutController")) {
            setActiveMainNav('#about-nav');
        } else if (matchesPartial(toState, "partials/contact", "ContactController")) {
            setActiveMainNav('#contact-nav');
        } else if (matchesPartial(toState, "partials/help", "HelpController")) {
            setActiveMainNav("#help-nav");
        }

        if (!User.isAuthenticated()) {
            if (toState.templateUrl && toState.templateUrl.indexOf("partials/my-tools") !== -1) {
                $location.path("/login");
            }
        } else {
            $rootScope.email_address = User.u();
        }
    });

});

function matchesPartial(next, what, controller) {
    if (!next.templateUrl) {
        return false;
    }


    var value = next.templateUrl.indexOf(what) !== -1;
    /*
     Hack to look at controller name to figure out tab. We do this so that partials can be
     shared by controllers, but we need to show which tab is active. So, we look at the
     name of the controller (only if controller != 'ignore').
     */
    if (controller === "ignore") {
        return value;
    }

    if (value) {
        return true;
    }

    // return next.controller.toString().indexOf(controller) != -1;
    return value;
}
