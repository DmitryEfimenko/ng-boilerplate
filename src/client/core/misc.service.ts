export interface IRootScope extends ng.IScope {
    pageTitle: string;
}

export default class MiscService {
    /* @ngInject */
    constructor(private $rootScope: IRootScope) { }

    setTitle(title) {
        this.$rootScope.pageTitle = title;
    }
}

angular.module('app')
    .service('miscService', MiscService);