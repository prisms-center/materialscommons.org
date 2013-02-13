/**
 * Created with JetBrains WebStorm.
 * User: gtarcea
 * Date: 1/12/13
 * Time: 1:09 PM
 * To change this template use File | Settings | File Templates.
 */

'use strict';

function ExperimentListController($scope, $location, cornercouch) {

//    var mcdb = {rows:[
//        { value:{"_id":"1", "name":"ALLISON-SEM-MAGNESIUSM",
//            "description":"Test tensile strength of magnesium when heated"}},
//        { value:{"_id":"2", "name":"ALLISON-THERMAL-MAGNESIUSM-HYBRID",
//            "description":"Alloying of magnesium/aluminum hybrid under extreme temperatures"}},
//        { value:{"_id":"3", "name":"ALLISON-SEM-CHROMIUM",
//            "description":"Does chromium show same failure conditions as magnesium?"}}
//    ]};
//
//    $scope.mcdb = mcdb;

    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "all_experiments");

    $scope.keypressCallback = function(event) {
        if (length == 0) {
            window.location = document.getElementById('createExperiment').href + "?name=" + $scope.query;
        }
    }
}

function ExperimentDetailController($scope, $routeParams, cornercouch) {
    $scope.pageTypeMessage = "View";
    $scope.experimentId = $routeParams.experimentId;
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.experiment = $scope.mcdb.getDoc($scope.experimentId);

    $scope.deleteExperiment = function () {
        $scope.experiment.remove().success(function () {
            alert("Deleted experiment");
        });
    };

    $scope.msCount = function() {
        return microstructureCount($scope.experiment.properties);
    };

    $scope.saveExperiment = function() {
        var currentPropertiesCount = $scope.experiment.properties.length;
        $('#experimentPropertyEntries tr').each(function() {
            var item = $(this);
            var type = "";
            microstructures.push($(this).text());
        });
    };
}

function ExperimentCreateController($scope, $routeParams) {
    $scope.pageTypeMessage = "Create";

    if ($routeParams.name) {
        $scope.name = $routeParams.name;
    }
    else
    {
        $scope.name = "";
    }

    $scope.experiment = {};
    $scope.experiment.properties = [];

    $scope.msCount = function() { return 0; };

    $scope.saveExperiment = function() {

    };
}

function MessagesController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.mcdb.query("materialscommons-app", "recent_events");
}

function ChartController($scope, $routeParams, cornercouch) {
    $scope.server = cornercouch();
    $scope.server.session();
    $scope.mcdb = $scope.server.getDB("materialscommons");
    $scope.chart_data = $scope.mcdb.getDoc("942ecdf121a6f788cc86a10a7e3e8ab6");
}

function FrontPageController($scope, $routeParams) {
    // Nothing to do yet.
}

function DataSearchController($scope, $routeParams) {
    // Nothing to do yet
}

function ModelsSearchController($scope, $routeParams) {
    // Nothing to do yet
}



function MicrostructureController($scope, $routeParams) {

    $scope.tmessage = "Microstructure";

    $scope.equipment = [
        "APT",
        "TEM",
        "XRD",
        "SEM",
        "OIM",
        "Optical"
    ];

    $scope.saveChanges = function () {
        var type = "<td>microstructure</td>";
        var description = "<td>" + $scope.ms_description +"</td>";
        var how = "<td>" + $scope.ms_equipment + "</td>"
        var dateAdded = "<td>today</td>";
        var attachmentCount = "<td><span class='badge badge-info'>0</span></td>";
        var entry = "<tr>" + type + description + how + dateAdded + attachmentCount + "</tr>";
        $('#experimentPropertyEntries').append(entry);

        var rowCount = $('#experimentPropertyEntries tr').length;

        $('#msCountBadge').html(rowCount);

        $scope.ms_equipment = "NONE";
        $scope.ms_description = "";
    }
}

function MechanicalController($scope, $routeParams) {

    $scope.tmessage = "Mechanical";

    $scope.saveChanges = function () {
        alert("saveChanges Mechanical");
    }
}

function SimulationController($scope, $routeParams) {

    $scope.tmessage = "Simulation";

    $scope.saveChanges = function () {
        alert("saveChanges Simulation");
    }
}

function ComputationalController($scope, $routeParams) {

    $scope.tmessage = "Computational";

    $scope.saveChanges = function () {
        alert("saveChanges Computational");
    }
}
