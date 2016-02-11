/** Require React itself */
/*globals require, console, window, document, CustomEvent */
"use strict";

var KaciView = require("./modules/views/KaciView");
var VoiceRegister = require("./modules/VoiceRegister");
var WavyJones = require("../lib/wavy-jones/wavy-jones");
var ModulationMatrix = require("./modules/ModulationMatrix");
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
    var patchHandler = new PatchHandler(ctx, defaultSettings);
    var modulationMatrix = new ModulationMatrix(ctx, system.settings, patchHandler.getActivePatch());

    var midi = new Midi(ctx, system.settings.midi);
    var keyboardInput = new KeyboardInput(ctx, system.settings.keyboard);
    var reg = new VoiceRegister(ctx, patchHandler, modulationMatrix);

//    var shaperCurve = new Float32Array([-.5, 0, .5]);
//    var shaper = ctx.createWaveShaper();
//    shaper.curve = shaperCurve;

//    var scope = new WavyJones(ctx, "oscilloscope");
//    scope.lineColor = "black";
//    scope.lineThickness = 1;

//    shaper.connect(scope);
    //reg.mainMix.connect(scope);

}