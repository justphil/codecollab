'use strict';

angular.module('codecollabUiApp')
    .directive('stream', function () {
        return {
            template: '<div class="stream-message img-rounded" ng-repeat="s in stream">' +
                        '<div class="img-rounded"' +
                                'style="width: 8px; height: 8px; background-color: {{s.color}}; display: inline-block;"></div>' +
                        ' {{s.time}} {{s.name}} {{s.msg}}' +
                        '</div>',
            restrict: 'E',
            scope: {
                stream: '='
            },
            link: function postLink(scope, element, attrs) {
                //element.text('this is the stream directive');
            }
        };
    });
