import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";

import reducer from "./modules/reducers/kaci.jsx";

import KaciView from "./modules/views/KaciReactView.jsx";
import VoiceRegister from "./modules/VoiceRegister";
// import WavyJones from "../lib/wavy-jones/wavy-jones";
import ModulationMatrix from "./modules/ModulationMatrix";
import KeyboardInput from "./modules/KeyboardInput";
import patch from "./modules/patch";
import MidiInput from "./modules/MidiInput";
import SystemSettings from "./modules/SystemSettings";
import defaultSettings from "./configuration.json";
import PatchHandler from "./modules/PatchHandler";


if (window.AudioContext) {
    const ctx = new window.AudioContext();

    let settings;
    if (localStorage) {
        let settingsString = localStorage.getItem("kaciSystemSettings");
        if (settingsString && settingsString !== "undefined") {
            settings = JSON.parse(settingsString);
        }
    }
    settings = settings || defaultSettings;

    const store = createStore(reducer, {patch: {...patch}, settings: {...settings}}, window.devToolsExtension ? window.devToolsExtension() : undefined);
    const system = new SystemSettings(ctx, settings, store);
    const patchHandler = new PatchHandler(ctx, defaultSettings);
    const modulationMatrix = new ModulationMatrix(ctx, store);
/*
    var system = new SystemSettings(ctx, settings, store);
*/

    const midi = new MidiInput(store);
    const keyboardInput = new KeyboardInput(store);
    const reg = new VoiceRegister(store, ctx, modulationMatrix);

    var modulationMatrix = new ModulationMatrix(ctx, store);
    var reg = new VoiceRegister(store, ctx, modulationMatrix);

    const kaciWrapper = document.getElementById("kaci");

    ReactDOM.render(
        <Provider store={store}>
            <KaciView />
        </Provider>
        , kaciWrapper
    );


    //    var shaperCurve = new Float32Array([-.5, 0, .5]);
    //    var shaper = ctx.createWaveShaper();
    //    shaper.curve = shaperCurve;
    //    shaper.connect(scope);

    /* start scope
        var scope = new WavyJones(ctx, "oscilloscope");
        scope.lineColor = "black";
        scope.lineThickness = 1;

    reg.mainMix.connect(scope);
    //*/
}
