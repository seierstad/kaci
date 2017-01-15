import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";
import Perf from "react-addons-perf";

import reducer from "./reducers/kaci";
import KaciView from "./views/KaciView.jsx";

import VoiceRegister from "./VoiceRegister";
// import WavyJones from "../lib/wavy-jones/wavy-jones";
import ModulationMatrix from "./ModulationMatrix";
import KeyboardInput from "./KeyboardInput";
import patch from "./patch";
import MidiInput from "./MidiInput";
import SystemSettings from "./SystemSettings";
import defaultSettings from "./configuration";
import PatchHandler from "./PatchHandler";

let mainMix;

if (window.AudioContext) {
    const ctx = new window.AudioContext();

    let settings;
    if (localStorage) {
        const settingsString = localStorage.getItem("kaciSystemSettings");
        if (settingsString && settingsString !== "undefined") {
            settings = JSON.parse(settingsString);
        }
    }
    settings = settings || defaultSettings;

    const store = createStore(reducer, {patch: {...patch}, settings: {...settings}}, window.devToolsExtension ? window.devToolsExtension() : undefined);
/*
    const system = new SystemSettings(ctx, settings, store);
*/

    const midi = new MidiInput(store);
    const keyboardInput = new KeyboardInput(store);

/*
    const modulationMatrix = new ModulationMatrix(ctx, store);
*/
    const reg = new VoiceRegister(store, ctx); //, modulationMatrix);

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
