'use strict';

angular.module('codecollabUiApp')
    .controller('AppCtrl', ['$scope', '$modal', function ($scope, $modal) {
        console.log('### ### AppCtrl invoked! ### ###');

        $scope.openRoadmap = function() {
            var modal = $modal({
                template: '/views/modal/modal-roadmap.html',
                show: true,
                backdrop: 'static'
            });
        };

        $scope.openAbout = function() {
            var modal = $modal({
                template: '/views/modal/modal-about.html',
                show: true,
                backdrop: 'static'
            });
        };
    }]);
