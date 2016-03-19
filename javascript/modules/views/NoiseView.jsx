/* global require, module, document */
"use strict";
var ViewUtils = require('./ViewUtils');
var Utils = require('../Utils');


var NoiseView = function (context, modulationLimits, patch, params) {
    if (!patch) {
        patch = {};
    }
    if (!params) {
        params = {};
    }
    var view, noiseToggle, noiseGain, noisePan;
    this.noiseId = (params && params.noiseId) ? params.noiseId : 'noise';
    var that = this;
    view = document.createElement("section");
    view.id = this.noiseId + "-view";

    noiseToggle = new ViewUtils.createCheckboxInput({
        "id": this.noiseId,
        dispatchEvent: ".toggle",
        checked: (patch.noiseActive)
    }, context);

    view.appendChild(noiseToggle);

    noiseGain = ViewUtils.createRangeInput({
        label: params.labelGain || "Noise gain",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.gain, modulationLimits.gain, {min: -1, max: 1})
    });
    noiseGain.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.noiseId + ".change.gain", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(noiseGain.label);
    view.appendChild(noiseGain.input);

    noisePan = ViewUtils.createRangeInput({
        label: params.labelPan || "Noise pan",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.pan, modulationLimits.pan, {min: -1, max: 1})
    });
    noisePan.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.noiseId + ".change.pan", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(noisePan.label);
    view.appendChild(noisePan.input);

    return view;
};

module.exports = NoiseView;