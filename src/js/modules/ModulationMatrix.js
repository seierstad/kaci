/*global require, module */
"use strict";
import equal from "deep-equal";
import LFO from "./LFO";
import DCGenerator from "./DCGenerator";
import Utils from "./Utils";
import ModulationSources from "./ModulationSources.jsx";

import {ParamLogger} from "./sharedFunctions";

class ModulationMatrix {

    constructor (context, store) {
        /*
        constructor:
            - initialize static parameters
            - initialize global modulators (lfos)
            - initial patch
        */

        this.context = context;
        this.store = store;
        const state = store.getState();

        this.state = state.patch.modulation;
        this.configuration = state.settings.modulation;
        this.patch = state.patch;

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);


        this.connectLFO = this.connectLFO.bind(this);

        this.dc = new DCGenerator(context);

        let sources = new ModulationSources(context, store, this.configuration);

        this.sources = sources.sources;
        this.targets = this.setupTargets(this.configuration.target, this.context, this.dc);

        this.connectStaticSources(this.sources.static, this.targets);
        this.connections = {};


        this.state.lfos.forEach(this.connectLFO);

    }


    stateChangeHandler () {
        const newState = this.store.getState().patch.modulation;

        const compareLFOState = (newLfo, index) => {
            for (let target in newLfo) {
                const lfo = this.state.lfos[index] && this.state.lfos[index][target];
                if (!equal(lfo, newLfo[target])) {
                    if (!lfo || newLfo[target].enabled && !lfo.enabled) {
                        // new connection
                        this.connect("lfo", index, target, newLfo[target].polarity, newLfo[target].amount);
                    } else {
                        if (lfo.enabled && !newLfo[target].enabled) {
                            // disconnect
                            this.disconnect("lfo", index, target);
                        } else if (lfo.polarity !== newLfo[target].polarity) {
                            // reconnect
                            this.disconnect("lfo", index, target);
                            this.connect("lfo", index, target, newLfo[target].polarity, newLfo[target].amount);
                        }
                        if (lfo.amount !== newLfo[target].amount) {
                            this.connections.lfo[index][target].gain.value = newLfo[target].amount;
                        }
                    }
                }
            }
        };


        if (!equal(this.state, newState)) {
            newState.lfos.forEach(compareLFOState);

            this.state = newState;
        }

    }

    connectLFO (lfo, index) {
        for (let target in lfo) {
            const connection = lfo[target];
            if (connection.enabled) {
                this.connect("lfo", index, target, connection.polarity, connection.amount);
            }
        }
    }

    validEventData (data) {
        return data.sourceType && !isNaN(parseInt(data.sourceIndex, 10)) && data.targetModule && data.targetParameter;
    }

    setupTargets (targets, context, dc, path) {
        let result = {};

        if (!path) {
            return this.setupTargets(targets, context, dc, []);
        }
        for (let key in targets) {
            if (targets.hasOwnProperty(key)) {
                path.push(key);
                const target = targets[key];
                const name = path.join(".");

                if (typeof target.min !== "undefined") {
                    const curve = new Float32Array([target.min, target.max]);
                    result[name] = context.createWaveShaper();
                    result[name].curve = curve;
                    path.pop();
                } else {
                    result = {
                        ...result,
                        ...this.setupTargets(target, context, dc, path.slice())
                    };
                    path.pop();
                }
            }
        }
        return result;
    }

    connectStaticSources (sources, targets) {
        for (let key in sources) {
            if (sources.hasOwnProperty(key) && targets[key]) {
                sources[key].connect(targets[key]);
            }
        }
    }

    connect (type, index, target, range, amount) {
        let source;
        if (this.targets[target]) {
            switch (type) {
                case "lfo":
                    switch (range) {
                        case "full":
                            source = this.sources.lfos[index];
                            break;
                        case "positive":
                            source = this.sources.lfos[index].outputs.positive;
                            break;
                        case "negative":
                            source = this.sources.lfos[index].outputs.negative;
                            break;
                    }
                    break;
            }

            this.connections[type] = this.connections[type] || [];
            this.connections[type][index] = this.connections[type][index] || {};
            this.connections[type][index][target] = this.context.createGain();
            this.connections[type][index][target].gain.value = amount;

            source.connect(this.connections[type][index][target]);
            this.connections[type][index][target].connect(this.targets[target]);
        }
    }

    disconnect (type, index, target) {
        if (this.connections[type][index][target]) {
            this.connections[type][index][target].disconnect();
            this.connections[type][index][target] = null;
        }
    }


    patchVoice (voice, patch) {
        /*        var localModulators = voice.getLocalModulators(),
            localTargets = voice.getEnvelopeTargets(),
            split, key, envelopePatch, i, j;
*/
        const voiceLfos = voice.lfos;
        const voiceEnvs = voice.envelopes;
        const voiceParamInputs = voice.parameterInputNodes;
        const voiceParamOutputs = voice.parameterOutputNodes;

        for (let key in voiceParamOutputs) {
            voiceParamOutputs[key].disconnect();
            voiceParamOutputs[key] = null; // testing
        }
        for (let key in voiceParamInputs) {
            if (this.targets[key]) {
                this.targets[key].connect(voiceParamInputs[key]);
            }
        }

        /*
        if (!this.patched) {
            this.patch(patch.modulation);
            this.patched = true;
        }
        for (key in this.targets) {
            split = key.split(".");
            this.targets[key].outputNode.connect(voice[split[0]][split[1]]);
        }
        for (i = 0, j = patch.modulation.envelopes.length; i < j; i += 1) {
            if (localModulators.envelope[i]) {
                envelopePatch = patch.modulation.envelopes[i];
                for (key in envelopePatch) {
                    if (localTargets[key]) {
                        localModulators.envelopes[i].connect(localTargets[key]);
                    }
                }
            }
        }
*/
    }
    /*
        this.eventDataConnection = function (data) {
            if (this.validEventData(data) && this.connections[data.sourceType] && this.connections[data.sourceType][data.sourceIndex] && this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter]) {
                return this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter];
            } else {
                return null;
            }
        };
        var disconnectHandler = function (event) {
            var data = event.detail,
                connection = this.eventDataConnection(data);
            if (connection) {
                connection.disconnect();
                connection = null;
                delete this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter];
            }
        };
        var connectHandler = function (event) {
            var data = event.detail,
                connection = this.eventDataConnection(data);
            if (!connection) {
                this.connect(data.sourceType, data.sourceIndex, data.range, data.amount, data.targetModule + "." + data.targetParameter);
            }
        };

        var amountHandler = function (event) {
            var data = event.detail,
                connection = this.eventDataConnection(data);

            if (connection && !isNaN(parseFloat(data.amount, 10))) {
                connection.gain.value = data.amount;
            }
        };

        var rangeHandler = function (event) {
            var data = event.detail,
                connection = this.eventDataConnection(data),
                amount,
                source;

            if (connection && data.range) {
                amount = connection.gain.value;
                connection.disconnect();
                connection = null;
                this.connect(data.sourceType, data.sourceIndex, data.range, amount, data.targetModule + "." + data.targetParameter);
            }
        };

        context.addEventListener('voice.first.started', this.startGlobalModulators, false);
        context.addEventListener('voice.last.ended', this.stopGlobalModulators, false);
        context.addEventListener("modulation.change.connect", connectHandler.bind(this));
        context.addEventListener("modulation.change.disconnect", disconnectHandler.bind(this));
        context.addEventListener("modulation.change.amount", amountHandler.bind(this));
        context.addEventListener("modulation.change.range", rangeHandler.bind(this));

        context.addEventListener("noise.change.gain", staticParameterChangeHandler("noise.gain").bind(this));
        context.addEventListener("noise.change.pan", staticParameterChangeHandler("noise.pan").bind(this));
        context.addEventListener("sub.change.gain", staticParameterChangeHandler("sub.gain").bind(this));
        context.addEventListener("sub.change.pan", staticParameterChangeHandler("sub.pan").bind(this));
        context.addEventListener("oscillator.change.resonance", staticParameterChangeHandler("oscillator.resonance").bind(this));
        context.addEventListener("oscillator.change.mix", staticParameterChangeHandler("oscillator.mix").bind(this));
        context.addEventListener("oscillator.change.pan", staticParameterChangeHandler("oscillator.pan").bind(this));
        context.addEventListener("oscillator.change.detune", staticParameterChangeHandler("oscillator.detune").bind(this));


        staticParameterChangeHandler = function staticParameterChangeHandler(parameter) {
            if (that.sources.static[parameter]) {
                return function (evt) {
                    this.sources.static[parameter].setValueAtTime(evt.detail, this.context.currentTime);
                }
            } else {
                return function (evt) {
                    console.log("call to faulty event handler: attempt to set " + parameter + " to " + evt.detail);
                }
            }
        };        staticParameterChangeHandler = function staticParameterChangeHandler(parameter) {
            if (that.sources.static[parameter]) {
                return function (evt) {
                    this.sources.static[parameter].setValueAtTime(evt.detail, this.context.currentTime);
                }
            } else {
                return function (evt) {
                    console.log("call to faulty event handler: attempt to set " + parameter + " to " + evt.detail);
                }
            }
        };

unpatchVoice (voice) {
    var locals = voice.getModulators(),
        split, key;

    for (key in this.targets) {
        split = key.split(".");
        this.targets[key].outputNode.disconnect(voice[split[0]][split[1]]);
    }
    console.log("voice unpatched");
};
        this.update = () => {
            const state = this.store.getState();
            if (this.state.patch.noise.gain !== state.patch.noise.gain) {
                this.sources.static["noise.gain"].setValueAtTime(state.patch.noise.gain, this.context.currentTime);
            }
            if (this.state.patch.noise.pan !== state.patch.noise.pan) {
                this.sources.static["noise.pan"].setValueAtTime(state.patch.noise.pan, this.context.currentTime);
            }
            if (this.state.patch.sub.gain !== state.patch.sub.gain) {
                this.sources.static["sub.gain"].setValueAtTime(state.patch.sub.gain, this.context.currentTime);
            }
            if (this.state.patch.sub.pan !== state.patch.sub.pan) {
                this.sources.static["sub.pan"].setValueAtTime(state.patch.sub.pan, this.context.currentTime);
            }

            this.state = state;
        };


*/
}
export
default ModulationMatrix;
