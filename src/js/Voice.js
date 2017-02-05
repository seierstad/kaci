import EnvelopeGenerator from "./EnvelopeGenerator";
import PDOscillator from "./PDOscillator";
import NoiseGenerator from "./NoiseGenerator";
import SubOscillator from "./SubOscillator";
import LFO from "./LFO";

//import WavyJones from "../../lib/wavy-jones";

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

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.context = context;

        this.vca = context.createGain();
        this.vca.gain.value = 1;

        this.lfos = [];
        this.createVoiceLfo = this.createVoiceLfo.bind(this);
        this.state.lfos.forEach(this.createVoiceLfo);

        this.envelopes = [];
        this.state.envelopes.forEach((envPatch, index) => {
            this.envelopes[index] = new EnvelopeGenerator(context, store, index);
        });

        this.noise = new NoiseGenerator(context, this.state.noise);
        this.sub = new SubOscillator(context, this.state.sub, frequency);
        this.oscillator = new PDOscillator(context, this.state.oscillator, frequency);

        this.sub.connect(this.vca);
        this.oscillator.connect(this.vca);
        this.noise.connect(this.vca);

        this.targetNodes = {
            ...(prefixKeys(this.oscillator.parameters.targets, "oscillator.")),
            ...(prefixKeys(this.noise.parameters.targets, "noise.")),
            ...(prefixKeys(this.sub.parameters.targets, "sub."))
        };
    }

    createVoiceLfo (lfoPatch, index) {
        if (lfoPatch.mode === "voice") {
            this.lfos[index] = new LFO(this.context, this.store, index);
        }
    }

    stateChangeHandler () {
        const newState = this.store.getState().patch;

        if (this.state !== newState) {
            const {oscillator: o, noise: n, sub: s} = this.state;
            const {oscillator: oNew, noise: nNew, sub: sNew} = newState;

            if (o !== oNew) {
                const {active: a, waveform: wa, pd, resonanceActive: ra, wrapper: wr} = o;
                const {active: aNew, waveform: waNew, pd: pdNew, resonanceActive: raNew, wrapper: wrNew} = oNew;

                if (a !== aNew) {
                    this.oscillator.active = aNew;
                }

                if (wa !== waNew) {
                    this.oscillator.waveform = waNew;
                }

                if (wr !== wrNew) {
                    this.oscillator.wrapper = wrNew;
                }

                if (ra !== raNew) {
                    this.oscillator.resonanceActive = raNew;
                }
            }

            if (n !== nNew) {
                const {active: a, color: c} = n;
                const {active: aNew, color: cNew} = nNew;

                if (a !== aNew) {
                    this.noise.active = aNew;
                }

                if (c !== cNew) {
                    this.noise.color = cNew;
                }

            }

            if (s !== sNew) {
                const {active: a, mode: m, depth: d, beat_sync: bs} = s;
                const {active: aNew, mode: mNew, depth: dNew, beat_sync: bsNew} = sNew;

                if (a !== aNew) {
                    this.sub.active = aNew;
                }

                if (m !== mNew) {
                    this.sub.mode = mNew;
                }

                if (d !== dNew) {
                    this.sub.depth = dNew;
                }

                if (bs !== bsNew) {
                    console.log("TODO: implement sub beat sync");
                }

            }

            this.state = newState;
        }
    }

    get targets () {
        return this.targetNodes;
    }

    set frequency (frequency) {
        this.oscillator.frequency = frequency;
        this.sub.frequency = frequency;
    }

    start (time) {

        this.startTime = time;
        this.sub.start(time);
        this.noise.start(time);
        this.oscillator.start(time);

        this.lfos.forEach(lfo => {
            lfo.start();
        });

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

    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.vca.connect(node.input);
        } else {
            this.vca.connect(node);
        }
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

        this.lfos.forEach(lfo => {
            lfo.disconnect();
            lfo.destroy();
        });

        this.oscillator.destroy();
        this.oscillator = null;

        this.vca.disconnect();
        this.vca = null;

        this.unsubscribe();

        if (typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
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
