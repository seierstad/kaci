import EnvelopeGenerator from "./EnvelopeGenerator";
import PDOscillator from "./PDOscillator";
import NoiseGenerator from "./NoiseGenerator";
import SubOscillator from "./SubOscillator";
import LFO from "./LFO";

import WavyJones from "../../lib/wavy-jones/wavy-jones";

const prefixKeys = (object, prefix) => {
    const result = {};
    Object.keys(object).forEach(key => {
        result[prefix + key] = object[key];
    });
    return result;
};

class Voice {
    constructor (context, store, frequency) {

        this.store = store;
        this.state = store.getState().patch;

        this.context = context;
        this.vca = context.createGain();
        this.vca.gain.value = 1;

        this.envelopes = [];
        this.lfos = [];

        const createVoiceLfo = (lfoPatch, index) => {
            if (lfoPatch.mode === "voice") {
                this.lfos[index] = new LFO(context, store, index);
                this.lfos[index].start();
            }
        };

        this.state.lfos.forEach(createVoiceLfo);

        this.state.envelopes.forEach((envPatch, index) => {
            this.envelopes[index] = new EnvelopeGenerator(context, store, index);
        });

        this.noise = new NoiseGenerator(context, store);
        this.sub = new SubOscillator(context, store, frequency);
        this.oscillator = new PDOscillator(context, store, frequency);

        this.sub.connect(this.vca);
        this.oscillator.connect(this.vca);
        this.noise.connect(this.vca);


        this.outputs = {
            ...(prefixKeys(this.oscillator.parameters.outputs, "oscillator.")),
            ...(prefixKeys(this.noise.parameters.outputs, "noise.")),
            ...(prefixKeys(this.sub.parameters.outputs, "sub."))
        };
        this.inputs = {
            ...(prefixKeys(this.oscillator.parameters.outputs, "oscillator.")),
            ...(prefixKeys(this.noise.parameters.inputs, "noise.")),
            ...(prefixKeys(this.sub.parameters.inputs, "sub."))
        };

        //* start scope
        const scope = new WavyJones(context, "oscilloscope");
        scope.lineColor = "black";
        scope.lineThickness = 1;

        this.oscillator.connect(scope);
        //*/

    }
    get parameterOutputNodes () {
        return this.outputs;
    }

    get parameterInputNodes () {
        return this.inputs;
    }

    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.vca.connect(node.input);
        } else {
            this.vca.connect(node);
        }
    }

    disconnect () {
        this.vca.disconnect();
    }

    destroy () {
        this.sub.stop(this.stopTime);
        this.sub.disconnect();
        this.sub.destroy();
        this.noise.stop();
        this.noise.disconnect();
        this.noise.destroy();

        this.envelopes.forEach(envelope => {
            envelope.disconnect();
            envelope.destroy();
        });
        this.envelopes = null;

        this.lfos.forEach(lfo => {
            lfo.disconnect();
            lfo.destroy();
        });
        this.lfos = null;

        this.oscillator.destroy();
        this.oscillator = null;

        this.disconnect();
        this.vca = null;

        if (typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
    }

    start (time) {

        this.startTime = time;
        this.sub.start(time);
        this.noise.start(time);

        this.lfos.forEach(lfo => lfo.start());
        this.envelopes.forEach(envelope => envelope.trigger(time));
    }

    stop (time, callback) {
        this.stopTime = time;

        this.envelopes.forEach(function (envelope) {
            envelope.release(time);
        });

        this.destroyCallback = callback;
        this.destroyTimer = setTimeout(this.destroy.bind(this), 0);
    }

    set frequency (frequency) {
        this.oscillator.frequency.gain.setValueAtTime(frequency, this.context.currentTime);
        this.sub.frequency.setValueAtTime(frequency, this.context.currentTime);
    }
}


export default Voice;


/*

        getHandler = function (module, parameter) {
            var result;
            switch (parameter) {
            case "waveform":
                result = function (evt) {
                    var value = evt.detail.value || evt.detail;
                    that[module].setWaveform(value);
                };
                break;
            case "wrapper":
                result = function (evt) {
                    var value = evt.detail.value || evt.detail;
                    that[module].setWrapper(value);
                };
                break;
            case "resonanceActive":
                result = function (evt) {
                    that[module].resonanceActive = evt.detail;
                };
                break;
            case "env0data":
            case "env1data":
                result = function (evt) {
                    var d = evt.detail;
                    switch (d.type) {
                    case "add":
                        that[module].addPDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index, [d.data.x, d.data.y]);
                        break;
                    case "move":
                        that[module].movePDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index, [d.data.x, d.data.y]);
                        break;
                    case "delete":
                        that[module].deletePDEnvelopePoint(parameter === "env0data" ? 0 : 1, d.index);
                        break;
                    }
                };
                break;
            default:
                result = function (evt) {
                    that[module][parameter].setValueAtTime(evt.detail, that.context.currentTime);
                };
                break;
            }
            return result;
        };

        eventHandlers = [{
            eventName: "oscillator.change.waveform",
            handler: getHandler("oscillator", "waveform")
        }, {
            eventName: "oscillator.change.wrapper",
            handler: getHandler("oscillator", "wrapper")
        }, {
            eventName: "oscillator.resonance.toggle",
            handler: getHandler("oscillator", "resonanceActive")
        }, {
            eventName: "oscillator.env0.change.data",
            handler: getHandler("oscillator", "env0data")
        }, {
            eventName: "oscillator.env1.change.data",
            handler: getHandler("oscillator", "env1data")
        }, {
            eventName: "noise.toggle",
            handler: getHandler("noise", "active")
        }, {
            eventName: "sub.toggle",
            handler: getHandler("sub", "active")
        }];

        addVoiceEventListeners = function () {
            var i, j;
            for (i = 0, j = eventHandlers.length; i < j; i += 1) {
                context.addEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
            }
        };
        getRemoveEventFunction = function () {
            return function removeVoiceEventListeners() {
                var i, j;
                for (i = 0, j = eventHandlers.length; i < j; i += 1) {
                    context.removeEventListener(eventHandlers[i].eventName, eventHandlers[i].handler);
                }
            };
        };
        this.removeVoiceEventListeners = getRemoveEventFunction();
        addVoiceEventListeners();
*/
