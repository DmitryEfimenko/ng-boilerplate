var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var KarmaServer = require('karma').Server;
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');
var series = require('stream-series');
var fs = require('fs');
var path = require('path');
var es = require('event-stream');
var Builder = require('systemjs-builder');
var through = require('through2');
var html2js = require('ng-html2js');
var vinylFile = require('vinyl-file');

// VARIABLES ======================================================
var isDist = $.util.env.type === 'dist';
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
    sass: 'src/client/**/*.scss',
    views: 'src/client/**/*.html',
    assets: 'src/assets/**/*.*',
    // karma typescript preprocessor generates a bunch of .ktp.ts which gets picked
    // up by the watch, rinse and repeat
    clientTypes: ['src/client/types/**/*.ts', '!src/**/*.ktp.*'],
    serverTypes: ['src/server/types/**/*.ts', '!src/**/*.ktp.*'],
    client: ['src/client/**/*.ts', '!src/client/**/*.ktp.*'],
    clientModules: ['src/client/+(?)/**/_module.ts', 'src/client/_module.ts', '!src/client/**/*.ktp.*'],
    clientFeatures: ['src/client/+(?)/**/*.ts', '!src/client/+(?)/**/_module.ts', '!src/client/**/*.ktp.*'],
    clientFeaturesHtml: ['src/client/+(?)/**/*.html'],
    clientWithDefinitions: ['src/client/**/*.(ts|html)', 'src/types/**/*.ts', '!src/**/*.ktp.*'],
    server: ['src/server/**/*.ts', '!src/server/**/*.ktp.*'],
    integration: 'src/tests/integration/**/*.js',
    index: 'src/index.html'
};

var destinations = {
    css: outputFolder + "/client/css",
    client: outputFolder + "/client",
    server: outputFolder + "/server",
    vendor: outputFolder + "/vendor",
    assets: outputFolder + "/assets",
    index: outputFolder + "/views"
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = {
    inject: [
        'vendor/system.js/dist/system.js',
        'system.config.js',
        'vendor/angular-material/angular-material.css',
    ],
    justCopy: [
        'vendor/angular-material/angular-material.js',
        'vendor/system.js/dist/system-polyfills.js',
    ]
} 

// Will be filled automatically
var vendoredLibsMin = {
    inject: [],
    justCopy: []
};

var injectLibsPaths = {
    dev: [],
    dist: []
};

var injectPaths = {
    dev: [],
    dist: []
};

['inject', 'justCopy'].forEach(function(act) {
    vendoredLibs[act].forEach(function(lib) {
        // take the filename
        var splittedPath = lib.split('/');
        var filename = splittedPath[splittedPath.length - 1];
        if(act == 'inject')
            injectLibsPaths.dev.push(destinations.vendor + '/' + filename);
        // And get the minified version
        filename = filename.split('.')[0] + '.min.js';
        splittedPath[splittedPath.length - 1] = filename;
        vendoredLibsMin[act].push(splittedPath.join('/'));
        if(act == 'inject')
            injectLibsPaths.dist.push(destinations.vendor + '/' + filename);
    });
});



['dev', 'dist'].forEach(function (env) {
    injectPaths[env] = injectLibsPaths[env].concat([
        //isDist ? destinations.client + '/_module.js' : destinations.client + '/**/!(_module.js)',
        destinations.css + '/*.css'
    ]);
});

// TASKS ===========================================================
gulp.task('sass', function() {
    return gulp.src(globs.sass)
        .pipe($.sass({style: 'compressed'}).on('error', $.sass.logError))
        .pipe($.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
        .pipe($.concat('app.css'))
        .pipe(gulp.dest(destinations.css))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('ts-lint', function () {
  return gulp.src(globs.client)
    .pipe($.tslint())
    .pipe($.tslint.report('full', {emitError: false}));
});

gulp.task('bundle-modules', () => {
    // TODO: almost works, except that it outputs module definitions with wrong names. See issue: https://github.com/ivogabe/gulp-typescript/issues/308
    var tsProject = $.typescript.createProject('tsconfig.json', {
        module: 'system',
        outFile: 'dist/tmp/_module.js',
        rootDir: 'src'
    });

    var tsResult = gulp.src(globs.clientTypes.concat('src/client/_module.ts'))
        .pipe($.typescript(tsProject));

    return tsResult.js
        .pipe($.ngAnnotate({ gulpWarnings: false }))
        //.pipe($.uglify())
        .pipe(gulp.dest('dist/temp/'));
});

gulp.task('bundle-features', () => {
    // TODO - does not quite work
    var folders = getDirectoriesNames(path.resolve(__dirname, 'src', 'client'));
    
    for (var i = 0, l = folders.length; i < l; i++) {
        bundleFolder(folders[i]);
    }
    
    function bundleFolder(folder) {
        var tsProject = $.typescript.createProject('tsconfig.json', {
            module: 'system',
        });

        var tsResult = gulp.src(globs.clientTypes.concat(`src/client/${folder}/**/*.ts`))
            .pipe($.typescript(tsProject))
        
        tsResult.js
            .pipe(gulp.dest('dist/tmp'))
            //.pipe(makeFeatureBundle('dist/tmp', folder, `../${folder}/`))
    }

    function getDirectoriesNames(srcPath) {
        return fs.readdirSync(srcPath)
            .filter(function (file) {
                return fs.statSync(path.join(srcPath, file)).isDirectory();
            });
    }
});

gulp.task('dist', () => {
    gulp.series('bundle-modules', 'bundle-features');
});

var makeFeatureBundle = function(baseUrl, featureFolder, destFolder) {
    var builder = new Builder(baseUrl);
    console.log(featureFolder);
    var bufferChunks = function(file, enc, cb) {
        var p = path.relative(path.join(__dirname, baseUrl, featureFolder), file.path);
        console.log(p);
        cb(null, file);
    }

    var endStream = function(cb) {
        var builder = new Builder(baseUrl);
        var files = `client/${featureFolder}/**/*.js - client/_module.js`;
        builder
            .bundle(files, destFolder + '/bundle.js', {  })
            .then(function() {
                console.log('Build complete');
            })
            .catch(function(err) {
                console.log('Build error');
                console.log(err);
            });
        cb();
    }

    return through.obj(undefined, endStream);
}

var appendHtml = function() {
    return through.obj(function(file, enc, cb) {
        var self = this;
        if (file.isStream()) {
            this.emit('error', new Error('Streaming not supported in gulp-php lib'));
            return cb();
        }

        var possibleHtmlFilePath = getHtmlSibling(file.path);
        vinylFile.read(possibleHtmlFilePath).then(
            function(f) {
                var p = path.relative(path.join(__dirname, './src/client'), file.path);
                p = getHtmlSibling(p).replace(/\\/g, '/');
                var wrappedHtml = $.ngHtml2js.generateModuleDeclaration(f, {
                    rename: function() { return p; },
                    template: `
                    angular.element(document).injector().invoke(['$templateCache', function($templateCache) {
                        $templateCache.put('<%= template.url %>', '<%= template.escapedContent %>'); 
                    }]);`
                });

                var toAppend = new Buffer(wrappedHtml);
                var newBuffer = Buffer.concat([file.contents, toAppend]);
                file.contents = newBuffer;
                cb(null, file);            
            },
            function() { cb(null, file); }
        );
    });

    function getHtmlSibling(p) {
        return path.dirname(p) + '\\' + path.basename(p, '.ts') + '.html';
    }    
}

gulp.task('client-modules', function () {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'system'
    });
    
    var tsResult = gulp.src(globs.clientModules.concat(globs.clientTypes))
        .pipe($.typescript(tsProject));
    
    return tsResult.js
        .pipe($.ngAnnotate({gulpWarnings: false}))
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(destinations.client))
        //.pipe(makeBundle('build/', path.join(__dirname, './build/app.js')))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('client-features', function() {
    var tsProject = $.typescript.createProject('./src/client/tsconfig.json');
    
    var tsResult = gulp.src(globs.clientFeatures.concat(globs.clientTypes))
        .pipe(appendHtml())
        .pipe($.typescript(tsProject));
        
    return tsResult.js
        .pipe($.ngAnnotate({ gulpWarnings: false }))
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(destinations.client));
});

function tsCompileServer(file) {
    var tsProject = $.typescript.createProject('./src/server/tsconfig.json');

    var processingAll = typeof file == 'function'; 
    var path = processingAll ? globs.server.concat(globs.serverTypes) : globs.serverTypes.concat(file);
    var tsResult = gulp.src(path)
        .pipe($.typescript(tsProject));


    var dest =  destinations.server;
    if (!processingAll) {
        var parts = file.split('\\');
        parts = parts.slice(1, parts.length - 1);
        dest = outputFolder + '\\' + parts.join('\\');
    }
    
    return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(dest))
        .pipe(browserSync.reload({stream: true}));
}

gulp.task('shared-code', function() {
    var tsProject = $.typescript.createProject('./src/common/tsconfig.json', {
        removeComments: true
    });

    var tsResult = gulp.src('src/common/*.ts')
        .pipe($.typescript(tsProject));

    return tsResult.js
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(path.join(outputFolder, '/common')));
});

gulp.task('clean', function (cb) {
    del(['dist/', 'build/']).then(path => { cb(); });
});

gulp.task('karma-watch', function(cb) {
    new KarmaServer({
        configFile: __dirname + '/karma.conf.js'
    }, cb).start()
});

gulp.task('nodemon', function(cb) {
    return nodemon({
		script: 'build/server/app.js',
        watch: 'build/server/**/*.js'
	}).once('start', cb).on('restart', function() {
        setTimeout(function() {
            browserSync.reload({ stream: false });
        }, 1000);
    });
});

gulp.task('browser-sync', function () {
    return browserSync.init({
        open: false,
        proxy: "http://localhost:8081",
        reloadDelay: 1000,
        files: ["build/**/*.*"],
        browser: "google chrome",
        port: 8080,
    });
});

gulp.task('copy-vendor', function () {
  return gulp.src(isDist ? vendoredLibsMin.inject.concat(vendoredLibsMin.justCopy) : vendoredLibs.inject.concat(vendoredLibs.justCopy))
    .pipe(gulp.dest(destinations.vendor));
});

gulp.task('copy-assets', function () {
  return gulp.src(globs.assets)
    .pipe(gulp.dest(destinations.assets));
});

gulp.task('index', function () {
    var target = gulp.src(globs.index);
    var _injectPaths = isDist ? injectPaths.dist : injectPaths.dev;
    
    var injectOpts = {
        ignorePath: outputFolder,
        addRootSlash: false
    };
    
    var streams = _injectPaths.map(function (p) { return gulp.src(p); });
    
    return target
        .pipe(streams.length > 0 ? $.inject(series(streams), injectOpts) : $.util.noop())
        .pipe(gulp.dest(destinations.index));
});

gulp.task('tsconfig-files', function () {
    return gulp.src(['src/**/*.ts'])
        .pipe($.tsconfigFiles());
});

gulp.task('watch', function() {
    gulp.watch(globs.sass, gulp.series('sass'));
    gulp.watch(globs.clientModules, gulp.series('client-modules'));
    gulp.watch(globs.clientFeatures.concat(globs.clientFeaturesHtml), gulp.series('client-features'));
    //gulp.watch(globs.client, gulp.series('ts-lint')).on('change', tsCompileClient);
    gulp.watch(globs.server).on('change', tsCompileServer);
    gulp.watch(globs.index, gulp.series('index'));
    gulp.watch(globs.assets, gulp.series('copy-assets'));
});

gulp.task('build',
    gulp.series(
        'clean',
        'shared-code',
        gulp.parallel('sass', 'copy-assets', tsCompileServer, 'client-modules', 'client-features', 'copy-vendor'),
        'index'
    )
);

gulp.task('default',
    gulp.series('build', gulp.parallel('browser-sync', 'nodemon', 'watch'/*, 'karma-watch'*/))
);
