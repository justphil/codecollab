var Logger      = require('../util/logger.js');
var UUID        = require('../util/uuid.js');
var PrivHandler = require('./priv.js');
var LOG         = new Logger('pub.js');


var onStartNewCodeCollab = function(eb, ccHandlers, msg, replier) {
    LOG.i('StartNewCodeCollab: ' + JSON.stringify(msg));
    var uuid                = UUID.newUUID();
    var privHandler         = PrivHandler.newPrivateCCHandler();
    var privHandlerAddress  = "cc.priv.in_" + uuid;
    eb.registerHandler(privHandlerAddress, privHandler);

    LOG.i('Private CC handler "' + privHandlerAddress + '" registered.');

    ccHandlers[uuid] = privHandler;
    replier({
        type: 'startedNewCodeCollab',
        ccAddress: privHandlerAddress,
        uuid: uuid
    });
};

module.exports = {
    handlePublicMessage : function(eb, ccHandlers, msg, replier) {
        if (msg.type && msg.type === "startNewCodeCollab") {
            onStartNewCodeCollab(eb, ccHandlers, msg, replier);
        }
        else {
            LOG.i("Invalid CC message: " + JSON.stringify(msg));
        }
    }
};
