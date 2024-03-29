'use strict';

angular.module('codecollabUiApp')
    .controller('SessionCtrl',
        ['$scope', '$rootScope', '$location', '$routeParams', '$window', '$http', '$modal',
            'ccSession', 'protocolHandler', 'aceManager', 'aceData', 'aceCursor', 'VERTX_PORT',
            function ($scope, $rootScope, $location, $routeParams, $window, $http, $modal, ccSession, protocolHandler, aceManager, aceData, aceCursor, VERTX_PORT) {
                console.log('### ### SessionCtrl invoked! ### ###');

                aceManager.reset();
                aceCursor.reset();
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
                    var markers = {}; // sockId -> markerId (string -> number)
                    var selections = {}; // sockId -> markerId (string -> number) ... selection is also a marker
                    aceManager.getAceInstanceByElementId('sessionEditor', function (aceInstance) {
                        editor = aceInstance;
                        ccSession.setEditor(aceInstance);
                        console.log('getAceInstanceByElementId callback invoked!');
                    });

                    $scope.session = {
                        collaborators: [], // {uuid: '1', name: 'phil', color: '#CB2626'}
                        stream: []
                    };
                    $scope.aceInitCode  = ''; // The initially visible content of the editor
                    $scope.userName     = '';
                    $scope.sockId       = '';
                    $scope.color        = '';
                    $scope.errorReason  = DEFAULT_ERROR_REASON;
                    $scope.joinFailed   = false;
                    $scope.joined       = false;
                    $scope.chatMessage  = '';

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

                    if (angular.isDefined($rootScope.codecollabSession)
                        && angular.isDefined($rootScope.codecollabSession.uuid)) {
                        $scope.uuid = $rootScope.codecollabSession.uuid;
                        console.log('uuid in rootScope available');
                    }
                    else {
                        $scope.uuid = $routeParams.uuid;
                        console.log('uuid in rootScope NOT available');
                    }


                    // init protocol handler
                    protocolHandler.registerOnJoinedHandler(function (data) {
                        console.log("onJoinedHandler", data);
                        var code    = data.code;
                        var sockId  = data.sockId;
                        var color   = data.color;
                        code = code.replace('#JOIN_URL#', $window.location.href);

                        $scope.$apply(function () {
                            $scope.joined       = true;
                            $scope.aceInitCode  = code;
                            $scope.sockId       = sockId;
                            $scope.color        = color;
                            // add presenter to the collaborators array
                            handleJoinedCollaborator(sockId, $scope.userName, color);
                            handleNewStreamMessage(
                                'system', '#FFFFFF', $scope.userName + " has started the session!", true
                            );
                        });
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

                        aceCursor.addCursorClass(data.name, data.sockId, data.color);
                        aceCursor.addSelectionClass(data.sockId, data.color);

                        $scope.$apply(function () {
                            // add collaborator to the collaborators array
                            handleJoinedCollaborator(data.sockId, data.name, data.color);
                            handleNewStreamMessage(
                                'system', '#FFFFFF', data.name + " has joined the session!", true
                            );
                        });
                    });

                    protocolHandler.registerOnUserLeftHandler(function (data) {
                        console.log("onUserLeftHandler", data);

                        removeCursor(markers, editor.getSession(), data.sockId);
                        aceCursor.removeCursorClass(data.sockId);
                        aceCursor.removeSelectionClass(data.sockId);

                        $scope.$apply(function () {
                            // remove collaborator from the collaborators array
                            var leftCollaborator = handleLeftCollaborator(data.sockId);
                            if (leftCollaborator) {
                                handleNewStreamMessage(
                                    'system', '#FFFFFF', leftCollaborator.name + " has left the session!", true
                                );
                            }
                        });
                    });

                    // this handler will only be invoked if this user is a non-presenter and joins the session
                    protocolHandler.registerOnCodeSnapshotHandler(function (data) {
                        console.log("onCodeSnapshotHandler", data);
                        var code = data.code;

                        $scope.$apply(function () {
                            $scope.joined       = true;
                            $scope.aceInitCode  = code;
                            $scope.aceTheme     = data.aceTheme;
                            $scope.aceMode      = data.aceMode;
                            $scope.sockId       = data.sockId;
                            $scope.color        = data.color;
                            // all other collaborators
                            var collaborators = data.collaborators;
                            for (var i = 0; i < collaborators.length; i++) {
                                handleJoinedCollaborator(
                                    collaborators[i].sockId, collaborators[i].name, collaborators[i].color
                                );
                                aceCursor.addCursorClass(collaborators[i].name, collaborators[i].sockId, collaborators[i].color);
                                aceCursor.addSelectionClass(collaborators[i].sockId, collaborators[i].color);
                            }
                            // myself
                            handleJoinedCollaborator(data.sockId, $scope.userName, data.color);
                            handleNewStreamMessage(
                                'system', '#FFFFFF', $scope.userName + " has joined the session!", true
                            );
                            showSessionArea();
                        });

                        if (data.allowEditing) {
                            // non-presenter can now start to make changes because he has permission
                            editor.setReadOnly(false);
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
                            var session = editor.getSession();
                            editor.disableChangeEvents();
                            session.insert({row: data.startRow, column: data.startColumn}, data.text);
                            shiftCursor(markers, session, data.sockId, data.endRow, data.endColumn);
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
                                var i;
                                for (i = 0; i < lines.length; i++) {
                                    session.insert({row: data.startRow + i, column: 0}, lines[i] + '\n');
                                }
                                shiftCursor(markers, session, data.sockId, data.startRow + i, 0);
                                editor.enableChangeEvents();
                            }
                        }
                    });

                    protocolHandler.registerOnTextRemovedHandler(function (data) {
                        console.log("onTextRemovedHandler", data);
                        if (editor !== null) {
                            editor.disableChangeEvents();
                            var session = editor.getSession();
                            session.remove(
                                aceManager.createNewRange(data.startRow, data.startColumn, data.endRow, data.endColumn)
                            );
                            shiftCursor(markers, session, data.sockId, data.startRow, data.startColumn);
                            editor.enableChangeEvents();
                        }
                    });

                    protocolHandler.registerOnLinesRemovedHandler(function (data) {
                        console.log("onLinesRemovedHandler", data);
                        if (editor !== null) {
                            editor.disableChangeEvents();
                            var session = editor.getSession();
                            session.remove(
                                aceManager.createNewRange(data.startRow, 0, data.endRow, 0)
                            );
                            shiftCursor(markers, session, data.sockId, data.startRow, 0);
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

                    protocolHandler.registerOnStreamMessageHandler(function (data) {
                        console.log("onStreamMessageHandler", data);

                        $scope.$apply(function () {
                            handleNewStreamMessage(data.name, data.color, data.msg, data.system);
                        });
                    });

                    protocolHandler.registerOnChangeCursorHandler(function (data) {
                        console.log("onChangeCursorHandler", data);

                        var session = editor.getSession();
                        shiftCursor(markers, session, data.sockId, data.row, data.column);
                    });

                    protocolHandler.registerOnChangeSelectionHandler(function (data) {
                        console.log("onChangeSelectionHandler", data);

                        var session = editor.getSession();
                        shiftSelection(
                            selections, session, data.sockId,
                            data.startRow, data.startColumn, data.endRow, data.endColumn
                        );
                    });

                    /* ################################################################################################## */
                    /* ################################################################################################## */
                    /* ################################################################################################## */

                    $scope.registerOnAceEditorChangeHandler = function () {
                        // register onChange listener
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

                        // register onChangeCursor listener
                        $scope.onAceEditorChangeCursor = function (action, row, column) {
                            if ($scope.joined) {
                                var msg = JSON.stringify({
                                    type: action,
                                    data: {
                                        row:    row,
                                        column: column
                                    }
                                });

                                ccSession.send(msg);
                            }
                        };

                        // register onChangeSelection listener
                        $scope.onAceEditorChangeSelection = function (action, startRow, startColumn, endRow, endColumn) {
                            if ($scope.joined) {
                                var msg = JSON.stringify({
                                    type: action,
                                    data: {
                                        startRow:       startRow,
                                        startColumn:    startColumn,
                                        endRow:         endRow,
                                        endColumn:      endColumn
                                    }
                                });

                                ccSession.send(msg);
                            }
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

                    $scope.sendChatMessage = function() {
                        var msg = $scope.chatMessage;

                        if (angular.isDefined(msg)) {
                            var trimmedMsg = msg.trim();
                            if (trimmedMsg !== '') {
                                var name    = $scope.userName;
                                var color   = $scope.color;
                                var system  = false;
                                handleNewStreamMessage(name, color, msg, system);
                                ccSession.send(JSON.stringify({
                                    type: 'stream_message',
                                    data: {
                                        name:   name,
                                        color:  color,
                                        msg:    msg,
                                        system: system
                                    }
                                }));
                            }
                        }

                        $scope.chatMessage = '';
                    };

                    // handle presenter / non-presenter case
                    if ($rootScope.codecollabSession    && $rootScope.codecollabSession.isPresenter
                                                        && $scope.uuid === $routeParams.uuid) {
                        console.log('presenter!');
                        /*
                         console.log('codecollabSession.isPresenter',    $rootScope.codecollabSession.isPresenter);
                         console.log('codecollabSession.userName',       $rootScope.codecollabSession.userName);
                         console.log('codecollabSession.allowEditing',   $rootScope.codecollabSession.allowEditing);
                         console.log('codecollabSession.aceMode',        $rootScope.codecollabSession.aceMode);
                         */

                        $scope.isPresenter = true;
                        showSessionArea();

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

                        // automatically select the url in the input field
                        $window.setTimeout(function() {
                            angular.element('div.modal-body input.codecollabUrl').select();
                        }, 500);
                    }
                    else {
                        console.log('non-presenter!');
                        $scope.isPresenter = false;
                        $scope.uuid = $routeParams.uuid;
                        $scope.aceInitCode = aceData.generateInitCode($scope.isPresenter);
                        showJoinForm();
                    }

                };
                // end of initSessionController()
                /* ################################################################################ */
                /* ################################################################################ */
                /* ################################################################################ */

                var showJoinForm = function() {
                    $scope.showJoinForm         = true;
                    $scope.showCollaborators    = false;
                };

                var showSessionArea = function() {
                    $scope.showJoinForm         = false;
                    $scope.showCollaborators    = true;
                };

                var handleJoinedCollaborator = function(sockId, name, color) {
                    $scope.session.collaborators.push(createCollaborator(sockId, name, color));
                };

                var handleLeftCollaborator = function(sockId) {
                    var coll = $scope.session.collaborators;
                    var index = -1;
                    for (var i = 0; i < coll.length; i++) {
                        if (coll[i].uuid === sockId) {
                            index = i;
                            break;
                        }
                    }

                    var collaborator = null;

                    if (index !== -1) {
                        collaborator = coll[index];
                        coll.splice(index, 1);
                    }

                    return collaborator;
                };

                var removeCursor = function(markers, session, sockId) {
                    if (markers.hasOwnProperty(sockId)) {
                        session.removeMarker(markers[sockId]);
                    }
                };

                var shiftCursor = function(markers, session, sockId, endRow, endColumn) {
                    removeCursor(markers, session, sockId);
                    markers[sockId] = session.addMarker(
                        aceManager.createNewRange(endRow, endColumn, endRow, endColumn + 1),
                        "ace_cursor c-" + sockId, "text", true
                    );
                };

                var removeSelection = function(selections, session, sockId) {
                    if (selections.hasOwnProperty(sockId)) {
                        session.removeMarker(selections[sockId]);
                    }
                };

                var shiftSelection = function(selections, session, sockId, startRow, startColumn, endRow, endColumn) {
                    removeSelection(selections, session, sockId);
                    selections[sockId] = session.addMarker(
                        aceManager.createNewRange(startRow, startColumn, endRow, endColumn),
                        "ace_selection s-" + sockId, "text", true
                    );
                };

                var handleNewStreamMessage = function(name, color, msg, system) {
                    $scope.session.stream.push(
                        createStreamMessage(name, color, msg, system)
                    );
                };

                var createCollaborator = function(sockId, name, color) {
                    return {
                        uuid: sockId, name: name, color: color
                    };
                };

                var createStreamMessage = function(name, color, msg, system) {
                    return {time: new Date().getTime(), name: name, color: color, msg: msg, system: system};
                };

                /* ################################################################# */
                /* ################################################################# */
                /* ################################################################# */

                // TODO: This is not the right place for this kind of logic!

                var resizeHeight = function () {
                    var winHeight = $(window).height() - 40;
                    $('div#right-content').height(winHeight);


                    //var collaboratorsPanelHeight = $('div#collaborators-panel').height();
                    $('div#stream-panel').height(winHeight - 184);
                };

                $(window).resize(function () {
                    resizeHeight();
                });

                resizeHeight();

            }]);
