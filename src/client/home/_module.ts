import * as ngAmd from 'client/core/ngAmdProvider';

var app = angular
    .module('app.home', ['ui.router', ngAmd.default.name])
    .config(homeConfig);

/* @ngInject */
function homeConfig(ngAmdProvider: ngAmd.NgAmdProvider, $stateProvider: ng.ui.IStateProvider) {
    ngAmdProvider.configure(app);

    $stateProvider.state('about', {
        url: '/about',
        templateUrl: 'home/index.html'
    });
}

export default app;