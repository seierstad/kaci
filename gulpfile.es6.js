/**
 * Import the Gulp module
 */

import gulp from "gulp";

// Browserify
import browserify from "browserify";
// Makes it possible to use the NPM browserify package
// in gulp (stream to text-stream)
import source from "vinyl-source-stream";
// React transform for browserify
//import reactify from "reactify";

// Renames files
import rename from "gulp-rename";


// server
import connect from "gulp-connect";

// SCSS Compiler
import sass from "gulp-sass";
// Autoprefixer. Adds css vendor prefixes if needed
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";

import plato from "gulp-plato";

import eslint from "gulp-eslint";

gulp.task("plato", function () {
    return gulp.src("javascript/**/*.js")
        .pipe(plato("report", {
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
gulp.task("browserify", function () {
    var b = browserify();

    //    b.transform(reactify);
    b.add("./javascript/kaci.js");
    return b.bundle()
        .pipe(source("kaci.js"))
        .pipe(gulp.dest("./build/"));
});

// Builds SCSS into CSS and minifies CSS
gulp.task("styles", function () {
    return gulp.src("./stylesheets/*.scss")
        .pipe(sourcemaps.init())
        .pipe(sass({
            style: "expanded",
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: ["last 2 versions"],
            cascade: false
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest("./build/css"));
});

// Copies the index.html file to the build folder
gulp.task("copyIndex", function () {
    return gulp.src("./markup/template.html")
        .pipe(rename("index.html"))
        .pipe(gulp.dest("./build"));
});
/*
gulp.task("copyComponents", function () {
    return gulp.src("./components/**")
        //        .pipe(rename("index.html"))
        .pipe(gulp.dest("./build/components"));
});
*/
// Copies the Bootstrap fonts to the build dir
// This is done so the build folder can be deployed
// separately from the rest of the project
/*
gulp.task("copyFonts", function () {
    return gulp.src("./node_modules/bootstrap-sass/assets/fonts/**"+"/*.{ttf,woff,eof,svg}")
        .pipe(gulp.dest("./build/css"));
});
*/

gulp.task('lint', function () {
    return gulp.src(['**/*.js', '!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task('webserver', function () {
    connect.server({
        livereload: true,
        root: ['.', 'build']
    });
});

gulp.task("default", [
    "lint",
    "plato",
    "browserify",
    "styles",
    "copyIndex"
    //    ,
    //    "copyComponents",
    //    "copyFonts"
]);

import babel from "babelify";
//import uglify from "gulp-uglify";
import buffer from "vinyl-buffer";
import gutil from "gulp-util";

gulp.task("reactfiler", () => {

    let b = browserify("./javascript/kaci.jsx").transform(babel);
    return b.bundle()
        .pipe(source("kaci.js"))
        .pipe(buffer())
        .pipe(sourcemaps.init({
            loadMaps: true
        }))
        //        .pipe(uglify())
        .on("error", gutil.log)
        .pipe(sourcemaps.write("./maps"))
        .pipe(gulp.dest("build"));
});