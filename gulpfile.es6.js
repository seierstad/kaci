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
import babel from "rollup-plugin-babel";
import buffer from "vinyl-buffer";
import builtins from "rollup-plugin-node-builtins";
import commonjs from "rollup-plugin-commonjs";
import eslint from "gulp-eslint";
import globals from "rollup-plugin-node-globals";
import replace from "rollup-plugin-replace";
import resolve from "rollup-plugin-node-resolve";
import rollup from "rollup-stream";
import rollupJson from "rollup-plugin-json";
import size from "rollup-plugin-sizes";
import source from "vinyl-source-stream";
//import {terser} from "rollup-plugin-terser";
import {uglify} from "rollup-plugin-uglify";
import uglifyEs, {minify} from "uglify-es";

/* styles related libraries */
import stylelint from "gulp-stylelint";
import stylelintCheckstyleFormatter from "stylelint-checkstyle-formatter";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";

/* images related libraries */
import svgmin from "gulp-svgmin";
import svg2png from "gulp-svg2png-node7fix";
import optimizeImage from "gulp-image";

/* versioning / cache busting libraries */
import rev from "gulp-rev";
import revReplace from "gulp-rev-replace";
import revdel from "gulp-rev-delete-original";

/* markup related libraries */
import htmllint from "gulp-htmllint";

/* testing related libraries */
/*
import webdriver from "selenium-webdriver";
import "chromedriver";
/

/* server/build environment related libraries */
import connect from "gulp-connect";

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
    ROOT: "./dist",
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
    create directories
*/

gulp.task("create:target:report:lint", () => {
    return mkdirp(TARGET_DIR.LINT);
});

gulp.task("create:target:report:test", () => {
    return mkdirp(TARGET_DIR.TEST);
});

gulp.task("build:mkdir:root", () => {
    return mkdirp(TARGET_DIR.ROOT);
});

gulp.task("icons:mkdir", ["build:mkdir:root"], () => {
    return mkdirp(TARGET_DIR.IMAGES);
});


/*
    scripts tasks
*/

const scriptSources = ["gulpfile.es6.js", "src/**/*.js", "src/**/*.jsx", "!src/js/lib/**/*.js", "!src/js/lib/**/*.jsx"];

gulp.task("scripts:lint", ["create:target:report:lint"], () => {
    return gulp.src(scriptSources)
        .pipe(eslint())
        .pipe(eslint.format("checkstyle", fs.createWriteStream(TARGET_DIR.LINT + "/checkstyle-eslint.xml")))
        .pipe(eslint.format("stylish", process.stdout))
        .pipe(eslint.failOnError());
});

const DEV_UGLIFY_OPTIONS = {
    "compress": {
        "dead_code": false,
        "drop_console": false,
        "drop_debugger": false,
        "ecma": 5,
        "warnings": true,
        "unused": false
    },
    "output": {
        "comments": true,
        "ecma": 5
    },
    "ie8": false,
    "mangle": false,
    "warnings": true,
    "sourceMap": true
};

const PROD_UGLIFY_OPTIONS = {
    "compress": {
        "dead_code": true,
        "drop_console": true,
        "drop_debugger": true,
        "passes": 2,
        "unused": true,
        "warnings": true
    },
    "output": {
        "beautify": false,
        "comments": false,
        "ecma": 5
    },
    "ie8": false,
    "warnings": true,
    "sourceMap": false
};

gulp.task("scripts:build", (cb) => {
    console.log("env: ", process.env.NODE_ENV);

    const uglifyOptions = isDevelopment() ? DEV_UGLIFY_OPTIONS : PROD_UGLIFY_OPTIONS;

    const plugins = [
        babel({
            "exclude": "node_modules/**"
        }),
        rollupJson(),
        resolve({
            main: true,
            module: true,
            jsnext: true,
            browser: true,
            preferBuiltins: false,
            modulesOnly: false,
            customResolveOptions: {
                moduleDirectory: "node_modules"
            }
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
        replace({
            "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV)
        }),
        uglify(uglifyOptions, minify)
    ];

    return rollup({
        input: "src/js/kaci.jsx",
        format: "iife",
        sourcemap: isDevelopment(),
        plugins
    })
        // point to the entry file.
        .pipe(source("kaci.jsx", "./src/js"))

        // buffer the output. most gulp plugins, including gulp-sourcemaps, don't support streams.
        .pipe(buffer())
        .pipe(gulpif(isDevelopment, sourcemaps.init({loadMaps: true})))

        // transform the code further here.

        // if you want to output with a different name from the input file, use gulp-rename here.
        .pipe(rename("kaci.js"))
        // write the sourcemap alongside the output file.
        .pipe(rev())
        .pipe(gulpif(isDevelopment, sourcemaps.write(".")))
        .pipe(revdel())
        .pipe(gulp.dest(TARGET_DIR.SCRIPT))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});


gulp.task("workers:build", () => {
    return gulp.src("src/js/workers/**")
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("scripts:update", (cb) => {
    runSequence(
        "scripts:lint",
        "scripts:build",
        "markup",
        cb
    );
});


gulp.task("watch:scripts", () => {
    return gulp.watch(scriptSources, ["scripts:update"]);
});


/*
    styles tasks
*/

const styleSources = ["./src/styles/*.scss"];

gulp.task("styles:lint", ["create:target:report:lint"], () => {

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

gulp.task("styles:build", function () {
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
        "styles:lint",
        "styles:build",
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

gulp.task("icons", ["icons:mkdir"], () => {
    /*
    (function() {
        var childProcess = require("child_process");
        var oldSpawn = childProcess.spawn;
        function mySpawn() {
            console.log('spawn called');
            console.log(arguments);
            var result = oldSpawn.apply(this, arguments);
            return result;
        }
        childProcess.spawn = mySpawn;
    })();
    */

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
        /*
        .pipe(flatmap((stream, file) => {
            const streams = iconSizes.map(([width, height]) => {
                return stream.pipe(clone())
                    .pipe(svg2png({width, height}))
                    .pipe(rename({suffix: "-" + width + "x" + height}));
            });

            return es.merge(...streams, stream);
        }))
        */
        .pipe(optimizeImage())
        .pipe(rev())
        .pipe(gulp.dest(TARGET_DIR.IMAGES))
        .pipe(rev.manifest(REV_MANIFEST_CONFIG))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

gulp.task("svg:build", () => {
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

gulp.task("serviceworker:build", ["version:cache"], () => {
    const revManifest = gulp.src(REV_MANIFEST_CONFIG.path);

    return gulp.src("src/js/service-worker.js")
        .pipe(revReplace({manifest: revManifest}))
        .pipe(gulp.dest(TARGET_DIR.ROOT));
});

/*
    markup tasks
*/

gulp.task("markup:lint", () => {
    return gulp.src("src/**/*.html")
        .pipe(htmllint());
});

gulp.task("manifest:build", () => {
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


gulp.task("markup:dependencies", (cb) => {
    runSequence("manifest:build", "serviceworker:build", cb);
});

// Generate build index.html
gulp.task("markup:build", ["markup:dependencies"], () => {
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
    tests
*/
/*
gulp.task("test:selenium", () => {
    const browser = new webdriver.Builder().usingServer().withCapabilities({browserName: "chrome"}).build();

    browser.get("http://en.wikipedia.org/wiki/Wiki");
    browser.findElements(webdriver.By.css('[href^="/wiki/"]')).then((links) => {
        console.log("Found", links.length, "Wiki links.");
        browser.quit();
    });
});
*/
/*
    collection tasks
*/

gulp.task("scripts", (cb) => {
    runSequence("scripts:lint", "scripts:build", cb);
});

gulp.task("styles", (cb) => {
    runSequence("styles:lint", "styles:build", cb);
});

gulp.task("images", (cb) => {
    runSequence("icons", "svg:build", cb);
});


gulp.task("markup", (cb) => {
    runSequence("markup:lint", "markup:build", cb);
});


gulp.task("watch", ["watch:scripts", "watch:styles"]);

/*
    command line/deployment tasks
*/

gulp.task("default", ["env:production"], (cb) => {
    runSequence("scripts", "images", "styles", "markup", cb);
});

gulp.task("dev", ["env:development"], (cb) => {
    runSequence("clean", "scripts", "images", "styles", "markup", "server", "watch", cb);
});

gulp.task("prod", ["env:production"], (cb) => {
    runSequence("clean", "default", "server", cb);
});
