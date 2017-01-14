/* global localStorage */
let SystemSettings = function (context, defaultSettings, store) {
    "use strict";
    let settingsString,
        keyboardLayoutChangedHandler,
        midiInputPortChangedHandler,
        baseFrequencyChangedHandler;

    this.settings = defaultSettings;

    let state = store.getState().settings;

    if (localStorage) {
        let settingsString = localStorage.getItem("kaciSystemSettings");
        if (settingsString && settingsString !== "undefined") {
            this.settings = JSON.parse(settingsString);
        }
    }
    this.storeSettings = function () {
        let string;
        if (localStorage) {
            string = JSON.stringify(this.settings);
            localStorage.setItem("kaciSystemSettings", string);
        }
    };
    midiInputPortChangedHandler = function (event) {
        this.settings.midi.portId = event.detail;
        this.storeSettings();
    };
    baseFrequencyChangedHandler = function (event) {
        this.settings.tuning.baseFrequency = event.detail;
        this.storeSettings();
    };

    const update = () => {
        let newState = store.getState().settings;
        if (newState.keyboard.activeLayout !== this.settings.keyboard.activeLayout) {
            this.settings.keyboard.activeLayout = newState.keyboard.activeLayout;
            this.storeSettings();
        }
    };


    context.addEventListener("midi.select.input.port", midiInputPortChangedHandler.bind(this));
    context.addEventListener("system.tuning.baseFrequency.changed", baseFrequencyChangedHandler.bind(this));
    store.subscribe(update);

};


export default SystemSettings;
