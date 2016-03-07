
import MiscService = require('../core/misc.service')

class HomeCtrl {
    /* @ngInject */
    constructor(miscService: MiscService) {
        miscService.setTitle('Homes');
    }
}

function homeDirective(): angular.IDirective {
    console.log('asd')
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

export = HomeCtrl;