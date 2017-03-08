import DC from "./DCGenerator";
import EnvelopeGenerator from "./EnvelopeGenerator";
import PDOscillator from "./PDOscillator";
import NoiseGenerator from "./NoiseGenerator";
import SubOscillator from "./SubOscillator";
import LFO from "./LFO";
import MorseGenerator from "./morse-generator";

import OutputStage from "./output-stage";

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
        this.dc = new DC(context);

        this.store = store;
        this.state = store.getState().patch;

        this.destroy = this.destroy.bind(this);
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.context = context;

        this.mainOut = new OutputStage(context, this.dc, !!this.state.main.active);

        this.lfos = this.state.lfos.reduce((acc, lfo, index) => {
            if (lfo.mode === "voice") {
                acc[index] = new LFO(this.context, this.store, lfo, this.dc, index);
            }
            return acc;
        }, []);

        this.morse = this.state.morse.reduce((acc, morse, index) => {
            if (morse.mode === "voice") {
                acc[index] = new MorseGenerator(this.context, this.store, morse, this.dc, index);
            }
            return acc;
        }, []);

        this.envelopes = this.state.envelopes.map((envPatch, index) => new EnvelopeGenerator(context, store, index));
        this.connections = {
            envelopes: {},
            lfos: {},
            morse: {}
        }; // values set in ModulationMatrix.patchVoice

        this.noise = new NoiseGenerator(context, this.dc, this.state.noise);
        this.sub = new SubOscillator(context, this.dc, this.state.sub, frequency);
        this.oscillator = new PDOscillator(context, this.dc, this.state.oscillator, frequency);

        this.sub.connect(this.mainOut.input);
        this.oscillator.connect(this.mainOut.input);
        this.noise.connect(this.mainOut.input);

        this.targetNodes = {
            ...(prefixKeys(this.mainOut.targets, "main.")),
            ...(prefixKeys(this.oscillator.targets, "oscillator.")),
            ...(prefixKeys(this.noise.targets, "noise.")),
            ...(prefixKeys(this.sub.targets, "sub."))
        };
    }

    stateChangeHandler () {
        const newState = this.store.getState().patch;

        if (this.state !== newState) {
            const {oscillator: o, noise: n, sub: s, main: m} = this.state;
            const {oscillator: oNew, noise: nNew, sub: sNew, main: mNew} = newState;

            if (m !== mNew) {
                if (m.active !== mNew.active) {
                    this.mainOut.active = mNew.active;
                }
            }

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

                if (pd !== pdNew) {
                    if (pdNew[0] !== pd[0]) {
                        this.oscillator.pd0 = pdNew[0];
                    }
                    if (pdNew[1] !== pd[1]) {
                        this.oscillator.pd1 = pdNew[1];
                    }

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

    get sources () {
        return {
            "lfos": this.lfos,
            "morse": this.morse,
            "envelopes": this.envelopes
        };
    }

    set frequency (frequency) {
        this.oscillator.frequency = frequency;
        this.sub.frequency = frequency;
    }

    set envelopeConnections (connections) {
        this.connections.envelopes = connections;
    }

    start (time) {

        this.startTime = time;
        this.sub.start(time);
        this.noise.start(time);
        this.oscillator.start(time);

        this.lfos.forEach(lfo => {
            lfo.start();
        });

        this.morse.forEach(morse => {
            morse.start();
        });

        this.envelopes.forEach(envelope => envelope.trigger(time));
    }

    stop (time, callback) {
        this.stopTime = time;

        this.envelopes.forEach(function (envelope) {
            envelope.release(time);
        });

        let destroyDelay = 0;
        if (this.connections.envelopes["main.gain"]) {
            destroyDelay = this.connections.envelopes["main.gain"].releaseDuration;
        }

        this.destroyCallback = callback;
        this.destroyTimer = setTimeout(this.destroy, destroyDelay * 1000);
    }

    connect (node) {
        if (node.hasOwnProperty("input")) {
            this.mainOut.connect(node.input);
        } else {
            this.mainOut.connect(node);
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
            lfo.stop();
            lfo.disconnect();
            lfo.destroy();
        });

        this.morse.forEach(morse => {
            morse.stop();
            morse.disconnect();
            morse.destroy();
        });

        this.oscillator.destroy();
        this.oscillator = null;

        this.mainOut.disconnect();
        this.mainOut = null;

        this.unsubscribe();

        if (typeof this.destroyCallback === "function") {
            this.destroyCallback(this);
        }
    }
}


export default Voice;
