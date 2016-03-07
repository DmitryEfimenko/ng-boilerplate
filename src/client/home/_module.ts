/// <reference path="../../types/types.ts" />

angular
    .module('app.home', ['ui.router'])
    .config(homeConfig);

/* @ngInject */
function homeConfig($stateProvider: ng.ui.IStateProvider) {
    $stateProvider.state('about', {
        url: '/about',
        templateUrl: 'home/index.html'
    });
}
