/* global module, require */
"use strict";
var patch = require("./patch");
var PatchHandler = function (context) {
    var i, j, that = this;
    this.patch = patch;

    var getEnvelopeEventListener = function (envelopeData, envelopeId) {
        return function (event) {
            var detail = event.detail;

            switch (event.detail.type) {
            case "add":
                envelopeData.splice(detail.index, 0, [detail.data.x, detail.data.y]);
                break;
            case "delete":
                envelopeData.splice(detail.index, 1);
                break;
            case "move":
                envelopeData[detail.index] = [detail.data.x, detail.data.y];
                break;
            default:
                envelopeData = detail;
                break;
            }
            detail.full = envelopeData;
            context.dispatchEvent(new CustomEvent(envelopeId + ".changed.data", {
                "detail": detail
            }));
        };
    };

    for (i = 0, j = patch.envelope.length; i < j; i += 1) {
        context.addEventListener("envelope" + i + ".attack.change.data", getEnvelopeEventListener(patch.envelope[i].attack.steps, "envelope" + i + ".attack"));
        context.addEventListener("envelope" + i + ".release.change.data", getEnvelopeEventListener(patch.envelope[i].release.steps, "envelope" + i + ".release"));
    }
    context.addEventListener("oscillator.env0.change.data", getEnvelopeEventListener(patch.oscillator.pdEnvelope0, "oscillator.env0"));
    context.addEventListener("oscillator.env1.change.data", getEnvelopeEventListener(patch.oscillator.pdEnvelope1, "oscillator.env1"));

    var getLfoToggleHandler = function (index) {
        return function (event) {
            that.patch.lfo[index].active = event.detail;
        };
    };

    for (i = 0, j = patch.lfo.length; i < j; i += 1) {
        context.addEventListener("lfo" + i + ".toggle", getLfoToggleHandler(i));
    }


    var voiceParameterHandler = function (mod, param) {
        return function (evt) {
            that.patch[mod][param] = evt.detail;
        };
    };

    context.addEventListener("oscillator.change.waveform", voiceParameterHandler("oscillator", "waveform"));
    context.addEventListener("oscillator.change.wrapper", voiceParameterHandler("oscillator", "wrapper"));
    context.addEventListener("oscillator.resonance.toggle", voiceParameterHandler("oscillator", "resonanceActive"));
    context.addEventListener("oscillator.change.resonance", voiceParameterHandler("oscillator", "resonance"));
    context.addEventListener("oscillator.change.mix", voiceParameterHandler("oscillator", "mix"));

    context.addEventListener("noise.change.amount", voiceParameterHandler("noise", "amount"));
    context.addEventListener("noise.toggle", voiceParameterHandler("noise", "active"));

    context.addEventListener("sub.change.ratio", voiceParameterHandler("sub", "ratio"));
    context.addEventListener("sub.change.amount", voiceParameterHandler("sub", "amount"));
    context.addEventListener("sub.toggle", voiceParameterHandler("sub", "active"));
};
PatchHandler.prototype.getActivePatch = function () {
    return this.patch;
};
module.exports = PatchHandler;