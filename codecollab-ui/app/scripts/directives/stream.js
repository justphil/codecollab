'use strict';

angular.module('codecollabUiApp')
    .directive('stream', function () {
        return {
            template: '<div ng-repeat="s in stream">{{s.time}} {{s.name}} {{s.color}} {{s.msg}}</div>',
            restrict: 'E',
            scope: {
                stream: '='
            },
            link: function postLink(scope, element, attrs) {
                //element.text('this is the stream directive');
            }
        };
    });
