/*global module, require, document */
import EnvelopeView from "./EnvelopeViewOld";
import PDOscillator from "../PDOscillator";
import IdealOscillator from "../IdealOscillator";
import WaveformSelector from "./WaveformSelector";
import drawWaveform from "./drawWaveform";
import ViewUtils from "./ViewUtils";
import Utils from "../Utils";
import RangeInput from "./RangeInput.jsx";
import ReactDOM from "react-dom";
import React, {Component} from "react";

var OscillatorView = function (ctx, modulationLimits, patch, id) {
    "use strict";
    var viewOscillator,
        view,
        mix,
        res,
        env0View,
        env1View,
        that = this,
        pd0View,
        pd1View,
        mixView,
        resonanceView;

    var getWrapperFunction = function (wrap, waveform, oscillator, resonance) {
        return function (phase) {
            return wrap.call(oscillator, phase) * waveform.call(oscillator, phase * resonance);
        };
    };

    var wrapWaveform = function (oscillator, wrappers, waveform, resonance) {
        var wrapperName,
            wrappedWaveforms = {};

        for (wrapperName in wrappers) {
            if (wrappers.hasOwnProperty(wrapperName)) {
                wrappedWaveforms[wrapperName] = getWrapperFunction(wrappers[wrapperName], waveform, oscillator, resonance);
            }
        }
        return wrappedWaveforms;
    };

    var updateResonanceWaveView = function (canvas) {
        var mixed = getMixedFunction();
        drawWaveform(getWrapperFunction(viewOscillator.selectedWrapper, mixed, viewOscillator, viewOscillator.resonance.value), canvas);
    };

    var updatePDWaveView = function (canvas, pdNumber) {
        drawWaveform(function (phase) {
            return viewOscillator.selectedWaveform.call(viewOscillator,
                viewOscillator.getDistortedPhase.call(viewOscillator, phase, viewOscillator["pdEnvelope" + pdNumber])
            );
        }, canvas);
    };

    var getMixedFunction = function () {
        return function (phase) {
            var phase0,
                phase1;

            while (phase > 1) {
                phase -= 1;
            }
            phase0 = viewOscillator.getDistortedPhase.call(viewOscillator, phase, viewOscillator.pdEnvelope0);
            phase1 = viewOscillator.getDistortedPhase.call(viewOscillator, phase, viewOscillator.pdEnvelope1);
            return viewOscillator.selectedWaveform.call(viewOscillator,
                viewOscillator.mixValues.call(viewOscillator, phase0, phase1, viewOscillator.mix.value)
            );
        };
    };

    var updateMixWaveView = function (canvas) {
        drawWaveform(getMixedFunction(), canvas);
    };


    this.id = id || "oscillator";
    viewOscillator = new PDOscillator(ctx, patch);
    this.waveView = {};

    // build DOM content
    // a wrapper:
    view = document.createElement("section");
    view.classList.add("oscillator-view");

    // waveform selector
    view.appendChild(new WaveformSelector(viewOscillator, IdealOscillator.waveforms, this.id + ".change.waveform", ctx, "oscillator-waveform", patch.waveform));

    // first pdEnvelope
    pd0View = document.createElement("div");
    pd0View.classList.add("oscillator-pd-view");

    this.waveView.pd0 = document.createElement("canvas");
    updatePDWaveView.call(this, this.waveView.pd0, 0);
    pd0View.appendChild(this.waveView.pd0);

    env0View = new EnvelopeView(ctx, patch.pdEnvelope0, {
        id: this.id + ".env0"
    });
    pd0View.appendChild(env0View);
    view.appendChild(pd0View);

    // secound pdEnvelope
    pd1View = document.createElement("div");
    pd1View.classList.add("oscillator-pd-view");

    this.waveView.pd1 = document.createElement("canvas");
    updatePDWaveView.call(this, this.waveView.pd1, 1);
    pd1View.appendChild(this.waveView.pd1);

    env1View = new EnvelopeView(ctx, patch.pdEnvelope1, {
        id: this.id + ".env1"
    });
    pd1View.appendChild(env1View);
    view.appendChild(pd1View);

    // mix control
    mixView = document.createElement("div");
    mixView.classList.add("oscillator-mix-view");
    mix = ViewUtils.createRangeInput({
        label: "Mix",
        min: -1,
        max: 1,
        step: 0.01,
        value: Utils.scale(patch.mix, modulationLimits.mix, {
            min: -1,
            max: 1
        })
    });

    mixView.appendChild(mix.input);
    mixView.appendChild(mix.label);

    this.waveView.mix = document.createElement("canvas");
    updateMixWaveView.call(this, this.waveView.mix);
    mixView.appendChild(this.waveView.mix);
    view.appendChild(mixView);


    // resonance control
    resonanceView = document.createElement("div");
    resonanceView.classList.add("oscillator-resonance-view");
    res = ViewUtils.createRangeInput({
        label: "Resonance",
        min: -1,
        max: 1,
        step: 0.001,
        value: Utils.scale(patch.resonance, modulationLimits.resonance, {min: -1, max: 1})
    });
    resonanceView.appendChild(res.input);
    resonanceView.appendChild(res.label);


    this.waveView.resonance = document.createElement("canvas");
    updateResonanceWaveView.call(this, this.waveView.resonance);
    resonanceView.appendChild(this.waveView.resonance);

    var wrappedWaveforms = wrapWaveform(viewOscillator, viewOscillator.wrappers, IdealOscillator.waveforms.sinus, 5);
    var wrapperView = new WaveformSelector(viewOscillator, wrappedWaveforms, this.id + ".change.wrapper", ctx, "oscillator-wrapper", patch.wrapper);
    wrapperView.appendChild(new ViewUtils.createCheckboxInput({
        "id": this.id + ".resonance",
        dispatchEvent: ".toggle",
        checked: (patch.resonanceActive)
    }, ctx));
    resonanceView.appendChild(wrapperView);
    view.appendChild(resonanceView);

    res.input.addEventListener("input", function (evt) {
        var changeEvent = new CustomEvent(this.id + ".change.resonance", {
            "detail": evt.target.value
        });
        ctx.dispatchEvent(changeEvent);
    }.bind(this));

    // resonance control
    var detuneView = document.createElement("div");
    detuneView.classList.add("oscillator-detune-view");

    var detune = ViewUtils.createRangeInput({
        label: "Detune",
        min: -1,
        max: 1,
        step: .01,
        value: Utils.scale(patch.detune, modulationLimits.detune, {
            min: -1,
            max: 1
        })
    });
    detuneView.appendChild(detune.input);
    detuneView.appendChild(detune.label);
    view.appendChild(detuneView);

    ctx.addEventListener("oscillator.env0.changed.data", function (event) {
        viewOscillator.setPDEnvelope0(event.detail.full);
        updatePDWaveView(that.waveView.pd0, 0);
        updateMixWaveView(that.waveView.mix);
        updateResonanceWaveView(that.waveView.resonance);
    });

    ctx.addEventListener("oscillator.change.waveform", function (event) {
        var value = event.detail.value || event.detail;
        viewOscillator.setWaveform(value);
        updatePDWaveView(that.waveView.pd0, 0);
        updatePDWaveView(that.waveView.pd1, 1);
        updateMixWaveView(that.waveView.mix);
        updateResonanceWaveView(that.waveView.resonance);
    });

    ctx.addEventListener("oscillator.env1.changed.data", function (event) {
        viewOscillator.setPDEnvelope1(event.detail.full);
        updatePDWaveView(that.waveView.pd1, 1);
        updateMixWaveView(that.waveView.mix);
        updateResonanceWaveView(that.waveView.resonance);
    });

    ctx.addEventListener("oscillator.change.mix", function (event) {
        viewOscillator.mix.value = Utils.scale(event.detail, {
            min: -1,
            max: 1
        }, modulationLimits.mix);
        updateMixWaveView(that.waveView.mix);
        updateResonanceWaveView(that.waveView.resonance);
    });

    mix.input.addEventListener("input", function (evt) {
        var changeEvent = new CustomEvent(this.id + ".change.mix", {
            "detail": evt.target.value
        });
        ctx.dispatchEvent(changeEvent);
    }.bind(this));


    detune.input.addEventListener("input", function (evt) {
        var changeEvent = new CustomEvent(this.id + ".change.detune", {
            "detail": evt.target.value
        });
        ctx.dispatchEvent(changeEvent);
    }.bind(this));

    ctx.addEventListener("oscillator.change.resonance", function (event) {
        viewOscillator.resonance.value = Utils.scale(event.detail, {
            min: -1,
            max: 1
        }, modulationLimits.resonance);
        updateResonanceWaveView(that.waveView.resonance);
    });
    ctx.addEventListener("oscillator.change.wrapper", function (event) {
        var value = event.detail.value || event.detail;
        viewOscillator.setWrapper(value);
        updateResonanceWaveView(that.waveView.resonance);
    });


    return view;
};

module.exports = OscillatorView;