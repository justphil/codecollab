'use strict';

angular.module('codecollabUiApp')
    .controller('MainCtrl',
            ['$scope', '$rootScope', '$location', '$http', '$window', 'aceData',
    function ($scope, $rootScope, $location, $http, $window, aceData) {
        console.log('### ### MainCtrl invoked! ### ###');

        var aceModeMap = aceData.getSupportedAceModes();

        $scope.supportedProgrammingLanguages = [];
        for (var lang in aceModeMap) {
            if (aceModeMap.hasOwnProperty(lang)) {
                $scope.supportedProgrammingLanguages.push(lang);
            }
        }

        // TODO: session data should be hold in a service
        // init cc session data
        $rootScope.codecollabSession = {
            isPresenter     : false,
            userName        : '',
            allowEditing    : false,
            aceMode         : $scope.supportedProgrammingLanguages[0]
        };

        // init model

        $scope.aceMode = $scope.supportedProgrammingLanguages[0];

        $scope.aceTheme = aceData.getSupportedAceThemes();

        $scope.userName = '';

        $scope.allowEditing = true;

        $scope.aceInitCode =    "/*\n" +
                                " * CodeCollab is an effortless real-time code collaboration tool.\n" +
                                " *\n" +
                                " * In order to start a collaboration session (=\"CodeCollab\") just\n"+
                                " * enter your name, choose a programming language, click on 'Start CodeCollab!'\n"+
                                " * and provide your friends the generated URL.\n"+
                                " *\n"+
                                " * All changes to the code will be distributed among all session participants\n"+
                                " * in real time.\n"+
                                " *\n"+
                                " * We currently provide syntax highlighting for the following languages:\n"+
                                " */\n"+
                                "\n"+
                                "var supported = [\n";

        for (var i = 0; i < $scope.supportedProgrammingLanguages.length; i++) {
            $scope.aceInitCode += "     '" + $scope.supportedProgrammingLanguages[i] + "'";

            if (i < ($scope.supportedProgrammingLanguages.length - 1)) {
                $scope.aceInitCode += ",\n";
            }
            else {
                $scope.aceInitCode += "\n";
            }
        }

        $scope.aceInitCode += "];\n";

        $scope.getAllowEditingText = function() {
            return ($scope.allowEditing) ? "Collaborators can make changes." : "Collaborators cannot make changes.";
        };

        $scope.allowEditingClass = function() {
            return ($scope.allowEditing) ? "btn-success" : "btn-danger";
        };

        $scope.startNewCodeCollab = function() {
            var userName = $scope.userName.trim();
            if (userName !== '') {
                var data = {
                    presenter:      userName,
                    allowEditing:   $scope.allowEditing,
                    aceTheme:       'ace/theme/monokai',
                    aceMode:        aceModeMap[$scope.aceMode]
                };

                // TODO: Handle erroneous response
                $http.post('http://' + $window.location.hostname + ':8080/session', data)
                        .success(onNewCodeCollabStarted);
            }
            else {
                $scope.startCodeCollabForm.userName.$dirty      = true;
                $scope.startCodeCollabForm.userName.$invalid    = true;
            }
        };

        var onNewCodeCollabStarted = function(res) {
            $rootScope.codecollabSession.isPresenter    = true;
            $rootScope.codecollabSession.userName       = $scope.userName;
            $rootScope.codecollabSession.allowEditing   = $scope.allowEditing;
            $rootScope.codecollabSession.aceMode        = aceModeMap[$scope.aceMode];
            $rootScope.codecollabSession.aceTheme       = $scope.aceTheme;

            console.log('onNewCodeCollabStarted', res);
            $location.path('/session/' + res.uuid);
        };

        /* ################################################################# */
        /* ################################################################# */
        /* ################################################################# */

        // TODO: This is not the right place for this kind of logic!
        // TODO: Let angular inject the window object.

        var resizeHeight = function() {
            var winHeight = $(window).height() - 40;
            $('div#right-content').height(winHeight);
        };

        $(window).resize(function() {
            resizeHeight();
        });

        resizeHeight();

        /* ################################################################# */
        /* ################################################################# */
        /* ################################################################# */

        /*
        var eb = vertxbus.instantiateEventBus("http://localhost:8080/eventbus");
        if (eb !== null) {
            eb.onopen = function() {
                console.log("Connected");
            };

            eb.onclose = function() {
                console.log("Not connected");
                eb = null;
            };
        }
        else {
            console.log('eb is null');
        }
        */


    }]);
