/* global module, require, document */
"use strict";

var LFOView = require("./LFOView");
var SustainEnvelopeView = require("./SustainEnvelopeView");
var OscillatorView = require("./OscillatorView.jsx");
var KeyboardView = require("./KeyboardView");
var SystemSettingsView = require("./SystemSettingsView");
var NoiseView = require("./NoiseView.jsx");
var SubView = require("./SubView");
var ModulationMatrixView = require("./ModulationMatrixView");

import * as Actions from "../Actions.jsx";
import React, { Component } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";


var KaciView = function (context, systemSettings, patch, store) {
    var heading = document.createElement("h1");
    heading.innerHTML = "Kaci-05";
    document.body.appendChild(heading);

    var systemSettingsView = new SystemSettingsView(context, systemSettings);
    document.body.appendChild(systemSettingsView);

    var keyboardView = new KeyboardView(context, {
        startKey: 36,
        endKey: 73,
        className: "keyboard"
    });
    document.body.appendChild(keyboardView);

    var ov = new OscillatorView(context, systemSettings.modulation.target.oscillator, patch.oscillator);
    document.body.appendChild(ov);

    var noiseView = document.createElement("div");
    document.body.appendChild(noiseView);
    ReactDOM.render(<Provider store={store}><NoiseView /></Provider> , noiseView);

    var subView = new SubView(context, systemSettings.modulation.target.sub, patch.sub);
    document.body.appendChild(subView);

    var lfoView = [],
        envelopeView = [],
        i, j;

    for (i = 0, j = patch.lfo.length; i < j; i += 1) {
        lfoView[i] = new LFOView(context, patch.lfo[i], {
            lfoId: "lfo" + i,
            syncControls: i > 0,
            number: i
        });
        document.body.appendChild(lfoView[i]);
    }

    for (i = 0, j = patch.envelope.length; i < j; i += 1) {
        envelopeView[i] = new SustainEnvelopeView(context, patch.envelope[i], "envelope" + i);
        document.body.appendChild(envelopeView[i].controller);

    }

    var modulationMatrixView = new ModulationMatrixView(context, systemSettings.modulation, patch.modulation);
    document.body.appendChild(modulationMatrixView);
};
module.exports = KaciView;