/// <reference path="../types/types.ts" />

import NgAmdProvider = require('./ngAmd/ngAmdProvider');

angular.module('views', []);

let app = angular
    .module('app', [
        'ng-amd',
        'views',
        'app.home',
        'ui.router'
    ])
    .config(config);


/* @ngInject */
function config(
    $locationProvider: ng.ILocationProvider,
    $httpProvider: ng.IHttpProvider,
    $urlRouterProvider: angular.ui.IUrlRouterProvider,
    $stateProvider: ng.ui.IStateProvider,
    ngAmdProvider: NgAmdProvider
) {
    ngAmdProvider.configure(app);
    
    $locationProvider.html5Mode(true).hashPrefix('!');
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $httpProvider.interceptors.push([
        '$injector', '$q', '$rootScope', ($injector, $q, $rootScope) => {
            return {
                'responseError': (rejection) => {
                    if (rejection.status === 401) {
                        $rootScope.session = {};
                        $injector.get('$state').go('login');
                    }
                    return $q.reject(rejection);
                }
            };
        }
    ]);

    $urlRouterProvider.otherwise('/');

    $stateProvider
        .state('home', ngAmdProvider.resolve('/client/home.js', {
            url: '/',
            template: '<home></home>'
        }));
}

export = app;