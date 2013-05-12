'use strict';

angular.module('codecollabUiApp')
    .factory('aceData', function () {
        // Service logic
        var aceModeMap = {
            JavaScript:     'ace/mode/javascript',
            CoffeeScript:   'ace/mode/coffee',
            TypeScript:     'ace/mode/typescript',
            HTML5:          'ace/mode/html',
            CSS3:           'ace/mode/css',
            Java:           'ace/mode/java',
            Ruby:           'ace/mode/ruby'
        };

        // Public API here
        return {
            getSupportedAceModes: function() {
                return aceModeMap;
            },
            getSupportedAceThemes: function() {
                return 'ace/theme/monokai';
            }
        };
    });
