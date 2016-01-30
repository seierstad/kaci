/* global require, module, document */
"use strict";
var ViewUtils = require('./ViewUtils');
var Utils = require('../Utils');

var SubView = function (context, modulationLimits, patch, params) {
    if (!patch) {
        patch = {};
    }
    if (!params) {
        params = {};
    }
    var view, subToggle, subGain, subPan;
    this.subId = (params && params.subId) ? params.subId : 'sub';
    var that = this;
    view = document.createElement("section");
    view.id = this.subId + "-view";

    subToggle = new ViewUtils.createCheckboxInput({
        "id": this.subId,
        dispatchEvent: ".toggle",
        checked: (patch.subActive)
    }, context);

    view.appendChild(subToggle);

    subGain = ViewUtils.createRangeInput({
        label: params.labelGain || "Sub gain",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.gain, modulationLimits.gain, {min: -1, max: 1})
    });
    subGain.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.subId + ".change.gain", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(subGain.label);
    view.appendChild(subGain.input);

    subPan = ViewUtils.createRangeInput({
        label: params.labelPan || "Sub pan",
        container: view,
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.pan, modulationLimits.pan, {min: -1, max: 1})
    });
    subPan.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.subId + ".change.pan", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(subPan.label);
    view.appendChild(subPan.input);

    this.currentRatio = patch.ratio;
    var ratioChangeHandler = function (event) {
        var name = event.target.name;
        var element = document.querySelector("input[name=" + name + "]:checked");
        if (element && parseFloat(element.value) !== that.currentRatio) {
            that.currentRatio = parseFloat(element.value);
            var newEvent = new CustomEvent(that.subId + ".change.ratio", {
                detail: that.currentRatio
            });
            context.dispatchEvent(newEvent);
        }
    };

    var unison = document.createElement("input");
    unison.type = "radio";
    unison.value = 1.0;
    unison.name = "ratio-selector";
    if (patch.ratio === 1.0) {
        unison.checked = true;
    }
    view.appendChild(unison);
    unison.addEventListener('change', ratioChangeHandler);
    var onedown = document.createElement("input");
    onedown.type = "radio";
    onedown.value = 0.5;
    onedown.name = "ratio-selector";
    if (patch.ratio === 0.5) {
        onedown.checked = true;
    }
    view.appendChild(onedown);
    onedown.addEventListener('change', ratioChangeHandler);
    var twodown = document.createElement("input");
    twodown.type = "radio";
    twodown.value = 0.25;
    if (patch.ratio === 0.25) {
        twodown.checked = true;
    }
    twodown.name = "ratio-selector";
    view.appendChild(twodown);
    twodown.addEventListener('change', ratioChangeHandler);

    return view;
};

module.exports = SubView;