/* global require, module, document */
"use strict";
var Utils = require('./Utils');

var SubView = function (context, patch, params) {
    if (!patch) {
        patch = {};
    }
    if (!params) {
        params = {};
    }
    var view, subToggle, subAmount;
    this.subId = (params && params.subId) ? params.subId : 'sub';
    var that = this;
    view = document.createElement("section");
    view.id = this.subId + "-view";

    subToggle = new Utils.createCheckboxInput({
        "id": this.subId,
        dispatchEvent: ".toggle",
        checked: (patch.subActive)
    }, context);

    view.appendChild(subToggle);

    subAmount = Utils.createRangeInput({
        label: params.labelAmount || "Sub amount",
        container: view,
        min: 0,
        max: 1,
        step: 0.01,
        value: patch.amount
    });
    subAmount.input.addEventListener('input', function (evt) {
        var event = new CustomEvent(that.subId + ".change.amount", {
            detail: evt.target.value
        });
        context.dispatchEvent(event);
    });
    view.appendChild(subAmount.label);
    view.appendChild(subAmount.input);

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