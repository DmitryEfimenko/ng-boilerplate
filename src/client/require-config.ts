declare var requirejs;
requirejs.config({
    //enforceDefine: true,
    paths: {
        angular: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular.min',
            '/node_modules/angular/angular.min'
        ],
        ngAnimate: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-animate.min',
            '/node_modules/angular-animate/angular-animate.min'
        ],
        ngAria: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-aria.min',
            '/node_modules/angular-aria/angular-aria.min'
        ],
        ngCookies: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-cookies.min',
            '/node_modules/angular-cookies/angular-cookies.min'
        ],
        ngMessages: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-messages.min',
            '/node_modules/angular-messages/angular-messages.min'
        ],
        ngSanitize: [
            'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.0/angular-sanitize.min',
            '/node_modules/angular-sanitize/angular-sanitize.min'
        ],
        ngMaterial: [
            'https://rawgit.com/angular/bower-material/v1.0.5/angular-material',
            '/node_modules/angular-material/angular-material'
        ],
        uiGrid: [
            //'https://cdn.rawgit.com/angular-ui/bower-ui-grid/v3.0.6/ui-grid',
            '/node_modules/angular-ui-grid/ui-grid'
        ],
        app: '/client/app',
        uiRouter: '/vendor/angular-ui-router',
        ngAmdr: '/client/ngAmd'
    },
    shim: {
        'angular': { exports: 'angular' },
        'uiRouter': ['angular'],
        'ngAmd': ['angular'],
        'app': [
            'angular',
            'uiRouter',
            'ngAmd'
        ]
    }
});

requirejs(['angular', 'app'], (angular) => {
    var $html = angular.element(document.getElementsByTagName('html')[0]);
    angular.element().ready(() => {
        // bootstrap the app manually
        angular.bootstrap(document, ['app']);
    });
});