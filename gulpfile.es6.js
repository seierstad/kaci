/* general libraries */
import fs from "fs";
import del from "del";
import mkdirp from "mkdirp-promise";
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

/* build target configuration */
import browsers from "./build-target-configuration";

/*
    shared configuration
*/

process.env.NODE_ENV = process.env.NODE_ENV === "production" ? "production" : "development";

gulp.task("env:development", (cb) => {
    process.env.NODE_ENV = "development";
    cb();
});


gulp.task("env:production", (cb) => {
    process.env.NODE_ENV = "production";
    cb();
});

const isProduction = () => {
    return process.env.NODE_ENV === "production";
};

const isDevelopment = () => {
    return process.env.NODE_ENV === "development";
};

const TARGET_DIR = {
    ROOT: "./build",
    CSS: "./build/css",
    SCRIPT: "./build/js",
    LINT: "./reports/lint",
    TEST: "./reports/test"
};



const REV_MANIFEST_CONFIG = {
    base: TARGET_DIR.ROOT,
    path: TARGET_DIR.ROOT + "/rev-manifest.json",
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
        .pipe(gulp.dest(TARGET_DIR.SCRIPT))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("create:target:report:lint", () => {
    return mkdirp(TARGET_DIR.LINT);
});

gulp.task("create:target:report:test", () => {
    return mkdirp(TARGET_DIR.TEST);
});

/*
    scripts tasks
*/

const scriptSources = ["gulpfile.es6.js", "src/**/*.js", "src/**/*.jsx", "!src/js/lib/**/*.js", "!src/js/lib/**/*.jsx"];

gulp.task("lint:scripts", ["create:target:report:lint"], () => {
    return gulp.src(scriptSources)
        .pipe(eslint())
        .pipe(eslint.format("checkstyle", fs.createWriteStream(TARGET_DIR.LINT + "/checkstyle-eslint.xml")))
        .pipe(eslint.format("stylish", process.stdout))
        .pipe(eslint.failOnError());
});

gulp.task("build:scripts", (cb) => {
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
    .pipe(gulpif(isProduction, minifier({
        "compress": {
            "screw_ie8": true,
            "warnings": true
        },
        "output": {
            "comments": false
        },
        "sourceMap": isDevelopment()
    }, uglifyHarmony)))
    .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
    .pipe(gulp.dest(TARGET_DIR.SCRIPT))
    .pipe(rev.manifest(REV_MANIFEST_CONFIG))
    .pipe(gulp.dest(TARGET_DIR.ROOT));

});


gulp.task("update:scripts", (cb) => {
    runSequence(
        "lint:scripts",
        "build:scripts",
        "markup",
        cb
    );
});


gulp.task("watch:scripts", () => {
    return gulp.watch(scriptSources, ["update:scripts"]);
});


/*
    styles tasks
*/

const styleSources = ["./src/styles/*.scss"];

gulp.task("lint:styles", ["create:target:report:lint"], () => {

    return gulp.src(styleSources)
        .pipe(stylelint({
            syntax: "scss",
            failAfterError: true,
            reportOutputDir: TARGET_DIR.LINT,
            reporters: [
                {formatter: "verbose", console: true},
                {formatter: stylelintCheckstyleFormatter, save: "checkstyle-stylelint.xml"}
            ]
        }));
});

gulp.task("build:styles", function () {
    return gulp.src(styleSources)
        .pipe(buffer())
        .pipe(gulpif(isDevelopment, sourcemaps.init()))
        .pipe(sass({
            style: "expanded",
            errLogToConsole: true
        }))
        .pipe(autoprefixer({
            browsers: browsers,
            cascade: false
        }))
        .pipe(rev())
        .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
        .pipe(gulp.dest(TARGET_DIR.CSS))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("update:styles", (cb) => {
    runSequence(
        "lint:styles",
        "build:styles",
        "markup",
        cb
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

gulp.task("build:manifest", () => {
    return gulp.src(["./src/kaci.webmanifest"])
        .pipe(rev())
        .pipe(gulp.dest(TARGET_DIR.ROOT))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});



// Generate build index.html
gulp.task("build:markup", ["build:manifest"], () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    return gulp.src(["src/markup/index.html"])
        .pipe(revReplace({manifest: revManifest}))
        .pipe(gulp.dest(TARGET_DIR.ROOT))
        .pipe(connect.reload());
});


/* clean task */

gulp.task("clean", () => {
    return del(["build", "reports"]);
});


/*

    server tasks

*/

gulp.task("server", function () {
    return connect.server({
        livereload: true,
        root: [TARGET_DIR.ROOT],
        debug: true
    });
});


/*
    collection tasks
*/

gulp.task("libs", (cb) => {
    runSequence("build:libs", cb);
});

gulp.task("scripts", (cb) => {
    runSequence("lint:scripts", "build:scripts", cb);
});

gulp.task("styles", (cb) => {
    runSequence("lint:styles", "build:styles", cb);
});

gulp.task("markup", (cb) => {
    runSequence("build:markup", cb);
});


gulp.task("watch", ["watch:scripts", "watch:styles"]);

/*
    command line/deployment tasks
*/

gulp.task("default", ["libs", "scripts", "styles"], (cb) => {
    runSequence("markup", cb);
});

gulp.task("dev", ["env:development"], (cb) => {
    runSequence("default", "server", "watch", cb);
});

gulp.task("prod", ["env:production"], (cb) => {
    runSequence("default", cb);
});
