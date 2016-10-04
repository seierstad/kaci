/**
 * Import the Gulp module
 */

import gulp from "gulp";
import browserify from "browserify";
import source from "vinyl-source-stream";
import rename from "gulp-rename";
import connect from "gulp-connect";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";
import plato from "gulp-plato";
import eslint from "gulp-eslint";
import babel from "babelify";
import uglify from "gulp-uglify";
import buffer from "vinyl-buffer";
import gutil from "gulp-util";

const BROWSERIFY_LIBS = [
    "react",
    "react-dom",
    "react-redux",
    "redux"
];

const BROWSERIFY_DEVLIBS = [
    "redux-devtools",
    "react-addons-perf"
];


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

gulp.task("copyIndex", function () {
    return gulp.src("./markup/template.html")
        .pipe(rename("index.html"))
        .pipe(gulp.dest("./build"));
});

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
]);

gulp.task("reactfiler", () => {

    let b = browserify("./javascript/kaci.jsx").transform(babel);
    BROWSERIFY_LIBS.forEach(function (lib) {
        b.external(lib);
    });
    BROWSERIFY_DEVLIBS.forEach(function (lib) {
        b.external(lib);
    });
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


gulp.task("env:production", () => {
    return process.env.NODE_ENV = "production";
});

gulp.task("browserify:libs:dev", function () {
    var b = browserify().transform(babel);

    BROWSERIFY_LIBS.forEach(function (lib) {
        b.require(lib);
    });

    BROWSERIFY_DEVLIBS.forEach(function (lib) {
        b.require(lib);
    });

    return b.bundle()
        .pipe(source("libs.js"))
        .pipe(buffer())
        .pipe(uglify())
        .on("error", gutil.log)
        .pipe(gulp.dest("build"));
});