/*global module, require */
/* global document, module, CustomEvent */
"use strict";
var scaleValue = function (inputValue, inputLimits, outputLimits) {
    var stTall = (outputLimits.max - outputLimits.min) / (inputLimits.max - inputLimits.min);
    return (inputValue - inputLimits.min) * stTall + outputLimits.min;
};

module.exports = {
    "scale": scaleValue
};