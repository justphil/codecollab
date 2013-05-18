var vertx   = require('vertx');
var Logger  = require('util/logger.js');
var LOG     = new Logger('session.js');

module.exports = function(uuid, allowEditing, aceTheme, aceMode) {
    var uuid            = uuid;
    var collaborators   = {}; // sockId -> collaborator
    var allowEditing    = allowEditing;
    var aceTheme        = aceTheme;
    var aceMode         = aceMode;

    this.getSessionId = function() {
        return uuid;
    }

    this.addCollaborator = function(sockId, collab) {
        collaborators[sockId] = collab;
    };

    this.getCollaboratorSize = function() {
        return Object.keys(collaborators).length;
    };

    this.getCollaborators = function() {
        return collaborators;
    };

    this.getCollaboratorsExcept = function(excludedSockId) {
        var out = [];

        for (var sockId in collaborators) {
            if (collaborators.hasOwnProperty(sockId) && sockId !== excludedSockId) {
                var c = collaborators[sockId];
                out.push({
                    name: c.getName(),
                    sockId: sockId,
                    color: c.getColor()
                });
            }
        }

        return out;
    };

    this.getPresenter = function() {
        for (var sockId in collaborators) {
            if (collaborators.hasOwnProperty(sockId) && collaborators[sockId].isPresenter()) {
                return collaborators[sockId];
            }
        }

        return null;
    };

    this.isPresenter = function(sockId) {
        if (collaborators.hasOwnProperty(sockId)) {
            return collaborators[sockId].isPresenter();
        }
        else {
            return false;
        }
    };

    this.isCollaboratorWithName = function(name) {
        for (var sockId in collaborators) {
            if (collaborators.hasOwnProperty(sockId) && collaborators[sockId].getName() === name) {
                return true;
            }
        }

        return false;
    };

    this.getCollaboratorBySockId = function(sockId) {
        if (collaborators.hasOwnProperty(sockId)) {
            return collaborators[sockId];
        }
        else {
            return null;
        }
    };

    this.removeCollaborator = function(sockId) {
        if (collaborators.hasOwnProperty(sockId)) {
            delete collaborators[sockId];
        }
    };

    this.getAllowEditing = function() {
        return allowEditing;
    };

    this.getAceTheme = function() {
        return aceTheme;
    };

    this.getAceMode = function() {
        return aceMode;
    };

    this.broadcast = function(senderSockId, msgObj) {
        var buff = new vertx.Buffer(JSON.stringify(msgObj));

        for (var sockId in collaborators) {
            if (collaborators.hasOwnProperty(sockId) && senderSockId !== sockId) {
                collaborators[sockId].getSock().write(buff);
                LOG.i('broadcast! ' + sockId);
            }
        }
    };

    this.cleanUp = function() {
        var closedSockets = [];

        for (var sockId in collaborators) {
            if (collaborators.hasOwnProperty(sockId)) {
                collaborators[sockId].getSock().close();
                closedSockets.push(sockId);
                delete collaborators[sockId];
            }
        }

        return closedSockets;
    };
};
