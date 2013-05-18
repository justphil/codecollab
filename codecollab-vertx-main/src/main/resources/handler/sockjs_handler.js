var vertx           = require('vertx');
var CONST           = require('cfg/const.js');
var Logger          = require('util/logger.js');
var Color           = require('util/color.js');
var Collaborator    = require('model/collaborator.js');
var LOG             = new Logger('sockjs_handler.js');

var broadcast = function(sessionManager, senderSock, msg) {
    var sockId      = senderSock[CONST.SOCK_ID_KEY]();
    var sessionId   = sessionManager.getSessionId(sockId);
    var session     = sessionManager.getSession(sessionId);
    session.broadcast(sockId, msg);
};

var handleNonPresenterDisconnected = function(sessionManager, session, sock) {
    // non-presenter has disconnected -> session continues
    var sockId  = sock[CONST.SOCK_ID_KEY]();
    var name    = session.getCollaboratorBySockId(sockId).getName();

    LOG.i('Non-presenter has disconnected: ' + name);

    var leftMsg = {
        type: CONST.PROTOCOL.MSG_TYPE_LEFT,
        data: {
            sockId: sockId,
            name: name
        }
    };
    broadcast(sessionManager, sock, leftMsg); // broadcast(...) expects a JSON object as msg!

    // clean up
    session.removeCollaborator(sockId);
    sessionManager.unassociateSocket(sockId);
};

module.exports = function(sessionManager) {
    this.onMessage = function(sock, msg) {
        LOG.i("SockJS message received in onMessage() handler! msg -> " + JSON.stringify(msg));
        if (msg.type === CONST.PROTOCOL.MSG_TYPE_JOIN) {
            var name        = msg.data.userName;
            var sessionId   = msg.data.sessionId;
            var session     = sessionManager.getSession(sessionId);

            if (!session) {
                var responseMsg = JSON.stringify({
                    type: CONST.PROTOCOL.MSG_TYPE_JOIN_FAILED,
                    data: {
                        reason: 'There is no session with id ' + sessionId + '.'
                    }
                });
                sock.write(new vertx.Buffer(responseMsg));
            }
            else if (session.isCollaboratorWithName(name)) {
                var responseMsg = JSON.stringify({
                    type: CONST.PROTOCOL.MSG_TYPE_JOIN_FAILED,
                    data: {
                        reason: 'There is already a session participant with the name "'+name+'".<br>Please choose another name!'
                    }
                });
                sock.write(new vertx.Buffer(responseMsg));
            }
            else {
                var isPresenter = session.getCollaboratorSize() === 0; // The first collaborator that joins is the presenter.
                var color       = Color.generateColor();
                var collaborator= new Collaborator(name, sock, isPresenter, color);
                var sockId      = sock[CONST.SOCK_ID_KEY]();
                session.addCollaborator(sockId, collaborator);

                sessionManager.associateSocket(sockId, sessionId);

                if (isPresenter) {
                    var initCode =    '/* \n'
                        + ' * Other collaborators can join this CodeCollab session by pointing\n'
                        + ' * their browser to the following URL:\n'
                        + ' * #JOIN_URL#\n'
                        + ' *\n'
                        + ' * Have fun with your CodeCollab session and don\'t forget\n'
                        + ' * to spread the word! ;-)\n'
                        + ' */\n';

                    var msgToSend = JSON.stringify({
                        type: CONST.PROTOCOL.MSG_TYPE_JOINED,
                        data: {
                            code: initCode,
                            sockId: sockId,
                            color: color
                        }
                    });

                    sock.write(new vertx.Buffer(msgToSend));
                    LOG.i('Collaborator ' + name + ' has joined! sockId: ' + sockId + ' # isPresenter: ' + isPresenter);
                }
                else {
                    var presenter = session.getPresenter();

                    var requestCodeMsg = JSON.stringify({
                        type: CONST.PROTOCOL.MSG_TYPE_CODE_REQUESTED,
                        data: {
                            requesterSockId: sockId
                        }
                    });

                    var presenterSock = presenter.getSock();
                    presenterSock.write(new vertx.Buffer(requestCodeMsg));
                }
            }
        }
        else if (msg.type === CONST.PROTOCOL.MSG_TYPE_CODE_SNAPSHOT) {
            var receiverSockId  = msg.data.receiverSockId;
            var code            = msg.data.code;

            var sessionId = sessionManager.getSessionId(receiverSockId);

            if (sessionId) {
                var session     = sessionManager.getSession(sessionId);
                var requester   = session.getCollaboratorBySockId(receiverSockId);
                if (requester !== null) {
                    var color = requester.getColor();

                    // send the requester the received code snapshot
                    requester.getSock().write(new vertx.Buffer(JSON.stringify({
                        type: CONST.PROTOCOL.MSG_TYPE_CODE_SNAPSHOT,
                        data: {
                            code:           code,
                            color:          color,
                            sockId:         receiverSockId,
                            aceMode:        session.getAceMode(),
                            aceTheme:       session.getAceTheme(),
                            allowEditing:   session.getAllowEditing(),
                            collaborators:  session.getCollaboratorsExcept(receiverSockId)
                        }
                    })));

                    // now the requester has completely joined the session
                    var userJoinedMsg = {
                        type: CONST.PROTOCOL.MSG_TYPE_USER_JOINED,
                        data: {
                            name:   requester.getName(),
                            sockId: receiverSockId,
                            color:  color
                        }
                    };
                    broadcast(sessionManager, requester.getSock(), userJoinedMsg);
                }
            }
        }
        else if (msg.type === CONST.PROTOCOL.MSG_TYPE_INSERT_TEXT
                    || msg.type === CONST.PROTOCOL.MSG_TYPE_INSERT_LINES
                    || msg.type === CONST.PROTOCOL.MSG_TYPE_REMOVE_TEXT
                    || msg.type === CONST.PROTOCOL.MSG_TYPE_REMOVE_LINES) {
            broadcast(sessionManager, sock, msg);
        }
    };

    this.onClose = function(sock) {
        var sockId      = sock[CONST.SOCK_ID_KEY]();
        var sessionId   = sessionManager.getSessionId(sockId);
        if (sessionId) {
            var session = sessionManager.getSession(sessionId);
            if (session) {
                if (session.isPresenter(sockId)) {
                    // presenter has disconnected -> session over

                    // broadcast session over message
                    var overMsg = {
                        type: CONST.PROTOCOL.MSG_TYPE_OVER
                    };
                    broadcast(sessionManager, sock, overMsg); // broadcast(...) expects a JSON object as msg!

                    // execute non-presenter logic...
                    handleNonPresenterDisconnected(sessionManager, session, sock);

                    // clean up
                    var sockIdsToUnassociateArray = session.cleanUp();
                    for (var i = 0; i < sockIdsToUnassociateArray.length; i++) {
                        sessionManager.unassociateSocket(sockIdsToUnassociateArray[i]);
                    }
                    sessionManager.removeSession(sessionId);
                }
                else {
                    // non-presenter has disconnected -> session continues
                    handleNonPresenterDisconnected(sessionManager, session, sock);
                }
            }
        }
    };
};
