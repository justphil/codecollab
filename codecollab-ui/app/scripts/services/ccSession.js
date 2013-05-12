'use strict';

angular.module('codecollabUiApp')
    .factory('ccSession', ['protocolHandler', function (protocolHandler) {
        // Service logic
        var sock;
        var state;
        var buffer = [];
        var editor = null;

        var STATE = {
            CONNECTED       : 1,
            DISCONNECTED    : 2
        };

        state = STATE.DISCONNECTED;

        var connect = function(url) {
            if (isConnected()) {
                console.log('Already connected. So first disconnect from old session...');
                close();
                state = STATE.DISCONNECTED;
            }

            sock = new SockJS(url);

            sock.onopen = function() {
                console.log('sockjs open');
                state = STATE.CONNECTED;
                sendBuffer();
            };

            sock.onmessage = function(e) {
                var msg = JSON.parse(e.data);

                if (msg.type === "joined") {
                    protocolHandler.onJoined(msg.data);
                }
                else if (msg.type === "userJoined") {
                    protocolHandler.onUserJoined(msg.data);
                }
                else if (msg.type === "left") {
                    protocolHandler.onUserLeft(msg.data);
                }
                else if (msg.type === "joinFailed") {
                    protocolHandler.onJoinFailed(msg.data);
                }
                else if (msg.type === "codeRequested") {
                    if (editor !== null) {
                        var code = editor.getValue();
                        send(JSON.stringify({
                            type: 'codeSnapshot',
                            data: {
                                receiverSockId: msg.data.requesterSockId,
                                code: code
                            }
                        }));
                    }
                }
                else if (msg.type === "codeSnapshot") {
                    protocolHandler.onCodeSnapshot(msg.data);
                }
                else if (msg.type === "insertText") {
                    protocolHandler.onTextInserted(msg.data);
                }
                else if (msg.type === "insertLines") {
                    protocolHandler.onLinesInserted(msg.data);
                }
                else if (msg.type === "removeText") {
                    protocolHandler.onTextRemoved(msg.data);
                }
                else if (msg.type === "removeLines") {
                    protocolHandler.onLinesRemoved(msg.data);
                }
                else if (msg.type === "over") {
                    protocolHandler.onOver(msg.data);
                }
                else {
                    console.log('Unknown SockJS message:', msg);
                }
            };

            sock.onclose = function() {
                console.log('sockjs close');
                state = STATE.DISCONNECTED;
            };
        };

        var close = function() {
            if (sock && state === STATE.CONNECTED) {
                sock.close();
                sock = null;
            }
        };

        var send = function(msg) {
            if (sock && state === STATE.CONNECTED) {
                sock.send(msg);
            }
            else {
                buffer.push(msg);
            }
        };

        var sendBuffer = function() {
            while (buffer.length > 0) {
                console.log("Sending buffered msg!");
                send(buffer.pop());
            }
        };

        var isConnected = function() {
            return state === STATE.CONNECTED;
        };


        // Public API here
        return {
            connect: function (url) {
                connect(url);
            },
            close: function() {
                close();
            },
            send: function(msg) {
                send(msg);
            },
            isConnected: function() {
                isConnected();
            },
            getSock: function() {
                return sock;
            },
            setEditor: function(editorInstance) {
                editor = editorInstance;
            }
        };
    }]);
