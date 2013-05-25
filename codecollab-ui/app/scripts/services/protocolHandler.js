'use strict';

angular.module('codecollabUiApp')
    .factory('protocolHandler', function () {
        var onJoinedHandler;
        var onUserJoinedHandler;
        var onUserLeftHandler;
        var onJoinFailedHandler;
        var onTextInsertedHandler;
        var onLinesInsertedHandler;
        var onTextRemovedHandler;
        var onLinesRemovedHandler;
        var onCodeSnapshotHandler;
        var onOverHandler;
        var onStreamMessageHandler;
        var onChangeCursorHandler;

        var reset = function() {
            onJoinedHandler         = [];
            onUserJoinedHandler     = [];
            onUserLeftHandler       = [];
            onJoinFailedHandler     = [];
            onTextInsertedHandler   = [];
            onLinesInsertedHandler  = [];
            onTextRemovedHandler    = [];
            onLinesRemovedHandler   = [];
            onCodeSnapshotHandler   = [];
            onOverHandler           = [];
            onStreamMessageHandler  = [];
            onChangeCursorHandler   = [];
        };

        reset();

        // Service logic
        var distributeMessage = function(data, handlerArray) {
            for (var i = 0; i < handlerArray.length; i++) {
                var handler = handlerArray[i];
                handler(data);
            }
        };

        var onJoined = function(data) {
            distributeMessage(data, onJoinedHandler);
        };

        var onUserJoined = function(data) {
            distributeMessage(data, onUserJoinedHandler);
        };

        var onUserLeft = function(data) {
            distributeMessage(data, onUserLeftHandler);
        };

        var onJoinFailed = function(data) {
            distributeMessage(data, onJoinFailedHandler);
        };

        var onTextInserted = function(data) {
            distributeMessage(data, onTextInsertedHandler);
        };

        var onLinesInserted = function(data) {
            distributeMessage(data, onLinesInsertedHandler);
        };

        var onTextRemoved = function(data) {
            distributeMessage(data, onTextRemovedHandler);
        };

        var onLinesRemoved = function(data) {
            distributeMessage(data, onLinesRemovedHandler);
        };

        var onCodeSnapshot = function(data) {
            distributeMessage(data, onCodeSnapshotHandler);
        };

        var onOver = function(data) {
            distributeMessage(data, onOverHandler);
        };

        var onStreamMessage = function(data) {
            distributeMessage(data, onStreamMessageHandler);
        };

        var onChangeCursor = function(data) {
            distributeMessage(data, onChangeCursorHandler);
        };

        // Public API here
        return {
            reset: function() {
                reset();
            },

            onJoined: function(data) {
                onJoined(data);
            },
            registerOnJoinedHandler: function(handler) {
                onJoinedHandler.push(handler);
            },

            onUserJoined: function(data) {
                onUserJoined(data);
            },
            registerOnUserJoinedHandler: function(handler) {
                onUserJoinedHandler.push(handler);
            },

            onUserLeft: function(data) {
                onUserLeft(data);
            },
            registerOnUserLeftHandler: function(handler) {
                onUserLeftHandler.push(handler);
            },

            onJoinFailed: function(data) {
                onJoinFailed(data);
            },
            registerOnJoinFailedHandler: function(handler) {
                onJoinFailedHandler.push(handler);
            },

            onTextInserted: function(data) {
                onTextInserted(data);
            },
            registerOnTextInsertedHandler: function(handler) {
                onTextInsertedHandler.push(handler);
            },

            onLinesInserted: function(data) {
                onLinesInserted(data);
            },
            registerOnLinesInsertedHandler: function(handler) {
                onLinesInsertedHandler.push(handler);
            },

            onTextRemoved: function(data) {
                onTextRemoved(data);
            },
            registerOnTextRemovedHandler: function(handler) {
                onTextRemovedHandler.push(handler);
            },

            onLinesRemoved: function(data) {
                onLinesRemoved(data);
            },
            registerOnLinesRemovedHandler: function(handler) {
                onLinesRemovedHandler.push(handler);
            },

            onCodeSnapshot: function(data) {
                onCodeSnapshot(data);
            },
            registerOnCodeSnapshotHandler: function(handler) {
                onCodeSnapshotHandler.push(handler);
            },

            onOver: function(data) {
                onOver(data);
            },
            registerOnOverHandler: function(handler) {
                onOverHandler.push(handler);
            },

            onStreamMessage: function(data) {
                onStreamMessage(data);
            },
            registerOnStreamMessageHandler: function(handler) {
                onStreamMessageHandler.push(handler);
            },

            onChangeCursor: function(data) {
                onChangeCursor(data);
            },
            registerOnChangeCursorHandler: function(handler) {
                onChangeCursorHandler.push(handler);
            }
        };
    });
