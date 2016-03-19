/* global localStorage */
var SystemSettings = function (context, defaultSettings, store) {
    "use strict";
    var settingsString,
        keyboardLayoutChangedHandler,
        midiInputPortChangedHandler,
        baseFrequencyChangedHandler;

    this.settings = defaultSettings;

    if (localStorage) {
        settingsString = localStorage.getItem("kaciSystemSettings");
        if (settingsString && settingsString !== "undefined") {
            this.settings = JSON.parse(settingsString);
        }
    }
    this.storeSettings = function () {
        var string;
        if (localStorage) {
            string = JSON.stringify(this.settings);
            localStorage.setItem("kaciSystemSettings", string);
        }
    };
    keyboardLayoutChangedHandler = function (event) {
        this.settings.keyboard.layout = event.detail;
        this.storeSettings();
    };
    midiInputPortChangedHandler = function (event) {
        this.settings.midi.portId = event.detail;
        this.storeSettings();
    };
    baseFrequencyChangedHandler = function (event) {
        this.settings.tuning.baseFrequency = event.detail;
        this.storeSettings();
    };

    context.addEventListener("system.keyboard.input.layout.changed", keyboardLayoutChangedHandler.bind(this));
    context.addEventListener("midi.select.input.port", midiInputPortChangedHandler.bind(this));
    context.addEventListener("system.tuning.baseFrequency.changed", baseFrequencyChangedHandler.bind(this));

};
module.exports = SystemSettings;