/// <reference path="../types/types.ts"/>

angular
    .module('app')
    .config(config);

/* @ngInject */
function config(
    $locationProvider: ng.ILocationProvider,
    $httpProvider: ng.IHttpProvider,
    $urlRouterProvider: angular.ui.IUrlRouterProvider,
    $stateProvider: ng.ui.IStateProvider
) {
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
        .state('home', {
            url: '/',
            template: '<home></home>'
        });
}
