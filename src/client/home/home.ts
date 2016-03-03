/// <reference path="../../types/types.ts"/>
class HomeCtrl {
    /* @ngInject */
    constructor($rootScope: core.IRootScope) {
        $rootScope.pageTitle = 'Home';
    }
}

function homeDirective(): ng.IDirective {
    return {
        restrict: 'E',
        template: `
<h2>Home Component</h2>
<say-hello></say-hello>
        `,
        controllerAs: '$ctrl',
        bindToController: true,
        controller: HomeCtrl
    };
}

angular
    .module('app.home')
    .directive('home', homeDirective);
