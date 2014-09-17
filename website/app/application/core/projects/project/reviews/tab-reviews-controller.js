Application.Directives.directive('topShowReviews', actionShowReviewsDirective);

function actionShowReviewsDirective() {
    return {
        controller: "tabShowReviewsController",
        restrict: "A",
        templateUrl: "application/core/projects/project/reviews/reviews.html"
    };
}


Application.Controllers.controller('tabShowReviewsController',
    ["$scope", "mcapi", "$filter", "$state", "dateGenerate", "User",
        "pubsub","$stateParams", "model.projects", "projectColors", tabShowReviewsController]);

function tabShowReviewsController($scope, mcapi, $filter, $state, dateGenerate, User, pubsub, $stateParams, Projects, projectColors) {

    pubsub.waitOn($scope, 'open_reviews.change', function () {
        $scope.loadReviews($stateParams.id);
    });

    $scope.editReview = function(index){
        $scope.edit_index = index;
    };

    $scope.saveReview = function(index) {
        if ($scope.review.messages[index].message === "") {
            return;
        }
        $scope.edit_index = -1;
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.addComment = function() {
        if ($scope.model.comment.length === 0) {
            return;
        }
        $scope.review.messages.push({'message': $scope.model.comment, 'who': User.u(), 'date': dateGenerate.new_date()});
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
            }).put({'messages': $scope.review.messages});
    };

    $scope.closeReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('update_reviews.change');
                pubsub.send('open_reviews.change');
                pubsub.send('reviews.change');
                $scope.loadReviews($stateParams.id);
                $scope.review = '';
            }).put({'status': 'close'});
    };

    $scope.reOpenReview = function() {
        mcapi('/reviews/%', $scope.review.id)
            .success(function (data) {
                pubsub.send('update_reviews.change');
                pubsub.send('open_reviews.change');
                pubsub.send('reviews.change');
                $scope.loadReviews($stateParams.id);
                $scope.review = '';
            }).put({'status': 'open'});
    };

    $scope.viewReview = function (review) {
        $scope.model = {
            selected: false,
            comment: ""
        };
        mcapi('/reviews/%', review.id)
            .success(function (data) {
                $scope.review = data;
            }).jsonp();
    };

    $scope.showReviews = function (status) {
        $scope.status = status;
        if (status === 'open') {
            $scope.list_reviews = $scope.open_reviews;
        }
        else if (status === 'close') {
            $scope.list_reviews = $scope.closed_reviews;
        }
    };

    $scope.loadReviews = function (id) {
        mcapi('/project/%/reviews', id)
            .success(function (reviews) {
                $scope.open_reviews = $filter('byKey')(reviews, 'status', 'open');
                $scope.closed_reviews = $filter('byKey')(reviews, 'status', 'close');
                $scope.list_reviews = $scope.open_reviews;
                $scope.status = 'open';
            }).jsonp();

    };

    function init() {
        $scope.review = '';
        $scope.loadReviews($stateParams.id);
        $scope.status = 'open';
        $scope.color = projectColors.getCurrentProjectColor();
        Projects.get($stateParams.id).then(function(project) {
            $scope.project = project;
        });

        $scope.model = {
            new_review: "",
            assigned_to: "",
            title: ""
        };

    }
    init();
}
