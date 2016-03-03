/// <reference path="../../types/types.ts"/>
class SayHelloCtrl {
    greeting: string;
    times: number;

    /* @ngInject */
    constructor(
        private $rootScope: core.IRootScope,
        private HomeService: core.IHomeService
    ) {
        $rootScope.pageTitle = 'Hello';
        this.times = 1;
        this.greeting = HomeService.getGreeting('Hello!').greeting;
    }
}

function sayHelloDirective(): ng.IDirective {
    return {
        restrict: 'E',
        templateUrl: 'home/sayHello.html',
        controllerAs: '$ctrl',
        bindToController: true,
        controller: SayHelloCtrl
    };
}

angular
    .module('app.home')
    .directive('sayHello', sayHelloDirective);
