/* global require */
/*eslint import/unambiguous:0*/
"use strict";

/* eslint-disable import/no-commonjs */
require("@babel/register")({
    "only": [/gulpfile\.es6\.js/, "build-target-configuration.js"],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread"
    ],
    "presets": [
        "@babel/preset-env"
    ]
});
require("./gulpfile.es6.js");
/* eslint-enable import/no-commonjs */
