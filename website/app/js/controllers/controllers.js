'use strict';

function FrontPageController($scope, $location) {
    $scope.messages = [];
    $scope.sent = 0;
    $scope.search_key = function () {
        $location.path("/searchindex/search_key/" + $scope.keyword);
    }
}

function HomeController($scope, mcapi) {

    mcapi('/news')
        .success(function (data) {
            $scope.news = data;
        }).jsonp();
}



function ExploreController($scope) {
    $scope.pageDescription = "Explore";
}

function AboutController($scope) {
    $scope.pageDescription = "About";


}

function ContactController($scope, $routeParams) {
    $scope.pageDescription = "Contact";

}

function HelpController($scope, $routeParams) {
    $scope.pageDescription = "Help";
}

function ReviewListController($scope, $location, mcapi, User) {
    mcapi('/user/%/reviews', User.u())
        .success(function (data) {
            $scope.reviews = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    mcapi('/user/%/reviews/requested', User.u())
        .success(function (data) {
            $scope.reviewsRequested = _.filter(data, function (item) {
                if (!item.done) {
                    return item;
                }
            });
        }).jsonp();

    $scope.startReview = function (id, type) {
        if (type == "data") {
            $location.path("/data/edit/" + id);
        }
        else {
        }
    }

    $scope.removeReview = function (index) {
        var id = $scope.reviews[index].id;
        mcapi('/user/%/review/%', User.u(), id)
            .success(function (data) {
                $scope.reviews.splice(index, 1);
            }).delete();
    }

    $scope.removeRequestedReview = function (index) {
        var id = $scope.reviewsRequested[index].id;
        mcapi('/user/%/review/%/requested', User.u(), id)
            .success(function () {
                $scope.reviewsRequested.splice(index, 1);
            }).delete()
    }
}

function EventController($scope, alertService) {
    $scope.message = '';
    $scope.$on('handleBroadcast', function () {
        $scope.message = {"type": "info",
            "content": alertService.message};
    });

}

function ProvenanceController($scope, $rootScope){
    console.log('how many');
    $scope.process = [
        {
            name: 'TEM',
            owner: 'Allison',
            inputs: ['TEM-excel-analysis', 'TEM conditions.txt'],
            outputs: ['image-display.jpg', 'TEM-analysis.xls', 'TEM.jpg']
        },
        {
            name: 'pr22',
            owner: 'Emanuelle',
            inputs: ['TEM-analysis.xls', 'a.txt'],
            outputs: ['pr22-excel-analysis', 'a.txt', 'pr22.jpg']
        },
        {
            name: 'SEM',
            owner: 'Emanuelle',
            inputs: ['SEM-excel-analysis', 'a.txt', 'pr22.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg', 'file1.txt']
        },
        {
            name: 'P4',
            owner: 'Allison',
            inputs: ['file1.txt', 'file2.txt', 'file4.txt'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        },
        {
            name: 'P5',
            owner: 'Emanuelle',
            inputs: ['p5-excel-analysis', 'a.txt', 'p5.jpg'],
            outputs: ['TEM-excel-analysis', 'a.txt', 'TEM.jpg']
        }
    ];
   $scope.get_process_details = function(index){
       $scope.$apply(function(){
           $scope.details = $scope.process[index];

       })
   }

}

function SubPageController($scope, $routeParams){
    $scope.template = "partials/data/data-main.html";
    if ($routeParams.tab) {
        switch ($routeParams.tab) {
            case "data-tab":
                $scope.template = "partials/data/data-subpage.html";
                $('#my-data-tab').addClass("active");
                break;

            case "tags-tab":
                $scope.template = "partials/tags/tags-subpage.html";
                $('#tags-tab').addClass("active");
                break;
            case "conditions-tab":
                $scope.template = "partials/conditions/conditions-subpage.html";
                $('#conditions-tab').addClass("active");
                break;

            case "provenance-tab":
                $scope.template = "partials/provenance/provenance-subpage.html";
                $('#provenance-tab').addClass("active");
                break;
            case "upload-tab":
                $scope.template = "partials/updownload/upload-subpage.html";
                $('#upload-tab').addClass("active");
                break;

            case "reviews-tab":
                $scope.template = "partials/reviews/review-subpage.html";
                $('#reviews-tab').addClass("active");
                break;

            case "usergroups-tab":
                $scope.template = "partials/usergroups/usergroup-subpage.html";
                $('#usergroups-tab').addClass("active");
                break;



            case "my-projects-tab":
                $scope.template = "partials/datagroups/my_data_groups.html";
                $('#my-data-tab').addClass("active");
                break;

            case "my-data-tab":
                $scope.template = "partials/data/my-data.html";
                $('#my-data-tab').addClass("active");
                break;

            case "my-projects-tree-tab":
                $scope.template = "partials/datagroups/tree.html";
                $('#my-data-tab').addClass("active");
                break;
            case "group-projects-tree-tab":
                $scope.template = "partials/datagroups/group-tree.html";
                $('#my-data-tab').addClass("active");
                break;

            case "thumbnail-tab":
                $scope.template = "partials/thumbnail.html";
                $('#my-data-tab').addClass("active");
                break;

            case "list-tags-tab":
                $scope.template = "partials/tags/tags-list.html";
                $('#tags-tab').addClass("active");
                break;

            case "my-tags-list-tab":
                $scope.template = "partials/tags/my-tags-list.html";
                $('#tags-tab').addClass("active");
                break;

            case "global-tag-cloud-tab":
                $scope.template = "partials/tags/tagcloud.html";
                $('#tags-tab').addClass("active");
                break;

            case "create-template-tab":
                $scope.template = "partials/conditions/create-condition-template.html";
                $('#conditions-tab').addClass("active");
                break;

            case "list-template-tab":
                $scope.template = "partials/conditions/list-condition-template.html";
                $('#conditions-tab').addClass("active");
                break;

            case "track-tab":
                $scope.template = "partials/provenance/provenance.html";
                $('#provenance-tab').addClass("active");
                break;

            case "review-list-tab":
                $scope.template = "partials/reviews/review-list.html";
                $('#reviews-tab').addClass("active");
                break;

            case "create-usergroup-tab":
                $scope.template = "partials/usergroups/usergroup-create.html";
                $('#conditions-tab').addClass("active");
                break;

            case "my-usergoups-tab":
                $scope.template = "partials/usergroups/my_usergroups.html";
                $('#conditions-tab').addClass("active");
                break;

            case "all-usergoups-tab":
                $scope.template = "partials/usergroups/usergroups_list_all.html";
                $('#reviews-tab').addClass("active");
                break;
        }
    }
}



