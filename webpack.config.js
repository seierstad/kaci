/* global require */
/*eslint import/unambiguous:0*/
"use strict";

/* eslint-disable import/no-commonjs */
require("@babel/register")({
    "only": [
        "./webpack/**"
    ],
    "plugins": [
        "@babel/plugin-proposal-object-rest-spread",
        "@babel/plugin-proposal-export-default-from"
    ],
    "presets": [
        "@babel/preset-env"
    ]
});
module.exports = require("./webpack/webpack.config.babel.js");
/* eslint-enable import/no-commonjs */
