var gulp = require('gulp');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var minifyCSS = require('gulp-minify-css');
// var del = require('del');
var neat = require('node-neat').includePaths;

// Not all tasks need to use streams
// A gulpfile is just another node program and you can use all packages available on npm
gulp.task('clean', function(cb) {
  // You can use multiple globbing patterns as you would with `gulp.src`
  // del(['dist'], cb);
});

gulp.task('templates', function() {
  gulp.src('./src/templates/*')
    .pipe(gulp.dest('./public'));
});

gulp.task('stylesheets', function() {
  gulp.src('./src/stylesheets/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ includePaths: neat }))
    .pipe(minifyCSS({ restructuring: false }))
    .pipe(concat("style.css"))
    .pipe(gulp.dest('./public/stylesheets'));
});

gulp.task('scripts', function() {
  gulp.src('./src/javascripts/**/*')
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('lib', function() {
  gulp.src('./lib/**/*')
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('watch', function() {
  gulp.watch('./src/templates/**/*', ['templates']);
  gulp.watch('./src/stylesheets/**/*', ['stylesheets']);
  gulp.watch('./src/javascripts/**/*', ['scripts']);
  gulp.watch('./lib/**/*', ['lib']);
});

gulp.task('build', ['templates', 'stylesheets', 'scripts', 'lib']);

gulp.task('default', ['build', 'watch']);
