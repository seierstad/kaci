import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";
import Perf from "react-addons-perf";

import reducer from "./reducers/kaci.jsx";
import KaciView from "./views/KaciView.jsx";

import VoiceRegister from "./VoiceRegister";
// import WavyJones from "../lib/wavy-jones/wavy-jones";
import ModulationMatrix from "./ModulationMatrix";
import KeyboardInput from "./KeyboardInput";
import patch from "./patch";
import MidiInput from "./MidiInput";
import SystemSettings from "./SystemSettings";
import defaultSettings from "./configuration.json";
import PatchHandler from "./PatchHandler";

let ctx, mainMix;

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

    let store = createStore(reducer, {patch: {...patch}, settings: {...settings}}, window.devToolsExtension ? window.devToolsExtension() : undefined);
/*
    var system = new SystemSettings(ctx, settings, store);
*/

    let midi = new MidiInput(store);
    let keyboardInput = new KeyboardInput(store);


//    let modulationMatrix = new ModulationMatrix(ctx, store);
//    let reg = new VoiceRegister(store, ctx, modulationMatrix);

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
