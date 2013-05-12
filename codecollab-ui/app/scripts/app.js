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

        $provide.value('EB_ADDRESS_PUBLIC_IN', 'cc.pub.in'); // 00000000-0000-002a-0000-00000000002a
        $provide.value('EB_ADDRESS_PRIVATE_IN', 'cc.priv.in');

    }]);
