import 'angular';
import 'ui.router';
import * as ngAmd from 'client/ngAmd/ngAmdProvider';
import appHome from 'client/home/_module';
import exceptionsConfig from 'client/core/exceptions.decorator';

let appViews = angular.module('views', []);

let app = angular
    .module('app', [
        'ui.router',
        ngAmd.default.name,
        appViews.name,
        appHome.name
    ])
    .config(config)
    .config(exceptionsConfig);

/* @ngInject */
function config(
    $locationProvider: ng.ILocationProvider,
    $httpProvider: ng.IHttpProvider,
    $urlRouterProvider: angular.ui.IUrlRouterProvider,
    $stateProvider: ng.ui.IStateProvider,
    ngAmdProvider: ngAmd.NgAmdProvider
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
        .state('home', ngAmdProvider.resolve('client/home/home', {
            url: '/',
            template: '<home></home>'
        }));
}