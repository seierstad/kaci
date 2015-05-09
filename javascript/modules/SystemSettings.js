/* global localStorage */
var SystemSettings = function (context, defaultSettings) {
    "use strict";
    var settingsString;
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
    var keyboardLayoutChangedHandler = function (event) {
        this.settings.keyboard.layout = event.detail;
        this.storeSettings();
    };
    var midiInputPortChangedHandler = function (event) {
        this.settings.midi.portId = event.detail;
        this.storeSettings();
    };

    context.addEventListener("system.keyboard.input.layout.changed", keyboardLayoutChangedHandler.bind(this));
    context.addEventListener("midi.select.input.port", midiInputPortChangedHandler.bind(this));

};
module.exports = SystemSettings;