var container = require('container');
var console = require('console');
var vertx = require('vertx');

//container.deployVerticle("net.justphil.codecollab.MyVerticle")

//console.log("Deploying myverticle");

var CODE_COLLAB_SERVER = CODE_COLLAB_SERVER || {};

(function(S, undefined) {
    "use strict";

    if (undefined) {
        console.log('"undefined" is defined! This will probably lead to strange bugs.');
        console.log('The CodeCollab server won\'t start until you fix the problem!');
        return;
    }

    var Logger      = require('util/logger.js');
    var UUID        = require('util/uuid.js');
    var PubHandler  = require('handler/pub.js');
    var LOG         = new Logger('app.js');

    S.webServerConf = {
        port:       8080,
        host:       'localhost',
        web_root:   'webroot',
        bridge:     true,
        inbound_permitted: [
            {"address":"cc.pub.in"},
            {"address_re":"cc.priv.in_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"} // address_re = address regex
        ],
        outbound_permitted: [
            {"address":"cc.pub.out"},
            {"address_re":"cc.priv.out_[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}"} // // address_re = address regex
        ]
    };

    var ccHandlers = {};

    var eb = vertx.eventBus;

    var publicHandler = function(message, replier) {
        PubHandler.handlePublicMessage(eb, ccHandlers, message, replier);
    };

    var publicHandlerUUID = function(message) {
        LOG.i('I received a message with UUID ' + JSON.stringify(message));
        LOG.i('Generated UUID: ' + UUID.newUUID());
        eb.publish('cc.pub.out', message);
    };

    eb.registerHandler("cc.pub.in", publicHandler);
    eb.registerHandler("cc.priv.in_00000000-0000-002a-0000-00000000002a", publicHandlerUUID);

    container.deployModule('io.vertx~mod-web-server~2.0.0-SNAPSHOT', S.webServerConf, 1, function() {
        LOG.i("CodeCollab Server is up and running!");
    });
})(CODE_COLLAB_SERVER);
