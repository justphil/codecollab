'use strict';

angular.module('codecollabUiApp')
    .controller('AppCtrl', ['$scope', '$window', '$modal', function ($scope, $window, $modal) {
        console.log('### ### AppCtrl invoked! ### ###');

        $scope.ribbon = 0;
        var ribbonCounter = 0;

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

        $scope.isAngularJsRibbon = function() {
            return $scope.ribbon === 0;
        };

        $scope.isAngularJsDeRibbon = function() {
            return $scope.ribbon === 1;
        };

        $scope.isVertxRibbon = function() {
            return $scope.ribbon === 2;
        };

        $window.setInterval(function() {
            $scope.$apply(function() {
                $scope.ribbon = ribbonCounter % 3;
                ribbonCounter++;
            });
        }, 10000);
    }]);
