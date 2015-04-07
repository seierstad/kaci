/*global require, module, document */

"use strict";
var Tunings = require('./Tunings');
var PatchMatrix = require('./PatchMatrix');

var VoiceRegister = function (context) {
    this.tunings = {
        "tempered": Tunings.getTemperedScale(0, 120, 57, 220)
    };
    this.voices = [];
};
module.exports = VoiceRegister;
