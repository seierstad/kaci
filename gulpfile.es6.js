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
import rename from "gulp-rename";
import flatmap from "gulp-flatmap";
import es from "event-stream";
import clone from "gulp-clone";

/* scrips related libraries */
import babelify from "babelify";
import browserify from "browserify";
import buffer from "vinyl-buffer";
import eslint from "gulp-eslint";
import gulpUglify from "gulp-uglify";
import source from "vinyl-source-stream";
// import bab from "gulp-babel";

import rollup from "rollup-stream";
import resolve from "rollup-plugin-node-resolve";
import commonjs from "rollup-plugin-commonjs";
import rollupJson from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import uglify from "rollup-plugin-uglify";
import replace from "rollup-plugin-replace";
import uglifyEs, {minify} from "uglify-es";
import size from "rollup-plugin-sizes";

/* styles related libraries */
import stylelint from "gulp-stylelint";
import stylelintCheckstyleFormatter from "stylelint-checkstyle-formatter";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";

/* images related libraries */
import svgmin from "gulp-svgmin";
import svg2png from "gulp-svg2png";
import optimizeImage from "gulp-image";

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
    IMAGES: "./build/images",
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
        .pipe(gulpif(isProduction, gulpUglify()))
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
        input: "src/js/kaci.jsx",
        // external: Object.keys(dependencies),
        format: "cjs",
        sourcemap: isDevelopment(),
        plugins: [
            rollupJson(),
            resolve({
                module: true,
                jsnext: true,
                browser: true,
                preferBuiltins: false,
                customResolveOptions: {
                    moduleDirectory: "node_modules"
                }
            }),
            replace({
                "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
            }),
            commonjs({
                include: "node_modules/**",
                exclude: [
                    "src/js"
                ],
                namedExports: {
                    "node_modules/react/index.js": ["Children", "Component", "createElement"],
                    "node_modules/prop-types/index.js": ["PropTypes"]
                }
            }),
            babel({
                "exclude": "node_modules/**"
            }),
            uglify({
                "compress": {
                    "drop_console": true,
                    "ecma": 5,
                    "warnings": true
                },
                "output": {
                    "comments": false,
                    "ecma": 5
                }
            }, minify)
        ]
    })
        // point to the entry file.
        .pipe(source("kaci.jsx", "./src/js"))

        // buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))

        // transform the code further here.

        // if you want to output with a different name from the input file, use gulp-rename here.
        .pipe(rename("kaci.js"))
        // write the sourcemap alongside the output file.
        .pipe(rev())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(TARGET_DIR.SCRIPT))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});


gulp.task("build:workers", () => {
    return gulp.src("src/js/workers/**")
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
    images tasks
*/
const iconSizes = [
    [16, 16],
    [32, 32],
    [48, 48],
    [64, 64],
    [72, 72],
    [96, 96],
    [144, 144],
    [152, 152],
    [180, 180],
    [192, 192],
    [196, 196]
];

gulp.task("icons", () => {
    return gulp.src("src/images/icon.svg")
        .pipe(svgmin({
            plugins: [{
                cleanupNumericValues: {
                    floatPrecision: 2
                }
            }, {
                convertColors: {
                    rgb2hex: false,
                    shortNames: false
                }
            }]
        }))
        .pipe(flatmap((stream, file) => {
            const streams = iconSizes.map(([width, height]) => {
                return stream.pipe(clone())
                    .pipe(svg2png({width, height}))
                    .pipe(rename({suffix: "-" + width + "x" + height}));
            });

            return es.merge(...streams, stream);
        }))
        .pipe(optimizeImage())
        .pipe(rev())
        .pipe(gulp.dest(TARGET_DIR.IMAGES))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("build:svg", () => {
    return gulp.src("src/images/**")
        .pipe(svgmin({
            plugins: [{
                convertColors: {
                    currentColor: "#70a6c9"
                }
            }]
        }))
        .pipe(rename({basename: "logo"}))
        .pipe(rev())
        .pipe(gulp.dest(TARGET_DIR.IMAGES))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

/*
    service worker tasks
*/

gulp.task("version:cache", () => {
    return gulp.src(REV_MANIFEST_CONFIG.path)
        .pipe(clone())
        .pipe(rename({
            basename: "kaci-cache",
            extname: ""
        }))
        .pipe(rev())
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("build:serviceworker", ["version:cache"], () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    return gulp.src("src/js/service-worker.js")
        .pipe(revReplace({manifest: revManifest}))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

/*
    markup tasks
*/

gulp.task("lint:markup", () => {
    return gulp.src("src/**/*.html")
        .pipe(htmllint());
});

gulp.task("build:manifest", () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    return gulp.src(["./src/kaci.webmanifest"])
        .pipe(clone())
        .pipe(revReplace({
            manifest: revManifest,
            replaceInExtensions: [".webmanifest"]
        }))
        .pipe(rev())
        .pipe(gulp.dest(TARGET_DIR.ROOT))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});


gulp.task("dependencies:markup", (cb) => {
    runSequence("build:manifest", "build:serviceworker", cb);
});

// Generate build index.html
gulp.task("build:markup", ["dependencies:markup"], () => {
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

gulp.task("images", (cb) => {
    runSequence("icons", "build:svg", cb);
});


gulp.task("markup", (cb) => {
    runSequence("build:markup", cb);
});


gulp.task("watch", ["watch:scripts", "watch:styles"]);

/*
    command line/deployment tasks
*/

gulp.task("default", (cb) => {
    runSequence("scripts", "images", "styles", "markup", cb);
});

gulp.task("dev", ["env:development"], (cb) => {
    runSequence("default", "server", "watch", cb);
});

gulp.task("prod", ["env:production"], (cb) => {
    runSequence("clean", "default", "server", cb);
});
