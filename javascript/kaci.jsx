/** Require React itself */
/*globals require, console, window, document, CustomEvent */
"use strict";

import KaciView from "./modules/views/KaciView.jsx";
import VoiceRegister from "./modules/VoiceRegister";
import WavyJones from "../lib/wavy-jones/wavy-jones";
import ModulationMatrix from "./modules/ModulationMatrix";
import KeyboardInput from "./modules/KeyboardInput";
import patch from "./modules/patch";
import Midi from "./modules/MidiInput";
import SystemSettings from "./modules/SystemSettings";
import defaultSettings from "./configuration.json";
import PatchHandler from "./modules/PatchHandler";

import { createStore } from "redux";
import reducer from "./modules/reducers/kaci.jsx";
var ctx, mainMix;


if (window.webkitAudioContext) {
    window.AudioContext = window.webkitAudioContext;
}
if (window.AudioContext) {
    ctx = new window.AudioContext();

    let settings;
    if (localStorage) {
        let settingsString = localStorage.getItem("kaciSystemSettings");
        if (settingsString && settingsString !== "undefined") {
            settings = JSON.parse(settingsString);
        }
    }
    settings = settings || defaultSettings;

    var store = createStore(reducer, {patch: {...patch}, settings: {...settings}},  window.devToolsExtension ? window.devToolsExtension() : undefined);
    var system = new SystemSettings(ctx, settings, store);
    var view = new KaciView(ctx, system.settings, patch, store);
    var patchHandler = new PatchHandler(ctx, defaultSettings);
    var modulationMatrix = new ModulationMatrix(ctx, system.settings, patchHandler.getActivePatch(), store);

    var midi = new Midi(ctx, system.settings.midi, store);
    var keyboardInput = new KeyboardInput(ctx, system.settings.keyboard, store);
    var reg = new VoiceRegister(ctx, patchHandler, modulationMatrix, store);

    //    var shaperCurve = new Float32Array([-.5, 0, .5]);
    //    var shaper = ctx.createWaveShaper();
    //    shaper.curve = shaperCurve;

    //    var scope = new WavyJones(ctx, "oscilloscope");
    //    scope.lineColor = "black";
    //    scope.lineThickness = 1;

    //    shaper.connect(scope);
    //reg.mainMix.connect(scope);
}
