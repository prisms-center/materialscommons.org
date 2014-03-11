Application.Provenance.Controllers.controller('provenanceIOStepsIOStep',
    ["$scope", "ProvDrafts", "$stateParams", "mcapi",
        function ($scope, ProvDrafts, $stateParams, mcapi) {
            $scope.model = {
                additionalProperty: {},
                pick_sample: {}
            };
            $scope.pick_sample = function () {
                $scope.doc.model = $scope.model.pick_sample.model;
                console.log($scope.doc);
            };

            $scope.addAdditionalProperty = function () {
                $scope.doc.model.added_properties.push($scope.model.additionalProperty);
            };

            $scope.addCustomProperty = function () {
                $scope.doc.model.added_properties.push({'name': $scope.customPropertyName, 'value': $scope.customPropertyValue, 'unit': '', 'value_choice': [], 'unit_choice': []});
            };

//            $scope.loadMaterials = function () {
//                mcapi('/materials')
//                    .success(function (data) {
//                        $scope.materials = data;
//
//                        if ($scope.doc.material) {
//                            var i = _.indexOf($scope.materials, function (item) {
//                                return (item.name === $scope.doc.material.name);
//                            });
//
//                            if (i !== -1) {
//                                $scope.doc.material = $scope.materials[i];
//                                if ($scope.doc.sample) {
//                                    var j = _.indexOf($scope.samples_list, function (item) {
//                                        return (item.id === $scope.doc.sample.id);
//                                    });
//                                    if (j !== -1) {
//                                        $scope.doc.sample = $scope.samples_list[j];
//                                        $scope.doc.model = $scope.doc.sample.model;
//                                        $scope.doc.owner = $scope.doc.sample.owner;
//                                        $scope.doc.sample_id = $scope.doc.sample.id;
//                                    }
//                                }
//                            }
//                        }
//                    }).jsonp();
//            };

            $scope.load_all_samples = function () {
                mcapi('/samples')
                    .success(function (data) {
                        $scope.samples_list = data;
                    }).jsonp();
            }

            $scope.init = function () {
                $scope.stepName = $stateParams.iostep;
                if ($stateParams.iosteps === 'inputs') {
                    $scope.doc = ProvDrafts.current.attributes.input_conditions[$scope.stepName];
                } else {
                    $scope.doc = ProvDrafts.current.attributes.output_conditions[$scope.stepName];
                }
                $scope.load_all_samples();
                console.log($scope.doc)
                //$scope.loadMaterials();
            };

            $scope.init();
        }
    ])
;