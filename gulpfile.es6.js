/* general libraries */
import fs from "fs";
import mkdirp from "mkdirp";
import gulp from "gulp";
import runSequence from "run-sequence";
import gulpif from "gulp-if";
import sourcemaps from "gulp-sourcemaps";
import gutil from "gulp-util";
import pump from "pump";

/* scrips related libraries */
import eslint from "gulp-eslint";
import babelify from "babelify";
import buffer from "vinyl-buffer";
import uglify from "gulp-uglify";
import minifier from "gulp-uglify/minifier";
import browserify from "browserify";
import source from "vinyl-source-stream";
// import bab from "gulp-babel";

import rollup from "rollup-stream";
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import babel from "rollup-plugin-babel";
//import uglify from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";
import uglifyHarmony, {minify} from "uglify-js-harmony";
import size from "rollup-plugin-sizes";

/* styles related libraries */
import stylelint from "gulp-stylelint";
import stylelintCheckstyleFormatter from "stylelint-checkstyle-formatter";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";

/* markup related libraries */
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";
import htmllint from "gulp-htmllint";

/* server/build environment related libraries */
import connect from "gulp-connect";

/* script library configuration */
import {dependencies} from "./package";


/*
    shared configuration
*/

process.env.NODE_ENV = process.env.NODE_ENV === "production" ? "production" : "development";

gulp.task("env:production", () => {
    return process.env.NODE_ENV = "production";
});

const isProduction = () => {
    return process.env.NODE_ENV === "production";
};

const isDevelopment = () => {
    return process.env.NODE_ENV === "development";
};



const REV_MANIFEST_CONFIG = {
    base: "build",
    path: "build/rev-manifest.json",
    merge: true
};


/*
    script libraries tasks
*/

gulp.task("build:libs", () => {
    let b = browserify().transform(babelify);
    Object.keys(dependencies).forEach(lib => b.require(lib));

    return b.bundle()
        .pipe(source("libs.js"))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulpif(isDevelopment, sourcemaps.init({loadMaps: true})))
        .pipe(gulpif(isProduction, uglify()))
            .on("error", gutil.log)
        .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
        .pipe(gulp.dest("build/js"))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest("build"));
});


/*
    scripts tasks
*/

const scriptSources = ["gulpfile.es6.js", "src/**/*.js", "src/**/*.jsx", "!src/js/lib/**/*.js", "!src/js/lib/**/*.jsx"];

gulp.task("lint:scripts", () => {
    // ensure target directory exists
    mkdirp("./reports");
    mkdirp("./reports/lint");

    return gulp.src(scriptSources)
        .pipe(eslint())
        .pipe(eslint.format("checkstyle", fs.createWriteStream("reports/lint/checkstyle-eslint.xml")))
        .pipe(eslint.format("stylish", process.stdout))
        .pipe(eslint.failOnError());
});

gulp.task("build:scripts", (cb) => {

    const b = browserify("src/js/kaci.jsx", {debug: isDevelopment}).transform(babelify);
    Object.keys(dependencies).forEach(lib => b.external(lib));

    return b.bundle()
        .pipe(source("kaci.js"))
        .pipe(buffer())
        .pipe(rev())
        .pipe(gulpif(isDevelopment, sourcemaps.init({loadMaps: true})))
            // Add transformation tasks to the pipeline here.
            .pipe(gulpif(false, uglify()))
            .on("error", gutil.log)
        .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
        .pipe(gulp.dest("build/js"))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest("build"));
});

gulp.task("rollup:scripts", (cb) => {
    console.log("env: ", process.env.NODE_ENV);
    return rollup({
        entry: "src/js/kaci.jsx",
        external: Object.keys(dependencies),
        format: "cjs",
        sourceMap: isDevelopment(),
        plugins: [
            replace({
                "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
            }),
            babel({
                "exclude": "node_modules/**"
            }),
            size()
        ]
    })

    // point to the entry file.
    .pipe(source("kaci.js"))

    // buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
    .pipe(buffer())
    .pipe(rev())
    .pipe(gulpif(isDevelopment, sourcemaps.init({loadMaps: true})))
        .pipe(minifier({
            "compress": {
                "screw_ie8": true,
                "warnings": true
            },
            "output": {
                "comments": false
            },
            "sourceMap": isDevelopment()
        }, uglifyHarmony))
        // Add transformation tasks to the pipeline here.
    .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
    .pipe(gulp.dest("build/js"))
    .pipe(rev.manifest(REV_MANIFEST_CONFIG))
    .pipe(gulp.dest("build"));

});


gulp.task("update:scripts", () => {
    return runSequence(
        "lint:scripts",
        "rollup:scripts",
        "build:markup"
    );
});


gulp.task("watch:scripts", () => {
    return gulp.watch(scriptSources, ["update:scripts"]);
});


/*
    styles tasks
*/

const styleSources = ["./src/styles/*.scss"];

gulp.task("lint:styles", () => {
    // ensure target directory exists
    mkdirp("./reports");
    mkdirp("./reports/lint");

    return gulp.src(styleSources)
        .pipe(stylelint({
            syntax: "scss",
            failAfterError: true,
            reportOutputDir: "reports/lint",
            reporters: [
                {formatter: "verbose", console: true},
                {formatter: stylelintCheckstyleFormatter, save: "checkstyle-stylelint.xml"}
            ]
        }));
});

gulp.task("build:styles", function () {
    return gulp.src(styleSources)
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

gulp.task("update:styles", () => {
    return runSequence(
        "lint:styles",
        "build:styles",
        "build:markup"
    );
});


gulp.task("watch:styles", () => {
    return gulp.watch(styleSources, ["update:styles"]);
});


/*
    markup tasks

*/

gulp.task("lint:markup", () => {
    return gulp.src("src/**/*.html")
    .pipe(htmllint());
});


// Generate build index.html
gulp.task("build:markup", () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    gulp.src(["src/markup/index.html"])
        .pipe(revReplace({manifest: revManifest}))
        .pipe(gulp.dest("build"))
        .pipe(connect.reload());
});


/*

    server tasks

*/

gulp.task("server", function () {
    return connect.server({
        livereload: true,
        root: ["build"],
        debug: true
    });
});


/*
    collection tasks
*/

gulp.task("watch", ["watch:scripts", "watch:styles"]);

/*
    command line/deployment tasks
*/

gulp.task("default", () => {
    runSequence("build:libs", "lint:scripts", "rollup:scripts", "build:styles", "build:markup", "server", "watch");
});
gulp.task("prod", ["env:production"], () => {
    runSequence("default");
});
