# ng-boilerplate

## Goal
This project serves as a starting point for projects using AngularJS 1.* on the client side and NodeJs Express for the server side, both via Typescript.

It provides code organisation by feature (John Papa's style guide. See Structure for more details) and a build system ready for development and testing.

The build system is using [Gulp](http://gulpjs.com/).

So in short you get:

- automatic web server start
- eficient browser synchronization 
- automatic SASS compilation using libsass  with auto-prefixing
- automatic DI annotation (via ng-annotate, no need for .$inject)
- automatic typescript linting and compilation (+ concatenation and minification on dist environment)
- automatic combining of *.html templates using html2js with the corresponding *.js files (+ minification on dist environment)
- continuous testing with karma
- integration testing with protractor
- exception decorator to deal with errors (in app/core/exceptions.decorator.js)
- automatic copy of libs and assets
- automatic injections of css/js files in index.html
- CI setup via Travis


## Install
To start your own project, you can clone that project, get rid of the history, change the git origin and start working by following the snippet below
```bash
$ git clone git://github.com/DmitryEfimenko/ng-boilerplate myproject
$ cd myproject
$ git checkout --orphan temp
$ git commit -m 'initial commit'
$ git branch -D master
$ git branch -m master
$ git remote remove origin
$ git remote add origin yourgitrepourl.git
$ sudo npm -g install bower
$ bower install
$ npm install
$ ./node_modules/.bin/webdriver-manager update
$ gulp
```
You then have 2 options: use docker or use your local installation.
To get running using your local node, run the following:

## Local Installation
```bash
$ sudo npm -g install bower gulp
$ bower install
$ npm install
$ gulp
```

## Docker

The docker part is using [docker-compose](https://docs.docker.com/compose/) so you'll need both docker and docker-compose installed, follow these links to do so: https://docs.docker.com/installation/#installation and https://docs.docker.com/compose/#installation-and-set-up

You can just run `docker-compose up` and it will set up the environment in a container.

### Testing and Debugging
 
build using something like `docker build -t test`

then run using `docker -p 8081:8081 test`

to debug, use this `docker run -it -p 8081:8081 --entrypoint bash test`

## Structure

```bash
ng-boilerplate/
  |- src/
  |  |- client/
  |  |  |- _module.ts
  |  |  |- component1/
  |  |  |- |- component.ts
  |  |  |- |- component.html
  |  |  |- |- component.scss
  |  |- server/
  |  |  |- <server code>
  |  |- assets/
  |  |  |- <static files>
  |  |- tests/
  |  |  |- unit
  |  |  |  |- **/*.js
  |  |  |- integration
  |  |  |  |- **/*.js
  |  |- types/
  |  |  |  |- **/*.d.ts
  |- vendor/
  |  |- angular/
  |  |- angular-mocks/
  |  |- lodash/
  |  |- ui-router/
  |- gulpfile.js
```

This app organisation groups code by feature.

Look at the home module present in the boilerplate to see how you can integrate a module in the angular app and.
There's also an exemple service and directive.

There are couple conventions in place that you should follow:

**Client**
* Each feature folder should have file `_module.ts` declaring new angular module, which should be referenced in the `client/_module.ts`.
        I decided to avoid things like `ocLazyLoad` or `angularAMD` due to introduced complexity. That's why main _module.ts has dependency on feature modules. This means that all `_module` files (not any other files from a given feature) will be loaded on initial load, but that's OK since they are small. 
* Each `angular.module` should have this: `ngAmdProvider.configure(app);` in its configuration function.
        This allows angular controllers, services, directive, and the rest to be registered asynchronously - when the file loads.
* Each ui.router state options should be wrapped in `ngAmdProvider.resolve('client/home/home', {...})`. See example in `client/_module.ts`.
        We need to load code for the component that is used in the `template` option when we navigate to a state.

**Server**
* Each api route should be placed in a separate file under `server/routes/api`. It also should be registered in `server/routeHandler` with the appropriate url path. 

## Tasks
This uses gulp (http://gulpjs.com/) so you can call any of the tasks defined in the gulpfile.
The default one watches over the files and runs the associated tasks when needed and is called like this:
```bash
$ npm run gulp
```

To build the version to distribute, run the following:
```bash
$ npm run gulp build --type dist

# if you are using docker-compose, do it while container is "up"
$ docker-compose run angular gulp build --type dist
```

## Possible errors when installing locally:

* Error during running `npm install` - something mentioning `node-gyp` and `v8`
  * install Visual Studio 2015
  * run `npm install -g node-gyp --msvs_version=2015`

* Error during running `bower install` - "Git not in the PATH"
  * http://stackoverflow.com/a/20069763/894273



* Error during running `gulp` - gulpinst.start.apply
  * You need to have gulp 4 installed.
    ```
    # uninstall previous Gulp installation, if any
    $ npm uninstall gulp -g
    $ cd [your_project_root]
    $ npm uninstall gulp
    
    # install Gulp 4 CLI tools globally from 4.0 GitHub branch
    $ npm install gulpjs/gulp-cli#4.0 -g
    
    # install Gulp 4 into your project
    $ npm install gulpjs/gulp.git#4.0 --save-dev
    ```
