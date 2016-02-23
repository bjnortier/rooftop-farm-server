var gulp = require('gulp');
var path = require('path');
var mocha = require('gulp-mocha');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var jscsStylish = require('gulp-jscs-stylish');
var sass = require('gulp-sass');
var gls = require('gulp-live-server');
var babel_register = require('babel/register');

var commonSrcFiles = path.join('src', 'common', '**', '*.js');
var appSrcFiles = path.join('src', 'apps', '**', '*.js');
var serverSrcFiles = path.join('src', 'server', '**', '*.js');
var sassFiles = path.join('public', 'style', 'sass', '*.scss');
var unitTestFiles = path.join('test', 'unit', '**', '*.test.js');
var functionalTestFiles = path.join('test', 'functional', '**', '*.js');

gulp.task('clearconsole', function() {
  process.stdout.write('\x1Bc');
});

gulp.task('jshint', function() {
  return gulp.src([
    commonSrcFiles,
    appSrcFiles,
    serverSrcFiles,
    unitTestFiles,
    functionalTestFiles
  ])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('jscs', function() {
  return gulp.src([
    commonSrcFiles,
    appSrcFiles,
    serverSrcFiles,
    unitTestFiles,
    functionalTestFiles
  ])
    .pipe(jscs())
    .pipe(jscsStylish());
});

gulp.task('sass', function () {
  gulp.src([sassFiles, path.join('!public', 'style', 'sass', '*_mixin.scss')])
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./public/style'));
});

gulp.task('sass:watch', function () {
  gulp.watch('./sass/**/*.scss', ['sass']);
});

gulp.task('unit', function() {
  return gulp.src(unitTestFiles)
    .pipe(mocha({
      compilers: {
        js: babel_register
      }
    }));
});

var server;

gulp.task('mocha-functional', ['unit'], function() {
  var options = {
    env: {
      PORT: 4000,
      // Have to use a non-memmory db as we need to read from the DB
      // for authentication
      SERVER_STORE_FILENAME: '/tmp/func.sqlite',
    },
  };
  server = gls('bin/www', options);
  server.start();

  return gulp.src(functionalTestFiles)
    .pipe(mocha({
      compilers: {
        js: babel_register
      }
    }))
    .on('error', function() {
      server.stop();
    });
});

gulp.task('functional', ['unit', 'mocha-functional'], function() {
  server.stop();
});

gulp.task('test', ['jshint', 'jscs', 'sass', 'unit', 'functional']);

gulp.task('default', ['test']);

gulp.task('watch', function() {
  gulp.watch([sassFiles], ['clearconsole', 'sass']);
  gulp.watch([commonSrcFiles], ['clearconsole', 'jshint', 'jscs', 'unit', 'functional']);
  gulp.watch([appSrcFiles], ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch([serverSrcFiles], ['clearconsole', 'jshint', 'jscs', 'unit', 'functional']);
  gulp.watch([unitTestFiles], ['clearconsole', 'jshint', 'jscs', 'unit']);
  gulp.watch([functionalTestFiles], ['clearconsole', 'jshint', 'jscs', 'functional']);
});
