import MiscService from 'client/core/misc.service';
import 'client/core/misc.service';
import 'client/home/sayHello';

export class HomeCtrl {
    /* @ngInject */
    constructor(miscService: MiscService) {
        miscService.setTitle('Homes');
    }
}

function homeDirective(): angular.IDirective {
    return {
        restrict: 'E',
        templateUrl: 'home/home.html',
        controllerAs: '$ctrl',
        bindToController: true,
        controller: HomeCtrl
    };
}

angular
    .module('app.home')
    .directive('home', homeDirective);
