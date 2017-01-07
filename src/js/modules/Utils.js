/*global module, require */
/* global document, module, CustomEvent */
"use strict";
let scaleValue = function (inputValue, inputLimits, outputLimits) {
    let stTall = (outputLimits.max - outputLimits.min) / (inputLimits.max - inputLimits.min);
    return (inputValue - inputLimits.min) * stTall + outputLimits.min;
};

module.exports = {
    "scale": scaleValue
};
