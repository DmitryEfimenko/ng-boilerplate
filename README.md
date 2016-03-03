# ng-boilerplate

## Goal
This project serves as a starting point for projects using AngularJS 1.* on the client side and NodeJs Express for the server side, both via Typescript.

It provides code organisation by feature (John Papa's style guide. See Structure for more details) and a build system ready for development and testing.

The build system is using [Gulp](http://gulpjs.com/).

So in short you get:

- automatic SASS compilation using libsass  with auto-prefixing
- automatic DI annotation (via ng-annotate, no need for .$inject)
- automatic typescript linting and compilation (+ concatenation and minification on dist environment)
- automatic preload of templates using html2js (+ minification on dist environment)
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

## Structure

```bash
ng-boilerplate/
  |- src/
  |  |- client/
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

This app organisation groups code by feature but not to the point of grouping the templates/tests/css inside it (it's really to change that in the gulpfile if you want to do that though).

Look at the home module present in the boilerplate to see how you can integrate a module in the angular app and don't forget to delete type definition for the controller in types/app/core.ts.
There's also an exemple service and directive.


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
