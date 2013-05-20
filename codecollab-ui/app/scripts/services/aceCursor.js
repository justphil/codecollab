'use strict';

angular.module('codecollabUiApp')
    .factory('aceCursor', function () {
        var cursors; // sockId -> color (string -> string)

        var reset = function() {
            cursors = {};
        };

        reset();


        var addCursorClass = function(sockId, color) {
            cursors[sockId] = color;

            var newCssClassName = 'div.ace_cursor.c-' + sockId;
            var html = '<style id="cursor_'+sockId+'" type="text/css">' + newCssClassName + ' {border-left: 2px solid ' + color + ';}</style>';
            var newCssClass     = angular.element(html);
            angular.element('html > head').append(newCssClass);
        };

        var removeCursorClass = function(sockId) {
            if (cursors.hasOwnProperty(sockId)) {
                delete cursors[sockId];
                angular.element('#cursor_' + sockId).remove();
            }
        };

        // Public API here
        return {
            reset: function () {
                reset();
            },
            addCursorClass: function(sockId, color) {
                addCursorClass(sockId, color);
            },
            removeCursorClass: function(sockId) {
                removeCursorClass(sockId);
            }
        };
    });
