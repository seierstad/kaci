/**
 * Import the Gulp module
 */
var gulp = require('gulp');

// Browserify
var browserify = require('browserify');
// Makes it possible to use the NPM browserify package
// in gulp (stream to text-stream)
var source = require('vinyl-source-stream');
// React transform for browserify
//var reactify = require('reactify');

// Renames files
var rename = require("gulp-rename");

// SCSS Compiler
var sass = require('gulp-sass');
// Autoprefixer. Adds css vendor prefixes if needed
var autoprefixer = require('gulp-autoprefixer');
var sourcemaps = require('gulp-sourcemaps');

var plato = require('gulp-plato');

gulp.task('plato', function () {
    return gulp.src('javascript/**/*.js')
        .pipe(plato('report', {
            jshint: {
                options: {
                    strict: true,
                    node: true,
                    browser: true
                }
            },
            complexity: {
                trycatch: true
            }
        }));
});

// Builds the app file using Browserify
// with the React(ify) transform for React.js
gulp.task('browserify', function () {
    var b = browserify();

    //    b.transform(reactify);
    b.add('./javascript/kaci.js');
    return b.bundle()
        .pipe(source('kaci.js'))
        .pipe(gulp.dest('./build/'));
});

// Builds SCSS into CSS and minifies CSS
gulp.task('styles', function () {
    return gulp.src('./stylesheets/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: 'expanded',
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./build/css'));
});

// Copies the index.html file to the build folder
gulp.task('copyIndex', function () {
    return gulp.src('./markup/template.html')
        .pipe(rename('index.html'))
        .pipe(gulp.dest('./build'));
});
/*
gulp.task('copyComponents', function () {
    return gulp.src('./components/**')
        //        .pipe(rename('index.html'))
        .pipe(gulp.dest('./build/components'));
});
*/
// Copies the Bootstrap fonts to the build dir
// This is done so the build folder can be deployed
// separately from the rest of the project
/*
gulp.task('copyFonts', function () {
    return gulp.src('./node_modules/bootstrap-sass/assets/fonts/**'+'/*.{ttf,woff,eof,svg}')
        .pipe(gulp.dest('./build/css'));
});
*/
gulp.task('default', [
    'plato',
    'browserify',
    'styles',
    'copyIndex'
    //    ,
    //    'copyComponents',
    //    'copyFonts'
]);
