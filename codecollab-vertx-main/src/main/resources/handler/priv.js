var Logger  = require('../util/logger.js');
var LOG     = new Logger('priv.js');

module.exports = {
    newPrivateCCHandler : function() {
        return function(msg, replier) {
            LOG.i('Private CC handler called.');
        };
    }
};
