/* global require, module, document */
"use strict";
var Utils = require('./Utils');

var NoiseView = function (context, patch, params) {
    if (!patch) {
        patch = {};
    }
    if (!params) {
        params = {};
    }
    var view, noiseToggle, noiseAmount;
    this.noiseId = (params && params.noiseId) ? params.noiseId : 'noise';
    var that = this;
    view = document.createElement("section");
    view.id = this.noiseId + "-view";

    noiseToggle = new Utils.createCheckboxInput({
        "id": this.noiseId,
        dispatchEvent: ".toggle",
        checked: (patch.noiseActive)
    }, context);

    view.appendChild(noiseToggle);

    noiseAmount = Utils.createRangeInput({
        label: params.labelAmount || "Noise amount",
        container: view,
        min: 0,
        max: 1,
        step: .05,
        value: patch.amount
    });
    noiseAmount.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.noiseId + ".change.amount", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(noiseAmount.label);
    view.appendChild(noiseAmount.input);

    return view;
};

module.exports = NoiseView;