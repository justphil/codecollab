var container   = require('vertx/container');
//var console     = require('console');
var vertx       = require('vertx');

//container.deployVerticle("net.justphil.codecollab.MyVerticle")

//console.log("Deploying myverticle");

var CODE_COLLAB_SERVER = CODE_COLLAB_SERVER || {};

(function(S, undefined) {
    "use strict";

    var Logger = require('util/logger.js');
    var LOG = new Logger('server.js');

    // check if undefined is really undefined, if not fail fast
    if (undefined) {
        LOG.i('"undefined" is defined! This will probably lead to strange bugs.');
        LOG.i('The CodeCollab server won\'t start until you fix the problem!');
        return;
    }

    // init basic objects
    var CONST           = require('cfg/const.js');
    var SessionManager  = require('management/session_manager.js');
    var RouteMatcher    = require('handler/http_route_matcher.js');
    var SockJSHandler   = require('handler/sockjs_handler.js');
    var sessionManager  = new SessionManager();
    var sockJsHandler   = new SockJSHandler(sessionManager);

    // init http server with the route matcher
    S.httpServer = vertx.createHttpServer().requestHandler(
        RouteMatcher(sessionManager)
    );

    // extend http server with sockjs features
    S.sockJSServer = vertx.createSockJSServer(S.httpServer);

    // sockjs config
    S.sockJSConfig = { prefix: CONST.SOCKJS_PREFIX };

    // install sockjs app (register corresponding handlers)
    S.sockJSServer.installApp(S.sockJSConfig, function (sock) {
        // onmessage callback
        sock.dataHandler(function (buffer) {
            var data = JSON.parse(buffer.toString());
            sockJsHandler.onMessage(sock, data);
        });

        // onclose callback
        sock.endHandler(function() {
            sockJsHandler.onClose(sock);
        });

        LOG.i('sockjs id: ' + sock[CONST.SOCK_ID_KEY]());
    });

    // bind http server to the specified port and start listening for requests
    var port = CONST.DEFAULT_PORT;
    if (container.env.PORT) {
        port = container.env.PORT;
    }
    S.httpServer.listen(port);
    LOG.i('CodeCollab server is up and running on port ' + port + '!');
})(CODE_COLLAB_SERVER);
