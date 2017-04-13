/* global require */

"use strict";

/* eslint-disable import/no-commonjs */
require("babel-register")({
    "only": [/gulpfile\.es6\.js/, "build-target-configuration.js"],
    "presets": [
        "es2015"
    ]
});
require("./gulpfile.es6.js");
/* eslint-enable import/no-commonjs */
