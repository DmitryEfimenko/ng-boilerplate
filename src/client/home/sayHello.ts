import * as misc from 'client/core/misc.service';
import HomeService from 'client/home/home.service';
import 'client/home/home.service';

export class SayHelloCtrl {
    greeting: string;
    times: number;

    /* @ngInject */
    constructor(
        private $rootScope: misc.IRootScope,
        private HomeService: HomeService
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
