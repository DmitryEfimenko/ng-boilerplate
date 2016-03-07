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


// VARIABLES ======================================================
var isDist = $.util.env.type === 'dist';
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
  sass: 'src/style/**/*.scss',
  views: 'src/client/**/*.html',
  assets: 'src/assets/**/*.*',
  // karma typescript preprocessor generates a bunch of .ktp.ts which gets picked
  // up by the watch, rinse and repeat
  types: ['src/types/libs/**/*.ts', 'src/types/app/**.ts', '!src/**/*.ktp.*'],
  client: ['src/client/**/*.ts', '!src/client/**/*.ktp.*'],
  requirejs: ['src/client/require-config.ts'],
  clientModules: ['src/client/*/**/_module.ts', 'src/client/_module.ts', '!src/client/**/*.ktp.*'],
  clientFeatures: ['src/client/+(?)/**/*.ts', '!src/client/+(?)/**/_module.ts', '!src/client/**/*.ktp.*'],
  clientWithDefinitions: ['src/client/**/*.(ts|html)', 'src/types/**/*.ts', '!src/**/*.ktp.*'],
  server: ['src/server/**/*.ts', '!src/server/**/*.ktp.*'],
  serverWithDefinitions: ['src/server/**/*.ts', 'src/types/**/*.ts', '!src/**/*.ktp.*'],
  integration: 'src/tests/integration/**/*.js',
  index: 'src/index.html'
};

var destinations = {
  css: outputFolder + "/style",
  client: outputFolder + "/client",
  server: outputFolder + "/server",
  vendor: outputFolder + "/vendor",
  assets: outputFolder + "/assets",
  index: outputFolder + "/views"
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = [
  'vendor/requirejs/require.js',
  'vendor/angular/angular.js',
  'vendor/angular-mocks/angular-mocks.js',
  'vendor/ui-router/release/angular-ui-router.js',
];

// Will be filled automatically
var vendoredLibsMin = [];

var injectLibsPaths = {
  dev: [],
  dist: []
};

var injectPaths = {
  dev: [],
  dist: []
};

vendoredLibs.forEach(function(lib) {
    // take the filename
    var splittedPath = lib.split('/');
    var filename = splittedPath[splittedPath.length -1];
    injectLibsPaths.dev.push(destinations.vendor + '/' + filename);
    // And get the minified version
    filename = filename.split('.')[0] + '.min.js';
    splittedPath[splittedPath.length - 1] = filename;
    vendoredLibsMin.push(splittedPath.join('/'));
    injectLibsPaths.dist.push(destinations.vendor + '/' + filename);
});

//['dev', 'dist'].forEach(function (env) {
//    injectPaths[env] = injectLibsPaths[env].concat([
//        isDist ? destinations.client + '/app.js' : destinations.client + '/**/!(_module.js)',
//        destinations.client + '/views.js',
//        destinations.css + '/*.css'
//    ]);
//});

// TASKS ===========================================================
function sass(file) {
    var path = typeof file == 'function' ? globs.sass : file;
    return gulp.src(path)
        .pipe($.sass({style: 'compressed'}).on('error', $.sass.logError))
        .pipe($.autoprefixer())  // defauls to > 1%, last 2 versions, Firefox ESR, Opera 12.1
        .pipe(gulp.dest(destinations.css))
        .pipe(browserSync.reload({stream: true}));
}

gulp.task('ts-lint', function () {
  return gulp.src(globs.client)
    .pipe($.tslint())
    .pipe($.tslint.report('full', {emitError: false}));
});

function computePaths(file) { 
    if (typeof file != 'function') {
        this.src = file;
        var parts = file.split('\\');
        this.dest = outputFolder + '\\' + parts.slice(1, parts.length - 1).join('\\');
    }
}

gulp.task('requirejs', function () {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'amd'
    });
    
    var tsResult = gulp.src(globs.requirejs)
        .pipe($.typescript(tsProject));
        
    return tsResult.js
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe($.wrap({ src: './iife.txt'}))
        .pipe(gulp.dest(destinations.client))
        .pipe(browserSync.reload({stream: true}));
});

gulp.task('client-modules', function () {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'amd'
    });
    
    var tsResult = gulp.src(globs.clientModules.concat(globs.types))
        .pipe($.typescript(tsProject));
        
    return tsResult.js.pipe($.concat('app.js'))
        .pipe($.ngAnnotate({gulpWarnings: false}))
        .pipe(isDist ? $.uglify() : $.util.noop())
        //.pipe($.wrap({ src: './iife.txt'}))
        .pipe(gulp.dest(destinations.client))
        .pipe(browserSync.reload({stream: true}));
});

function compileFeatureTs(folder) {
    var tsProject = $.typescript.createProject('tsconfig.json', {
        removeComments: true,
        module: 'amd',
        //noExternalResolve: true
    });
    
    var tsResult = gulp.src(`src/client/${folder}/**/*.ts`)
        .pipe($.concat(`${folder}-temp.ts`))
        .pipe($.typescript(tsProject));
        
    return tsResult.js.pipe($.concat(`${folder}.js`))
        .pipe($.ngAnnotate({ gulpWarnings: false }))
        .pipe(isDist ? $.uglify() : $.util.noop());
        //.pipe(gulp.dest(`${destinations.client}/${folder}`));
}

function compileFeatureHtml(folder) {
    return gulp.src(`src/client/${folder}/**/*.html`)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({
            declareModule: false,
            moduleName: 'views',
            prefix: `${folder}/`
        }))
        .pipe($.concat('views.js'))
        .pipe(isDist ? $.uglify() : $.util.noop());
        //.pipe(gulp.dest(`${destinations.client}/${folder}`))
}

function compileFeature(folder) {
    return es.merge(compileFeatureTs(folder), compileFeatureHtml(folder))
        .pipe($.concat(`${folder}.js`))
        //.pipe($.wrap({ src: './iife.txt' }))
        .pipe(gulp.dest(`${destinations.client}`));
}

function featureFileChanged(file) {
    var folder = file.split('\\')[2];
    return compileFeature(folder)
        .pipe(browserSync.reload({stream: true}));
}

gulp.task('compile-features', function (cb) {
    var folders = getDirectoriesNames(path.resolve(__dirname, 'src', 'client'));
    for (var i = 0, l = folders.length; i < l; i++) {
        compileFeature(folders[i]);
    }
    browserSync.reload({ stream: true });
    cb();
});

function getDirectoriesNames(srcPath) {
    return fs.readdirSync(srcPath)
        .filter(function (file) {
            return fs.statSync(path.join(srcPath, file)).isDirectory();
        });
}

function tsCompileServer(file) {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'commonjs'
    });
     
    var path = typeof file == 'function' ? globs.serverWithDefinitions : file;
    var tsResult = gulp.src(path)
        .pipe($.typescript(tsProject));
        
    return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(destinations.server))
        .pipe(browserSync.reload({stream: true}));
}

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
  return gulp.src(isDist ? vendoredLibsMin : vendoredLibs)
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
    //gulp.watch(globs.sass, gulp.series('sass'));
    gulp.watch(globs.sass).on('change', sass);
    gulp.watch(globs.clientFeatures).on('change', featureFileChanged);
    //gulp.watch(globs.client, gulp.series('ts-lint')).on('change', tsCompileClient);
    gulp.watch(globs.requirejs, gulp.series('requirejs'));
    gulp.watch(globs.clientModules, gulp.series('client-modules'));
    gulp.watch(globs.server).on('change', tsCompileServer);
    //gulp.watch(globs.views, gulp.series(views));
    gulp.watch(globs.index, gulp.series('index'));
    gulp.watch(globs.assets, gulp.series('copy-assets'));
});

gulp.task('build',
    gulp.series(
        'tsconfig-files',
        'clean',
        gulp.parallel(sass, 'copy-assets', tsCompileServer, 'requirejs', 'client-modules', 'compile-features', 'copy-vendor'),
        'index'
    )
);

gulp.task('default',
    gulp.series('build', gulp.parallel('browser-sync', 'nodemon', 'watch'/*, 'karma-watch'*/))
);
