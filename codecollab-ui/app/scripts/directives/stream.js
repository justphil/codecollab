'use strict';

angular.module('codecollabUiApp')
    .directive('stream', function () {
        return {
            template: '<div class="stream-message-container"><div class="stream-message img-rounded" ng-repeat="s in stream" ng-class="getStreamMessageClasses(s.name, s.system)">' +
                        ' <span ng-show="isPresenterMessage(s.name) && !s.system">' +
                            '<div class="color-indicator img-rounded" style="background-color: {{s.color}};"></div> <span class="date">{{s.time | date:\'HH:mm:ss\'}}</span> <span class="name">{{s.name}}</span> {{s.msg}}' +
                        '</span>' +
                        ' <span ng-hide="isPresenterMessage(s.name) || s.system">' +
                            '{{s.msg}} <span class="name-non-presenter">{{s.name}}</span> <span class="date">{{s.time | date:\'HH:mm:ss\'}}</span> ' +
                            '<div class="color-indicator img-rounded" style="background-color: {{s.color}};"></div>' +
                        '</span>' +
                        '<span ng-show="s.system">' +
                            '<span class="date">{{s.time | date:\'HH:mm:ss\'}}</span> {{s.msg}}' +
                        '</span>' +
                      '</div></div>',
            restrict: 'E',
            scope: {
                stream:         '=',
                presenterName:  '='
            },
            link: function postLink($scope, $element/*, $attrs*/) {
                // auto scroll when new messages arrive
                $scope.$watch(function(thisScope) {
                    if (angular.isUndefined(thisScope.stream)) {
                        return 0;
                    }

                    return thisScope.stream.length;
                }, function(newValue, oldValue) {
                    if (newValue !== oldValue) {
                        // TODO: window should be injected by angular instead of using it directly
                        window.setTimeout(function() {
                            //console.log('stream array has changed to: ' + newValue);
                            var streamMessageContainer = angular.element('.stream-message-container', $element)[0];
                            var height = streamMessageContainer.scrollHeight;
                            var lastChildHeight = angular.element('.stream-message:last-child', $element).height();
                            //console.log('last-child height: ' + lastChildHeight);
                            angular.element(streamMessageContainer).scrollTop(height + lastChildHeight);
                        }, 10);
                    }
                });

                $scope.isPresenterMessage = function(name) {
                    return name === $scope.presenterName;
                };

                $scope.getStreamMessageClasses = function(name, isSystemMessage) {
                    if (isSystemMessage) {
                        return 'text-center system';
                    }
                    else {
                        if ($scope.isPresenterMessage(name)) {
                            return '';
                        }
                        else {
                            return 'text-right'
                        }
                    }
                };
            }
        };
    });
