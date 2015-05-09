/** Require React itself */
/*globals require, console, window, document, CustomEvent */
"use strict";
var LFO = require("./modules/LFO");
var KaciView = require("./modules/views/KaciView");
var VoiceRegister = require("./modules/VoiceRegister");
//var WavyJones = require("./lib/WavyJones");

var KeyboardInput = require("./modules/KeyboardInput");
//var react = require("react");
var ctx, mainMix;
var patch = require("./modules/patch");
var Midi = require("./modules/MidiInput");
var SystemSettings = require("./modules/SystemSettings");
var defaultSettings = require("./configuration.json");
var PatchHandler = require("./modules/PatchHandler");

if (window.webkitAudioContext) {
    window.AudioContext = window.webkitAudioContext;
}
if (window.AudioContext) {

    ctx = new window.AudioContext();


    var system = new SystemSettings(ctx, defaultSettings);
    var view = new KaciView(ctx, system.settings, patch);
    var patchHandler = new PatchHandler(ctx);

    var midi = new Midi(ctx, system.settings.midi);
    var keyboardInput = new KeyboardInput(ctx, system.settings.keyboard);

    var lfo = [];
    var i, j;

    for (i = 0, j = patch.lfo.length; i < j; i += 1) {
        if (patch.lfo[i].mode === "global" || patch.lfo[i].mode === "retrigger") {
            lfo[i] = new LFO(ctx, patch.lfo[i], "lfo" + i, {
                syncMaster: i === 0
            });
            lfo[i].addOutput("oscillatorDetune", 1200);
            lfo[i].addOutput("pdMix", 1);
            lfo[i].addOutput("resonance", 10);
        }
    }
    var globalModulators = {
        "lfo": lfo
    };

    var reg = new VoiceRegister(ctx, patchHandler, globalModulators);
    /*
        scope = new WavyJones(ctx, "oscilloscope");
        scope.lineColor = "black";
        scope.lineThickness = 1;
        mainMix.connect(scope);
    */


}