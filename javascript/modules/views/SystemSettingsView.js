/* globals require, module, document */
"use strict";
var MidiView = require("./MidiView");
var KeyboardInputView = require("./KeyboardInputView");

var SystemSettingsView = function (context, settings) {
    var view = document.createElement("section");
    view.id = "system-settings-view";
    view.appendChild(new MidiView(context, settings.midi));
    view.appendChild(new KeyboardInputView(context, settings.keyboard));
    return view;
};

module.exports = SystemSettingsView;