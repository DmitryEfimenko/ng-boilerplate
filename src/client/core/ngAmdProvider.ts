declare var System;

export class NgAmdProvider implements angular.IServiceProvider {
    static $inject = ['$controllerProvider', '$provide', '$compileProvider', '$filterProvider'];
    // TODO: possibly add a way to configure a path to Controllers folder
    // call this method on top of app.config();
    constructor(private $controllerProvider, private $provide, private $compileProvider, private $filterProvider) { }

    public configure(app) {
        // Provider-based controller.
        app.controller = (name, constructorFunc) => {
            this.$controllerProvider.register(name, constructorFunc);
            return (this);
        };

        // Provider-based service.
        app.service = (name, constructorFunc) => {
            this.$provide.service(name, constructorFunc);
            return (this);
        };

        // Provider-based factory.
        app.factory = (name, factory) => {
            this.$provide.factory(name, factory);
            return (this);
        };

        // Provider-based value.
        app.value = (name, value) => {
            this.$provide.value(name, value);
            return (this);
        };

        // Provider-based directive.
        app.directive = (name, factory) => {
            this.$compileProvider.directive(name, factory);
            return (this);
        };

        // Provider-based filter.
        app.filter = (name, factory) => {
            this.$filterProvider.register(name, factory);
            return (this);
        };
    }

    // use this method as a wrapper for .state() or .route() options object.
    // add one more property: controllerUrl: 'path to controller file'
    public ctrl(opts) {
        if (!opts.resolve) opts.resolve = {};
        var path = opts.controllerUrl;
        var ctrlName = opts.controller ? opts.controller : getControllerName(path);
        opts.resolve.loadController = (['$q', '$rootScope', ($q, $rootScope) => {
            var defer = $q.defer();
            var depts = angular.isArray(path) ? path : [path];
            $q.all(depts.map(function(dep) { return System.import(dep); }))
                .then(function() { defer.resolve(); })
                .catch(function(ex) { console.log(ex.stack); });
            return defer.promise;
        }]);
        if (!opts.controller) opts.controller = ctrlName;
        return opts;

        function getControllerName(path) {
            var parts = path.split('/');
            var l = parts.length;

            var lastPart = capitalizeFirstLetter(parts[l - 1].split('.')[0]);
            if (!lastPart.endsWith('Controller')) lastPart = lastPart + 'Controller';
            return lastPart;
        }

        function capitalizeFirstLetter(s) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        }
    }

    public resolve(depts, opts: IAugmentedIState) {
        if (!opts.resolve) opts.resolve = {};
        (<any>opts.resolve).loadDependencies = (['$q', '$rootScope', ($q, $rootScope) => {
            var defer = $q.defer();
            depts = angular.isArray(depts) ? depts : [depts];
            $q.all(depts.map(function(dep) { return System.import(dep); }))
                .then(function() { defer.resolve(); })
                .catch(function(ex) { console.log(ex.stack); });
            return defer.promise;
        }]);
        return opts;
    }

    public $get() {
        return angular.noop;
    }
}

interface IAugmentedIState extends ng.ui.IState {
    tabTitle?: string;
    containerId?: string;
}

export default angular.module('ng-amd', []).provider('ngAmd', NgAmdProvider);