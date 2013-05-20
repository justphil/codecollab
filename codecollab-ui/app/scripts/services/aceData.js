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

        var generateInitCode = function(isPresenter) {
            var code =  "/*\n" +
                        " * CodeCollab is an effortless real-time code collaboration tool.\n" +
                        " *\n";

            if (isPresenter) {
                code += " * In order to start a collaboration session (=\"CodeCollab\") just\n"+
                        " * enter your name, choose a programming language, click on 'Start CodeCollab!'\n"+
                        " * and provide your friends the generated URL.\n"+
                        " *\n";
            }
            else {
                code += " * You are about to join a collaboration session (=\"CodeCollab\").\n"+
                        " * Just enter your name and click on 'Join CodeCollab!'\n"+
                        " * In case the session starter has allowed other collaborators to make\n"+
                        " * changes you will be able to edit the code.\n"+
                        " *\n";
            }

            code    +=  " * All changes to the code will be distributed among all session participants\n"+
                        " * in real time.\n"+
                        " *\n"+
                        " * We currently provide syntax highlighting for the following languages:\n"+
                        " */\n"+
                        "\n"+
                        "var supported = [\n";

            var i = 0;
            for (var lang in aceModeMap) {
                if (aceModeMap.hasOwnProperty(lang)) {
                    code += "     '" + lang + "'";

                    if (i < (Object.keys(aceModeMap).length - 1)) {
                        code += ",\n";
                    }
                    else {
                        code += "\n";
                    }

                    i++;
                }
            }

            code += "];\n";

            return code;
        };

        // Public API here
        return {
            getSupportedAceModes: function() {
                return aceModeMap;
            },
            getSupportedAceThemes: function() {
                return 'ace/theme/monokai';
            },
            generateInitCode: function(isPresenter) {
                return generateInitCode(isPresenter);
            }
        };
    });
