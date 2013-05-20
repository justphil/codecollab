'use strict';

angular.module('codecollabUiApp')
    .factory('aceCursor', function () {
        var cursors; // sockId -> color (string -> string)

        var reset = function() {
            cursors = {};
        };

        reset();


        var addCursorClass = function(name, sockId, color) {
            cursors[sockId] = color;

            var newCssClassName = 'div.ace_cursor.c-' + sockId;
            var html = '<style id="cursor_'+sockId+'" type="text/css">'
                            + newCssClassName + ' {border-left: 2px solid ' + color + ';}\n'
                            + newCssClassName + ':after {'
                                +'background: #FFFFFF;'
                                +'background: rgba(255, 255, 255, 0.8);'
                                +'border-radius: 5px;'
                                +'bottom: -2px;'
                                +'color: rgba(0, 0, 0, 0.6);'
                                +'content: "'+name+'";'
                                +'left: 5px;'
                                +'position: absolute;'
                                +'z-index: 98;'
                                +'font-size: 7pt;'
                                +'margin: 0;'
                                +'padding: 4px;'
                            +'}'
                        + '</style>';
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
            addCursorClass: function(name, sockId, color) {
                addCursorClass(name, sockId, color);
            },
            removeCursorClass: function(sockId) {
                removeCursorClass(sockId);
            }
        };
    });
