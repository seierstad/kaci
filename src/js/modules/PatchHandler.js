import Utils from "./Utils";

const PatchHandler = function (context, configuration) {
    const that = this;

    this.patch = require("./patch");

    const getEnvelopeEventListener = function (envelopeData, envelopeId) {
        return function (event) {
            const detail = event.detail;

            switch (detail.type) {
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
                    break;
            }
            detail.full = envelopeData;
            context.dispatchEvent(new CustomEvent(envelopeId + ".changed.data", {
                "detail": detail
            }));
        };
    };

    for (let i = 0, j = this.patch.envelopes.length; i < j; i += 1) {
        context.addEventListener("envelope" + i + ".attack.change.data", getEnvelopeEventListener(this.patch.envelopes[i].attack.steps, "envelope" + i + ".attack"));
        context.addEventListener("envelope" + i + ".release.change.data", getEnvelopeEventListener(this.patch.envelopes[i].release.steps, "envelope" + i + ".release"));
    }
    context.addEventListener("oscillator.env0.change.data", getEnvelopeEventListener(this.patch.oscillator.pdEnvelope0, "oscillator.env0"));
    context.addEventListener("oscillator.env1.change.data", getEnvelopeEventListener(this.patch.oscillator.pdEnvelope1, "oscillator.env1"));

    const voiceParameterHandler = function (mod, param, modIndex) {
        return function (evt) {
            let value = evt.detail.value || evt.detail;
            if (configuration.modulation.target[mod] && configuration.modulation.target[mod][param] && typeof configuration.modulation.target[mod][param].min === "number") {
                value = Utils.scale(value, {
                    min: -1,
                    max: 1
                }, configuration.modulation.target[mod][param]);
            }
            if (typeof modIndex !== "undefined") {
                that.patch[mod][modIndex][param] = value;
            } else {
                that.patch[mod][param] = value;
            }
        };
    };

    const modulationDisconnectHandler = function (event) {
        console.log("type: " + event.detail.sourceType);
        console.log("index: " + event.detail.sourceIndex);
        console.log("target module: " + event.detail.targetModule);
        console.log("target parameter: " + event.detail.targetParameter);
        //that.patch.modulation
    };


    const getLfoToggleHandler = function (index) {
        return function (event) {
            that.patch.lfos[index].active = event.detail;
        };
    };

    for (let i = 0, j = this.patch.lfos.length; i < j; i += 1) {
        context.addEventListener("lfo" + i + ".toggle", getLfoToggleHandler(i));
    }
    context.addEventListener("lfo.change.frequency", function (evt) {
        if (evt.detail.id) {
            const id = evt.detail.id.substr(3);
            voiceParameterHandler("lfo", "frequency", id)(evt);
        }
    });
    context.addEventListener("modulation.change.disconnect", modulationDisconnectHandler);

    context.addEventListener("oscillator.change.waveform", voiceParameterHandler("oscillator", "waveform"));
    context.addEventListener("oscillator.change.wrapper", voiceParameterHandler("oscillator", "wrapper"));
    context.addEventListener("oscillator.resonance.toggle", voiceParameterHandler("oscillator", "resonanceActive"));
    context.addEventListener("oscillator.change.resonance", voiceParameterHandler("oscillator", "resonance"));
    context.addEventListener("oscillator.change.mix", voiceParameterHandler("oscillator", "mix"));
    context.addEventListener("oscillator.change.detune", voiceParameterHandler("oscillator", "detune"));

    context.addEventListener("noise.change.gain", voiceParameterHandler("noise", "gain"));
    context.addEventListener("noise.toggle", voiceParameterHandler("noise", "active"));

    context.addEventListener("sub.change.ratio", voiceParameterHandler("sub", "ratio"));
    context.addEventListener("sub.change.gain", voiceParameterHandler("sub", "gain"));
    context.addEventListener("sub.toggle", voiceParameterHandler("sub", "active"));
};
PatchHandler.prototype.getActivePatch = function () {
    return this.patch;
};


export default PatchHandler;
