'use strict';

angular.module('codecollabUiApp')
    .directive('stream', function () {
        return {
            template: '<div class="stream-message-container"><div class="stream-message img-rounded" ng-repeat="s in stream">' +
                        '<div class="color-indicator img-rounded" style="background-color: {{s.color}};"></div>' +
                        ' {{s.time}} {{s.name}} {{s.msg}}' +
                      '</div></div>',
            restrict: 'E',
            scope: {
                stream: '='
            },
            link: function postLink($scope, $element/*, $attrs*/) {
                //element.text('this is the stream directive');
                $scope.$watch(function(thisScope) {
                    if (angular.isUndefined(thisScope.stream)) {
                        return 0;
                    }

                    return thisScope.stream.length;
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        console.log('stream array has changed to: ' + newValue);
                        var streamMessageContainer = angular.element('.stream-message-container', $element)[0];
                        var height = streamMessageContainer.scrollHeight;
                        angular.element(streamMessageContainer).scrollTop(height);
                    }
                });
            }
        };
    });
