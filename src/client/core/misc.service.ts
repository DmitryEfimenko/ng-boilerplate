
//module app {
    class MiscService {
        /* @ngInject */
        constructor(private $rootScope: core.IRootScope) { }

        setTitle(title) {
            this.$rootScope.pageTitle = title;
        }
    }

    angular.module('app')
        .service('miscService', MiscService)
//}    
export = MiscService;