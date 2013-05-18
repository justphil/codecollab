'use strict';

angular.module('codecollabUiApp')
    .directive('collaborators', function () {
        return {
            template: '<ul class="collaborator">' +
                        '<li ng-repeat="c in collaborators" class="collaborator img-rounded" style="border: {{c.color}} solid 2px;">' +
                            '{{c.name}}' +
                        '</li>' +
                      '</ul>',
            restrict: 'E',
            scope: {
                collaborators: '='
            },
            link: function postLink($scope, $element, $attrs) {
                //$element.text('this is the collaborators directive');
            }
        };
    });
