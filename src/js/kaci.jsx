import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
import {createStore} from "redux";
// import Perf from "react-addons-perf";

// import WavyJones from "../../lib/wavy-jones";

import reducer from "./reducers/kaci";
import KaciView from "./views/KaciView.jsx";

import VoiceRegister from "./VoiceRegister";
import DCGenerator from "./DCGenerator";
import ModulationMatrix from "./ModulationMatrix";
import KeyboardInput from "./KeyboardInput";
import patch from "./patch";
import MidiInput from "./MidiInput";
import SystemSettings from "./SystemSettings";
import defaultSettings from "./configuration";


// window.Perf = Perf;

if (window.AudioContext) {
    const ctx = new window.AudioContext();
    const dc = new DCGenerator(ctx);

    const initialState = {patch: {...patch}, settings: {...defaultSettings}};
    const store = createStore(reducer, initialState, (window.devToolsExtension ? window.devToolsExtension() : undefined));

    new SystemSettings(ctx, store);

    new MidiInput(store);
    new KeyboardInput(store);

    const modulationMatrix = new ModulationMatrix(ctx, store, dc);
    new VoiceRegister(store, ctx, modulationMatrix);

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
    const scope = new WavyJones(ctx, "oscilloscope");
    scope.lineColor = "black";
    scope.lineThickness = 1;

    reg.mainMix.connect(scope);
    //*/
}
