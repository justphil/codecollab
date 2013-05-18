'use strict';

angular.module('codecollabUiApp', ['$strap.directives'])
    .config(['$provide', '$routeProvider', function ($provide, $routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            })
            .when('/session/:uuid', {
              templateUrl: 'views/session.html',
              controller: 'SessionCtrl'
            })
            .otherwise({
                redirectTo: '/'
            });

        $provide.value('VERTX_PORT', '8080');
    }]);
