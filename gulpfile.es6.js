/**
 * Import the Gulp module
 */
import fs from "fs";
import mkdirp from "mkdirp";

import gulp from "gulp";
import runSequence from "run-sequence";
import babel from "babelify";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import gulpif from "gulp-if";

import browserify from "browserify";
import source from "vinyl-source-stream";
import connect from "gulp-connect";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import sourcemaps from "gulp-sourcemaps";
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";
import htmllint from "gulp-htmllint";

import eslint from "gulp-eslint";
import gutil from "gulp-util";
import {dependencies} from "./package.json";


const isDevelopment = true;
const isProduction = !isDevelopment;

const REV_MANIFEST_CONFIG = {
    base: "build",
    path: "build/rev-manifest.json",
    merge: true
};


gulp.task("build:libs", () => {
    let b = browserify().transform(babel);
    Object.keys(dependencies).forEach(lib => b.require(lib));

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

gulp.task("build:scripts", ["build:libs"], () => {

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

gulp.task("build:styles", function () {
    return gulp.src("./src/styles/*.scss")
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

gulp.task("lint:markup", () => {
    return gulp.src("src/**/*.html")
    .pipe(htmllint());
});


// Generate build index.html
gulp.task("build:markup", () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    gulp.src(["src/markup/index.html"])
        .pipe(revReplace({manifest: revManifest}))
        .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
    return connect.server({
        livereload: true,
        root: ["build"],
        debug: true
    });
});

gulp.task("default", () => {
    runSequence("lint:scripts", "build:scripts", "build:styles", "build:markup", "server");
});


gulp.task("env:production", () => {
    return process.env.NODE_ENV = "production";
});
