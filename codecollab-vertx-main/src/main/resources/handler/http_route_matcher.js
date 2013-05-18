var vertx           = require('vertx');
var Logger          = require('util/logger.js');
var UUID            = require('util/uuid.js');
var Session         = require('model/session.js');
var LOG             = new Logger('http_route_matcher.js');

var makeCORS = function(req) {
    req.response
        .putHeader('Access-Control-Allow-Origin', '*')
        .putHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

    var reqHeaders = req.headers();

    //LOG.i(Object.keys(req.headers()));

    //LOG.i('Value of access-control-request-headers: ' + reqHeaders.get('access-control-request-headers'));

    if (reqHeaders.get('access-control-request-headers')) {
        req.response.putHeader('Access-Control-Allow-Headers', reqHeaders.get('access-control-request-headers'));
    }
};

module.exports = function(sessionManager) {

    var routeMatcher = new vertx.RouteMatcher();

    /*
     presenter:      $scope.userName,
     allowEditing:   $scope.allowEditing,
     aceTheme:       'ace/theme/monokai',
     aceMode:        aceModeMap[$scope.aceMode]
     */

    routeMatcher.get('/session/:sessionId', function(req) {
        var sessionId = req.params().get('sessionId');
        makeCORS(req);
        var res;
        if (sessionManager.isSession(sessionId)) {
            var session = sessionManager.getSession(sessionId);

            res = {
                allowEditing:   session.getAllowEditing(),
                aceTheme:       session.getAceTheme(),
                aceMode:        session.getAceMode(),
                collaborators:  {}
            };

            var collaborators = session.getCollaborators();
            for (var sockId in collaborators) {
                if (collaborators.hasOwnProperty(sockId)) {
                    res.collaborators[sockId] = collaborators[sockId].getName();
                }
            }

            req.response.end(JSON.stringify(res));
        }
        else {
            req.response.statusCode(404);
            res = {
                msg: 'Session with id ' + sessionId + ' not found.'
            };
            req.response.end(JSON.stringify(res));
        }
    });

    routeMatcher.post('/session', function (req) {
        req.bodyHandler(function(bodyData) {
            var data = JSON.parse(bodyData.toString());
            LOG.i('presenter: ' + data.presenter);
            LOG.i('allowEditing: ' + data.allowEditing);
            LOG.i('aceTheme: ' + data.aceTheme);
            LOG.i('aceMode: ' + data.aceMode);

            makeCORS(req);
            //var uuid = req.params().uuid;

            var uuid = UUID.newUUID();
            var sess = new Session(uuid, data.allowEditing, data.aceTheme, data.aceMode);

            sessionManager.startNewSession(sess);
            LOG.i('New session started with id: ' + uuid);
            req.response.end(JSON.stringify({uuid: uuid}));
        });
    });

    routeMatcher.options('/session', function (req) {
        makeCORS(req);
        req.response.end();
    });

    routeMatcher.options('/session/:sessionId', function (req) {
        makeCORS(req);
        req.response.end();
    });

    // fall back: serve static files hack
    routeMatcher.noMatch(function(req) {
        var PATH = req.path();
        LOG.i("Incoming HTTP request! Path -> " + PATH);

        if (PATH === '/') {
            var index = './webapp/index.html';
            vertx.fileSystem.exists(index, function (err, res) {
                if (!err) {
                    if (res) {
                        req.response.sendFile(index);
                    }
                    else {
                        var html =  '<html><head><title>No index.html available</title></head>' +
                            '<body><h1>No index.html available</h1></body></html>';
                        req.response.end(html);
                    }
                }
                else {
                    req.response.statusCode = 500;
                    req.response.end('Internal Server Error');
                }
            });
        }
        else if (PATH.indexOf('..') !== -1) {
            req.response.statusCode = 400;
            req.response.end('Bad Request');
        }
        else {
            var file = './webapp' + PATH;
            vertx.fileSystem.exists(file, function (err, res) {
                if (!err) {
                    LOG.i('File "' + file + '" ' + (res ? 'exists' : 'does not exist') + '!');
                    if (res) {
                        req.response.sendFile(file);
                    }
                    else {
                        req.response.statusCode = 404;
                        req.response.end('Not Found');
                    }
                }
                else {
                    req.response.statusCode = 500;
                    req.response.end('Internal Server Error');
                }
            });
        }
    });

    return routeMatcher;

};
