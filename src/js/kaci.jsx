import KaciView from "./modules/views/KaciView.jsx";

import VoiceRegister from "./modules/VoiceRegister";
// import WavyJones from "../lib/wavy-jones/wavy-jones";
import ModulationMatrix from "./modules/ModulationMatrix";
import KeyboardInput from "./modules/KeyboardInput";
import patch from "./modules/patch";
import Midi from "./modules/MidiInput";
import SystemSettings from "./modules/SystemSettings";
import defaultSettings from "./configuration.json";
import PatchHandler from "./modules/PatchHandler";

import {createStore} from "redux";
import reducer from "./modules/reducers/kaci.jsx";

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
    const view = new KaciView(ctx, system.settings, patch, store);
    const patchHandler = new PatchHandler(ctx, defaultSettings);
    const modulationMatrix = new ModulationMatrix(ctx, system.settings, patchHandler.getActivePatch(), store);

    const midi = new Midi(ctx, system.settings.midi, store);
    const keyboardInput = new KeyboardInput(ctx, system.settings.keyboard, store);
    const reg = new VoiceRegister(ctx, patchHandler, modulationMatrix, store);

    
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

    //    var scope = new WavyJones(ctx, "oscilloscope");
    //    scope.lineColor = "black";
    //    scope.lineThickness = 1;

    //    shaper.connect(scope);
    //reg.mainMix.connect(scope);
}
