'use strict';

const gulp = require('gulp');
const autoPrefixer = require('gulp-autoprefixer');
const cached = require('gulp-cached');
const debug = require('gulp-debug');
const gulpIf = require('gulp-if');
const minifyCss = require('gulp-minify-css');
const notify = require('gulp-notify');
const remember = require('gulp-remember');
const sass = require('gulp-sass');
const sourceMaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const combiner = require('stream-combiner2').obj;

const isDevelopment = !process.env.NODE_ENV;

var paths = {
  css: 'stylesheets/css/*.css',
  sass: 'stylesheets/sass/*.sass',
  js: 'js/**/*.js',
  templates: ['./*.+(html|php)', './templates/**/*.+(html|php)']
};

var sassWatcher = function() {
  return gulp.watch(paths.sass, ['sass']);
};

var templateWatcher = function() {
  return gulp.watch(paths.templates);
};

var jsWatcher = function() {
  return gulp.watch(paths.js);
};

var sassTask = function() {
  return combiner(
    gulp.src(paths.sass),
    cached('sass'),
    gulpIf(isDevelopment, sourceMaps.init()),
    sass(),
    debug({title: 'SASS'}),
    gulpIf(!isDevelopment, minifyCss()),
    gulpIf(isDevelopment, sourceMaps.write()),
    autoPrefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }),
    remember('sass'),
    gulp.dest('stylesheets/css'),
    browserSync.stream()
  ).on('error', notify.onError());
};

var watchTask = function() {
  sassWatcher();
};

var watchSyncTask = function() {
  browserSync.init({
    proxy: 'http://e2g.local',
    open: false
  });

  sassWatcher();
  jsWatcher().on('change', browserSync.reload);
  templateWatcher().on('change', browserSync.reload);
};

gulp.task('sass', sassTask);

gulp.task('watch', watchTask);

gulp.task('watch:sync', watchSyncTask);

gulp.task('build', ['sass']);
