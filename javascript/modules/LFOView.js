/*global document, module, require, CustomEvent */

var Utils = require("./Utils"),
    IdealOscillator = require("./IdealOscillator"),
    WaveformSelector = require("./WaveformSelector");

var LFOView = function (ctx, lfo, patch, params) {
    "use strict";
    var lfoToggle,
        lfoReset,
        lfoView,
        lfoAmount,
        lfoRate,
        lfoActive = true,
        viewOscillator = new IdealOscillator(ctx),
        that = this;

    this.lfoId = params.lfoId || "lfo";

    lfoView = document.createElement("section");
    lfoView.id = this.lfoId + "-view";


    lfoToggle = document.createElement("button");
    lfoToggle.innerHTML = "toggle";
    lfoToggle.addEventListener("click", function () {
        lfo.postGain.gain.setValueAtTime(lfoActive ? 0 : 1, ctx.currentTime);
        lfoActive = !lfoActive;
    });
    lfoView.appendChild(lfoToggle);

    lfoReset = document.createElement("button");
    lfoReset.innerHTML = "reset";

    lfoView.appendChild(lfoReset);


    lfoView.appendChild(new WaveformSelector(viewOscillator, lfo.getWaveforms(), this.lfoId + ".change.waveform", ctx, this.lfoId + "-waveform", patch.waveform));
    lfoAmount = Utils.createRangeInput({
        label: params.labelAmount || "LFO amount",
        container: lfoView,
        min: -1,
        max: 1,
        step: 1 / 12,
        value: patch.amount
    });
    lfoAmount.input.addEventListener("input", function (evt) {
        var event = new CustomEvent(that.lfoId + ".change.amount", {
            detail: evt.target.value
        });
        ctx.dispatchEvent(event);
    });


    lfoRate = Utils.createRangeInput({
        label: params.labelRate || "LFO rate",
        container: lfoView,
        min: 0,
        max: 20,
        step: 0.001,
        value: patch.frequency
    });
    var rateInputChangeListener = function rateInputChangeListener(evt) {
        var event = new CustomEvent(that.lfoId + ".change.frequency", {
            detail: evt.target.value
        });
        ctx.dispatchEvent(event);
    };
    lfoRate.input.addEventListener("input", rateInputChangeListener);
    if (params.syncControls && patch.syncEnabled) {
        lfoRate.input.disabled = true;
    }

    var blinkAnimation = function blinkAnimation(element, frequency, states, easing) {
        var animation = element.animate(states || [{
            backgroundColor: "blue"
        }, {
            backgroundColor: "red"
        }], {
            duration: 1000 / frequency,
            iterations: Infinity,
            delay: 0,
            easing: easing || "step-middle"
        });
        element.addEventListener("animationiteration", function (event) {
            console.dir(event);
        });
        return animation;
    };

    var lfoRateMonitor = document.createElement("div");
    lfoRateMonitor.setAttribute("class", "blink");
    lfoView.appendChild(lfoRateMonitor);

    var lfoRateAnimation = blinkAnimation(lfoRateMonitor, lfoRate.input.value);

    var synchronizeAnimation = function synchronizeAnimation(freq) {
        lfo.oscillator.requestZeroPhaseEvent(that.lfoId + ".zeroPhase");
        ctx.addEventListener(that.lfoId + ".zeroPhase", function () {
            ctx.removeEventListener(that.lfoId + ".zeroPhase");
            lfoRateAnimation = blinkAnimation(lfoRateMonitor, freq || lfoRate.input.value);
        });
    };

    var startAnimation = function startAnimation() {
        if (lfoRateAnimation) {
            lfoRateAnimation.cancel();
            lfoRateAnimation = blinkAnimation(lfoRateMonitor, lfoRate.input.value);
            lfoRateAnimation.addEventListener("finish", function () {
                synchronizeAnimation();
            });
        } else {
            synchronizeAnimation();
        }
    };

    lfoRate.input.addEventListener("input", function () {
        startAnimation();
    });
    lfoReset.addEventListener("click", function () {
        var event = new CustomEvent(that.lfoId + ".reset", {});
        startAnimation();
        ctx.dispatchEvent(event);
    });
    synchronizeAnimation();

    var frequencyChangeHandler = function frequencyChangeHandler(event) {
        synchronizeAnimation(event.detail);
    };
    ctx.addEventListener(this.lfoId + ".changed.frequency", frequencyChangeHandler);

    var syncRateNumerator, syncRateDenominator, syncRateToggle;

    var changeSyncRatio = function changeSyncRatio() {
        ctx.dispatchEvent(new CustomEvent(that.lfoId + ".change.sync.ratio", {
            detail: {
                numerator: parseInt(syncRateNumerator.value, 10),
                denominator: parseInt(syncRateDenominator.value, 10)
            }
        }));
    };
    var toggleSync = function toggleSync(event) {
        var enabled = event.target.checked;

        lfoRate.input.disabled = enabled;
        syncRateNumerator.disabled = !enabled;
        syncRateDenominator.disabled = !enabled;

        if (enabled) {
            ctx.dispatchEvent(new CustomEvent(that.lfoId + ".change.sync.enable", {}));
        } else {
            ctx.dispatchEvent(new CustomEvent(that.lfoId + ".change.sync.disable", {}));
        }
    };
    if (params.syncControls) {
        syncRateNumerator = document.createElement("input");
        syncRateNumerator.value = patch.syncRatioNumerator;
        syncRateNumerator.type = "number";
        syncRateNumerator.min = 1;
        syncRateNumerator.max = 32;
        syncRateNumerator.addEventListener("input", changeSyncRatio);

        lfoView.appendChild(syncRateNumerator);

        syncRateDenominator = document.createElement("input");
        syncRateDenominator.value = patch.syncRatioDenominator;
        syncRateDenominator.type = "number";
        syncRateDenominator.min = 1;
        syncRateDenominator.max = 32;
        syncRateDenominator.addEventListener("input", changeSyncRatio);

        lfoView.appendChild(syncRateDenominator);

        syncRateToggle = document.createElement("input");
        syncRateToggle.type = "checkbox";
        syncRateToggle.checked = patch.syncEnabled;
        syncRateToggle.addEventListener("change", toggleSync);
        lfoView.appendChild(syncRateToggle);

    }


    return lfoView;
};

module.exports = LFOView;