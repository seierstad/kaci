import React from "react";
import ReactDOM from "react-dom";
import {Provider} from "react-redux";
// import Perf from "react-addons-perf";

import {
    createStore,
    applyMiddleware
} from "redux";
import {
    composeWithDevTools
} from "redux-devtools-extension/logOnlyInProduction";

// import WavyJones from "../../lib/wavy-jones";

import reducer from "./reducers/kaci";
import KaciView from "./views/KaciView.jsx";

import VoiceRegister from "./VoiceRegister";
import ModulationMatrix from "./modulation/modulation-matrix";
import KeyboardInput from "./keyboard/keyboard-input";
import patch from "./patch/defaults";
import MidiInput from "./midi/midi-input";
import SystemSettings from "./settings/settings";
import defaultSettings from "./configuration";
import LFOs from "./lfo/lfos";
import MorseGenerators from "./morse/morse-generators";


import "../styles/styles.scss";

// window.Perf = Perf;

const middleware = [];

if (window.AudioContext) {

    const ctx = new window.AudioContext();

    const composeEnhancers = composeWithDevTools({
        // options like actionSanitizer, stateSanitizer
    });

    const initialState = {patch: {...patch}, settings: {...(defaultSettings)}};
    const store = createStore(reducer, initialState, composeEnhancers(
        applyMiddleware(...middleware),
        // other store enhancers if any
    ));

    //    const lfos = ctx.audioWorklet ? new LFOsWorkletNode(ctx, store) : new LFOs(ctx, store);
    const lfos = new LFOs(ctx, store);
    const morse = new MorseGenerators(ctx, store);
    const modulators = {
        lfos,
        morse
    };

    new SystemSettings(ctx, store);

    new MidiInput(store);
    new KeyboardInput(store);

    new ModulationMatrix(ctx, store, modulators).init().then((modulationMatrix) => {
        const voiceRegister = new VoiceRegister(ctx, store, modulationMatrix);
        modulationMatrix.patchVoiceRegister(voiceRegister);

        const kaciWrapper = document.getElementById("kaci");

        ReactDOM.render(
            <Provider store={store}>
                <KaciView />
            </Provider>
            , kaciWrapper
        );
    });

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
