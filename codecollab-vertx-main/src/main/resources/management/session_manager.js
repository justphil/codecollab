var Logger  = require('util/logger.js');
var LOG     = new Logger('session_manager.js');

module.exports = function() {
    var sessions = {}; // sessionId -> session
    var sockToSessMap = {}; // sockId -> sessionId

    this.startNewSession = function(session) {
        var sessionId = session.getSessionId();
        sessions[sessionId] = session;

        LOG.i('startNewSession with id: ' + sessionId);
    };

    this.getSession = function(sessionId) {
        LOG.i('getSession with id: ' + sessionId);

        return sessions[sessionId];
    };

    this.getSessionId = function(sockId) {
        LOG.i('getSessionId with id: ' + sockId);

        return sockToSessMap[sockId];
    };

    this.removeSession = function(sessionId) {
        if (sessions.hasOwnProperty(sessionId)) {
            delete sessions[sessionId];
            LOG.i('removeSession sessionId: "' + sessionId);
        }
    };

    this.associateSocket = function(sockId, sessionId) {
        sockToSessMap[sockId] = sessionId;

        LOG.i('associateSocket sockId: "' + sockId + '" with sessionId: "' + sessionId + '"');
    };

    this.unassociateSocket = function(sockId) {
        if (sockToSessMap.hasOwnProperty(sockId)) {
            delete sockToSessMap[sockId];
            LOG.i('unassociateSocket sockId: "' + sockId);
        }
    };
};
