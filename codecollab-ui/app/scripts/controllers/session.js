'use strict';

angular.module('codecollabUiApp')
    .controller('SessionCtrl',
        ['$scope', '$rootScope', '$location', '$routeParams', '$window', '$http', '$modal',
            'ccSession', 'protocolHandler', 'aceManager', 'aceData', 'VERTX_PORT',
            function ($scope, $rootScope, $location, $routeParams, $window, $http, $modal, ccSession, protocolHandler, aceManager, aceData, VERTX_PORT) {
                console.log('### ### SessionCtrl invoked! ### ###');

                aceManager.reset();
                protocolHandler.reset();

                // init vertx url
                var vertxPort;
                if (angular.isUndefined(VERTX_PORT) || VERTX_PORT === '') {
                    vertxPort = '';
                }
                else {
                    vertxPort = ':' + VERTX_PORT;
                }

                var vertxSockJsUrl  = 'http://' + $window.location.hostname + vertxPort + '/ccsess';
                var vertxUrl        = 'http://' + $window.location.hostname + vertxPort;

                console.log('Route param UUID: ' + $routeParams.uuid);
                if (angular.isUndefined($routeParams.uuid) || $routeParams.uuid === '') {
                    $location.path('/');
                    return;
                }
                else {
                    $http({method: 'GET', url: vertxUrl+'/session/'+$routeParams.uuid}).success(function() {
                            initSessionController();
                    }).error(function() {
                            $location.path('/');
                    });
                }

                /* ################################################################################ */
                /* ################################################################################ */
                /* ################################################################################ */

                var initSessionController = function() {
                    ccSession.connect(vertxSockJsUrl);

                    // init constants
                    var DEFAULT_ERROR_REASON = 'Please enter a valid name.';

                    // init model
                    var editor = null;
                    aceManager.getAceInstanceByElementId('sessionEditor', function (aceInstance) {
                        editor = aceInstance;
                        ccSession.setEditor(aceInstance);
                        console.log('getAceInstanceByElementId callback invoked!');
                    });

                    $scope.aceInitCode = ''; // The initially visible content of the editor
                    $scope.userName = '';
                    $scope.errorReason = DEFAULT_ERROR_REASON;
                    $scope.joinFailed = false;

                    // This is needed in order to show error messages properly
                    $scope.$watch('userName', function (newValue, oldValue) {
                        if (newValue !== oldValue) {
                            if ($scope.joinFailed) {
                                $scope.joinFailed = false;
                                $scope.errorReason = DEFAULT_ERROR_REASON;

                                if (angular.isDefined(newValue) && newValue.trim() !== '') {
                                    $scope.joinCodeCollabForm.userName.$invalid = false;
                                }
                            }
                        }
                    });

                    if (angular.isDefined($rootScope.codecollabSession)
                        && angular.isDefined($rootScope.codecollabSession.aceTheme)) {
                        $scope.aceTheme = $rootScope.codecollabSession.aceTheme;
                        console.log('aceTheme in rootScope available');
                    }
                    else {
                        $scope.aceTheme = aceData.getSupportedAceThemes();
                        console.log('aceTheme in rootScope NOT available');
                    }

                    if (angular.isDefined($rootScope.codecollabSession)
                        && angular.isDefined($rootScope.codecollabSession.aceMode)) {
                        $scope.aceMode = $rootScope.codecollabSession.aceMode;
                        console.log('aceMode in rootScope available');
                    }
                    else {
                        $scope.aceMode = aceData.getSupportedAceModes()['JavaScript'];
                        console.log('aceMode in rootScope NOT available');
                    }


                    // init protocol handler
                    protocolHandler.registerOnJoinedHandler(function (data) {
                        console.log("onJoinedHandler", data);
                        var code = data.code;
                        code = code.replace('#JOIN_URL#', $window.location.href);

                        $scope.$apply(function () {
                            $scope.aceInitCode = code;
                        })
                    });

                    protocolHandler.registerOnJoinFailedHandler(function (data) {
                        console.log("onJoinFailedHandler", data);
                        var reason = data.reason;

                        $scope.$apply(function () {
                            $scope.joinFailed = true;
                            $scope.errorReason = reason;
                            $scope.joinCodeCollabForm.userName.$dirty = true;
                            $scope.joinCodeCollabForm.userName.$invalid = true;
                        })
                    });

                    protocolHandler.registerOnUserJoinedHandler(function (data) {
                        console.log("onUserJoinedHandler", data);
                    });

                    protocolHandler.registerOnUserLeftHandler(function (data) {
                        console.log("onUserLeftHandler", data);
                    });

                    protocolHandler.registerOnCodeSnapshotHandler(function (data) {
                        console.log("onCodeSnapshotHandler", data);
                        var code = data.code;

                        $scope.$apply(function () {
                            $scope.aceInitCode = code;
                            $scope.showJoinForm = false;
                            $scope.aceTheme = data.aceTheme;
                            $scope.aceMode = data.aceMode;
                        });

                        if (data.allowEditing) {
                            // non-presenter can now start to make changes because they have the corresponding permission
                            $scope.registerOnAceEditorChangeHandler();
                        }
                        else {
                            if (editor !== null) {
                                editor.setReadOnly(true);
                                console.log('readOnly mode enabled!');
                            }
                        }
                    });

                    protocolHandler.registerOnTextInsertedHandler(function (data) {
                        console.log("onTextInsertedHandler", data);

                        if (editor !== null) {
                            editor.disableChangeEvents();
                            editor.getSession().insert({row: data.startRow, column: data.startColumn}, data.text);
                            editor.enableChangeEvents();
                        }
                    });

                    protocolHandler.registerOnLinesInsertedHandler(function (data) {
                        console.log("onLinesInsertedHandler", data);
                        if (editor !== null) {
                            if (data.lines) {
                                var lines = data.lines;
                                var session = editor.getSession();

                                editor.disableChangeEvents();
                                for (var i = 0; i < lines.length; i++) {
                                    session.insert({row: data.startRow + i, column: 0}, lines[i] + '\n');
                                }
                                editor.enableChangeEvents();
                            }
                        }
                    });

                    protocolHandler.registerOnTextRemovedHandler(function (data) {
                        console.log("onTextRemovedHandler", data);
                        if (editor !== null) {
                            editor.disableChangeEvents();
                            editor.getSession().remove(
                                aceManager.createNewRange(data.startRow, data.startColumn, data.endRow, data.endColumn)
                            );
                            editor.enableChangeEvents();
                        }
                    });

                    protocolHandler.registerOnLinesRemovedHandler(function (data) {
                        console.log("onLinesRemovedHandler", data);
                        if (editor !== null) {
                            editor.disableChangeEvents();
                            editor.getSession().remove(
                                aceManager.createNewRange(data.startRow, 0, data.endRow, 0)
                            );
                            editor.enableChangeEvents();
                        }
                    });

                    protocolHandler.registerOnOverHandler(function (data) {
                        console.log("onOverHandler", data);

                        var modal = $modal({
                            template: '/views/modal/modal-session-over.html',
                            show: true,
                            backdrop: 'static'
                        });
                    });

                    /* ################################################################################################## */
                    /* ################################################################################################## */
                    /* ################################################################################################## */

                    $scope.registerOnAceEditorChangeHandler = function () {
                        $scope.onAceEditorChange = function (action, text, lines, startRow, startColumn, endRow, endColumn) {
                            var msg;

                            if (action === 'removeLines') {
                                msg = JSON.stringify({
                                    type: action,
                                    data: {
                                        startRow: startRow,
                                        endRow: endRow
                                    }
                                });
                            }
                            else {
                                msg = JSON.stringify({
                                    type: action,
                                    data: {
                                        text: text,
                                        lines: lines,
                                        startRow: startRow,
                                        startColumn: startColumn,
                                        endRow: endRow,
                                        endColumn: endColumn
                                    }
                                });
                            }

                            ccSession.send(msg);
                        };
                    };

                    $scope.joinCodeCollab = function () {
                        var userName = '';
                        if (angular.isDefined($scope.userName)) {
                            userName = $scope.userName.trim();
                        }

                        if (userName !== '') {
                            // Afterwards it is expected that the 'onJoinedHandler' will be executed
                            ccSession.send(JSON.stringify({
                                type: 'join',
                                data: {
                                    userName: userName,
                                    sessionId: $routeParams.uuid
                                }
                            }));
                        }
                        else {
                            $scope.errorReason = DEFAULT_ERROR_REASON;
                            $scope.joinCodeCollabForm.userName.$dirty = true;
                            $scope.joinCodeCollabForm.userName.$invalid = true;
                        }
                    };

                    // handle presenter / non-presenter case
                    if ($rootScope.codecollabSession && $rootScope.codecollabSession.isPresenter) {
                        console.log('presenter!');
                        /*
                         console.log('codecollabSession.isPresenter',    $rootScope.codecollabSession.isPresenter);
                         console.log('codecollabSession.userName',       $rootScope.codecollabSession.userName);
                         console.log('codecollabSession.allowEditing',   $rootScope.codecollabSession.allowEditing);
                         console.log('codecollabSession.aceMode',        $rootScope.codecollabSession.aceMode);
                         */

                        $scope.isPresenter = true;
                        $scope.showJoinForm = false;

                        // immediately try to join
                        $scope.userName = $rootScope.codecollabSession.userName;
                        $scope.joinCodeCollab();
                        $scope.registerOnAceEditorChangeHandler();

                        // show modal overlay with session url
                        $scope.codecollabUrl = $window.location.href;
                        var modal = $modal({
                            scope: $scope,
                            template: '/views/modal/modal-session-id.html',
                            show: true,
                            backdrop: 'static'
                        });
                    }
                    else {
                        console.log('non-presenter!');
                        $scope.isPresenter = false;
                        $scope.showJoinForm = true;
                    }

                    /* ################################################################# */
                    /* ################################################################# */
                    /* ################################################################# */

                    // TODO: This is not the right place for this kind of logic!

                    var resizeHeight = function () {
                        var winHeight = $(window).height() - 40;
                        $('div#right-content').height(winHeight);
                    };

                    $(window).resize(function () {
                        resizeHeight();
                    });

                    resizeHeight();
                };

            }]);
