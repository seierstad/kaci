/* global require */

"use strict";

// den gamle gulpfile.js blir skrevet om til EcmaScript2015 og inkluderes her 
// og oversettes av babel inntil ES2015-støtte kommer på plass i Visual Studio 
require("babel-register");
require("./gulpfile.es6.js");