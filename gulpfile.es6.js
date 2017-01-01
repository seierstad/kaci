/**
 * Import the Gulp module
 */
import fs from "fs";
import mkdirp from "mkdirp";

import gulp from "gulp";
import babel from "babelify";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import gulpif from "gulp-if";

import browserify from "browserify";
import source from "vinyl-source-stream";
import rename from "gulp-rename";
import connect from "gulp-connect";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";

import eslint from "gulp-eslint";
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


import {dependencies} from "./package.json";

const isDevelopment = false;
const isProduction = !isDevelopment;

const REV_MANIFEST_CONFIG = {
    base: "build",
    path: "build/rev-manifest.json",
    merge: true
};

// Builds the app file using Browserify
// with the React(ify) transform for React.js
gulp.task("browserify", function () {
    const b = browserify();

    //    b.transform(reactify);
    b.add("./javascript/kaci.js");
    return b.bundle()
        .pipe(source("kaci.js"))
        .pipe(gulp.dest("./build/"));
});

gulp.task("build:libs", () => {
    let b = browserify().transform(babel);


    Object.keys(dependencies).forEach(lib => b.require(lib));
/*
    if (isDevelopment) {
        BROWSERIFY_DEVLIBS.forEach(lib => b.require(lib));
    }
*/
    return b.bundle()
        .pipe(source("libs.js"))
        .pipe(buffer())
        .pipe(gulpif(isDevelopment, sourcemaps.init({loadMaps: true})))
        .pipe(gulpif(isProduction, uglify()))
        .on("error", gutil.log)
        .pipe(rev())
        .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
        .pipe(gulp.dest("build/js"))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest("build"));
});

gulp.task("lint:scripts", () => {
    // ensure target directory exists
    mkdirp("./reports");
    mkdirp("./reports/lint");

    return gulp.src(["gulpfile.js", "gulpfile.es6.js", "src/**/*.js", "src/**/*.jsx", "!src/js/lib/**/*.js", "!src/js/lib/**/*.jsx"])
        .pipe(eslint())
        .pipe(eslint.format("checkstyle", fs.createWriteStream("reports/lint/checkstyle-eslint.xml")))
        .pipe(eslint.format("stylish", process.stdout))
        .pipe(eslint.failOnError());
});

 gulp.task("build:scripts", () => {

    const b = browserify("src/js/kaci.jsx", {debug: isDevelopment}).transform(babel);
    Object.keys(dependencies).forEach(lib => b.external(lib));

    return b.bundle()
        .pipe(source("kaci.js"))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulpif(isProduction, uglify()))
        .on("error", gutil.log)
        .pipe(gulp.dest("build/js"))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest("build"));

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

gulp.task("lint", function () {
    return gulp.src(["**/*.js", "!node_modules/**"])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

gulp.task("webserver", function () {
    connect.server({
        livereload: true,
        root: [".", "build"]
    });
});

gulp.task("default", [
    "lint",
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
