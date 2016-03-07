var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var karmaServer = require('karma').Server;
var browserSync = require('browser-sync').create();
var nodemon = require('gulp-nodemon');
var series = require('stream-series');


// VARIABLES ======================================================
var isDist = $.util.env.type === 'dist';
var outputFolder = isDist ? 'dist' : 'build';

var globs = {
  sass: 'src/style/**/*.scss',
  views: 'src/client/**/*.html',
  assets: 'src/assets/**/*.*',
  // karma typescript preprocessor generates a bunch of .ktp.ts which gets picked
  // up by the watch, rinse and repeat
  types: ['src/types/**/*.ts', '!src/**/*.ktp.*'],
  client: ['src/client/**/*.ts', '!src/client/**/*.ktp.*'],
  clientWithDefinitions: ['src/client/**/*.ts', 'src/types/**/*.ts', '!src/**/*.ktp.*'],
  server: ['src/server/**/*.ts', '!src/server/**/*.ktp.*'],
  serverWithDefinitions: ['src/server/**/*.ts', 'src/types/**/*.ts', '!src/**/*.ktp.*'],
  integration: 'src/tests/integration/**/*.js',
  index: 'src/index.html'
};

var destinations = {
  css: outputFolder + "/style",
  client: outputFolder + "/client",
  server: outputFolder + "/server",
  libs: outputFolder + "/vendor",
  assets: outputFolder + "/assets",
  index: outputFolder + "/views"
};

// When adding a 3rd party we want to insert in the html, add it to
// vendoredLibs, order matters
var vendoredLibs = [
  'vendor/angular/angular.js',
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
    injectLibsPaths.dev.push(destinations.libs + '/' + filename);
    // And get the minified version
    filename = filename.split('.')[0] + '.min.js';
    splittedPath[splittedPath.length - 1] = filename;
    vendoredLibsMin.push(splittedPath.join('/'));
    injectLibsPaths.dist.push(destinations.libs + '/' + filename);
});

['dev', 'dist'].forEach(function (env) {
    injectPaths[env] = injectLibsPaths[env].concat([
        destinations.client + '/*/**/*.module.js',
        destinations.client + '/app.module.js',
        isDist ? destinations.client + '/app.js' : destinations.client + '/**/!(*.module).js',
        destinations.client + '/views.js',
        destinations.css + '/*.css'
    ]);
});

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

function tsCompileClient(file) {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'umd'
    });
    
    var paths = {
        src: globs.clientWithDefinitions,
        dest: destinations.client
    };
     
    computePaths.call(paths, file);
    
    var tsResult = gulp.src(paths.src)
        .pipe($.typescript(tsProject));
    
    return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
        .pipe($.ngAnnotate({gulpWarnings: false}))
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe($.wrap({ src: './iife.txt'}))
        .pipe(gulp.dest(paths.dest))
        .pipe(browserSync.reload({stream: true}));
}

function tsCompileServer(file) {
    var tsProject = $.typescript.createProject({
        removeComments: true,
        module: 'umd'
    });
     
    var path = typeof file == 'function' ? globs.serverWithDefinitions : file;
    var tsResult = gulp.src(path)
        .pipe($.typescript(tsProject));
        
    return tsResult.js.pipe(isDist ? $.concat('app.js') : $.util.noop())
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(destinations.server))
        .pipe(browserSync.reload({stream: true}));
}

gulp.task('ts-compile', gulp.series(tsCompileClient, tsCompileServer));

function views(file) {
    var srcPath = typeof file == 'function' ? globs.views : file;
    return gulp.src(srcPath)
        .pipe($.minifyHtml({
            empty: true,
            spare: true,
            quotes: true
        }))
        .pipe($.ngHtml2js({ moduleName: 'views' }))
        .pipe($.concat('views.js'))
        .pipe(isDist ? $.uglify() : $.util.noop())
        .pipe(gulp.dest(destinations.client))
        .pipe(browserSync.reload({ stream: true }));
}

gulp.task('clean', function (cb) {
    del(['dist/', 'build/']).then(path => { cb(); });
});

gulp.task('karma-watch', function(cb) {
    new karmaServer({
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
    .pipe(gulp.dest(destinations.libs));
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
        .pipe($.inject(series(streams), injectOpts))
        .pipe(gulp.dest(destinations.index));
});

gulp.task('tsconfig-files', function () {
    return gulp.src(['src/**/*.ts'])
        .pipe($.tsconfigFiles());
});

gulp.task('watch', function() {
    //gulp.watch(globs.sass, gulp.series('sass'));
    gulp.watch(globs.sass).on('change', sass);
    gulp.watch(globs.client, gulp.series('ts-lint')).on('change', tsCompileClient);
    gulp.watch(globs.server).on('change', tsCompileServer);
    gulp.watch(globs.views).on('change', views);
    gulp.watch(globs.index, gulp.series('index'));
    gulp.watch(globs.assets, gulp.series('copy-assets'));
});

gulp.task('build',
    gulp.series(
        'tsconfig-files',
        //'clean', // not sure why we build, then clean, which deletes the built folder...
        gulp.parallel(sass, 'copy-assets', 'ts-compile', views, 'copy-vendor'),
        'index'
    )
);

gulp.task('default',
    gulp.series('build', gulp.parallel('browser-sync', 'nodemon', 'watch', 'karma-watch'))
);
