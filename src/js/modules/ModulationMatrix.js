/*global require, module */
"use strict";
const DCGenerator = require("./DCGenerator");
const LFO = require("./LFO");
const Utils = require("./Utils");

const ModulationMatrix = function (context, configuration, patch, store) {
    let connectStaticSources,
        dc = new DCGenerator(context),
        lfo = [],
        setupSources,
        setupTargets,
        startGlobalModulators,
        staticParameterChangeHandler,
        stopGlobalModulators,
        that = this;

    this.store = store;
    this.state = store.getState();
    this.targets = {};
    this.sources = {};
    this.connections = {};
    this.context = context;
    this.staticValuesSet = false;
    this.patched = false;
    this.configuration = configuration;

    setupSources = function setupSources (sources) {
        for (let i = 0, j = sources.lfo; i < j; i += 1) {
            if (patch.lfos[i].mode === "global" || patch.lfos[i].mode === "retrigger") { // TODO: implement voice LFOs
                lfo[i] = new LFO(context, patch.lfos[i], "lfo" + i, { // TODO: rewrite LFO constructor to initialize without patch data
                    syncMaster: i === 0
                });
            }
        }
    };

    setupSources(configuration.modulation.source, this.sources, "");

    this.globalModulators = {
        "lfo": lfo
    };

    setupTargets = function setupTargets (targets, results, staticSources, path) {

        if (!path) {
            setupTargets(targets, results, staticSources, []);
            return results;
        }

        for (let key in targets) {
            if (targets.hasOwnProperty(key)) {
                path.push(key);
                const target = targets[key];
                const name = path.join(".");

                if (typeof target.min !== "undefined" && !isNaN(target.min)) {
                    results[name] = {};
                    results[name].outputNode = context.createWaveShaper();
                    const curve = new Float32Array([target.min, target.max]);
                    results[name].outputNode.curve = curve;

                    // create static source node for target
                    staticSources[name + "Node"] = context.createGain();
                    staticSources[name] = staticSources[name + "Node"].gain;
                    dc.connect(staticSources[name + "Node"]);

                    path.pop();
                } else {
                    setupTargets(target, results, staticSources, path.slice());
                    path.pop();
                }
            }
        }
    };

    this.sources.static = {};
    setupTargets(configuration.modulation.target, this.targets, this.sources.static);

    connectStaticSources = function connectStaticSources (staticSources, targets) {
        for (let key in staticSources) {
            if (staticSources.hasOwnProperty(key) && targets[key]) {
                staticSources[key + "Node"].connect(targets[key].outputNode);
            }
        }
    };
    connectStaticSources(this.sources.static, this.targets);

    startGlobalModulators = function startGlobalModulators () {
        this.globalModulators.lfo.forEach(function (lfo) {
            lfo.start();
        });
    };

    stopGlobalModulators = function stopGlobalModulators () {
        this.globalModulators.lfo.forEach(function (lfo) {
            lfo.stop();
        });
    };
    this.validEventData = function (data) {
        return data.sourceType && !isNaN(parseInt(data.sourceIndex, 10)) && data.targetModule && data.targetParameter;
    };
    this.eventDataConnection = function (data) {
        if (this.validEventData(data) && this.connections[data.sourceType] && this.connections[data.sourceType][data.sourceIndex] && this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter]) {
            return this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter];
        }
        return null;
    };

    const disconnectHandler = function (event) {
        const data = event.detail;
        const connection = this.eventDataConnection(data);

        if (connection) {
            connection.disconnect();
            connection = null;
            delete this.connections[data.sourceType][data.sourceIndex][data.targetModule + "." + data.targetParameter];
        }
    };
    const connectHandler = function (event) {
        const data = event.detail;
        const connection = this.eventDataConnection(data);

        if (!connection) {
            this.connect(data.sourceType, data.sourceIndex, data.range, data.amount, data.targetModule + "." + data.targetParameter);
        }
    };

    const amountHandler = function (event) {
        const data = event.detail;
        const connection = this.eventDataConnection(data);


        if (connection && !isNaN(parseFloat(data.amount, 10))) {
            connection.gain.value = data.amount;
        }
    };

    const rangeHandler = function (event) {
        const data = event.detail;
        const connection = this.eventDataConnection(data);

        if (connection && data.range) {
            const amount = connection.gain.value;
            connection.disconnect();
            connection = null;
            this.connect(data.sourceType, data.sourceIndex, data.range, amount, data.targetModule + "." + data.targetParameter);
        }
    };

    context.addEventListener("voice.first.started", startGlobalModulators.bind(this), false);
    context.addEventListener("voice.last.ended", stopGlobalModulators.bind(this), false);
    context.addEventListener("modulation.change.connect", connectHandler.bind(this));
    context.addEventListener("modulation.change.disconnect", disconnectHandler.bind(this));
    context.addEventListener("modulation.change.amount", amountHandler.bind(this));
    context.addEventListener("modulation.change.range", rangeHandler.bind(this));

    staticParameterChangeHandler = function staticParameterChangeHandler (parameter) {
        if (that.sources.static[parameter]) {
            return function (evt) {
                this.sources.static[parameter].setValueAtTime(evt.detail, this.context.currentTime);
            };
        }
        return function (evt) {
            console.log("call to faulty event handler: attempt to set " + parameter + " to " + evt.detail);
        };
    };
    /*
    context.addEventListener("noise.change.gain", staticParameterChangeHandler("noise.gain").bind(this));
    context.addEventListener("noise.change.pan", staticParameterChangeHandler("noise.pan").bind(this));
    */
    context.addEventListener("sub.change.gain", staticParameterChangeHandler("sub.gain").bind(this));
    context.addEventListener("sub.change.pan", staticParameterChangeHandler("sub.pan").bind(this));
    context.addEventListener("oscillator.change.resonance", staticParameterChangeHandler("oscillator.resonance").bind(this));
    context.addEventListener("oscillator.change.mix", staticParameterChangeHandler("oscillator.mix").bind(this));
    context.addEventListener("oscillator.change.pan", staticParameterChangeHandler("oscillator.pan").bind(this));
    context.addEventListener("oscillator.change.detune", staticParameterChangeHandler("oscillator.detune").bind(this));

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

    store.subscribe(this.update);
};

ModulationMatrix.prototype.setStaticModulatorValues = function initStaticModulators (patch) {
    const s = [
        "noise.gain",
        "sub.gain",
        "noise.pan",
        "sub.pan",
        "oscillator.pan",
        "oscillator.mix",
        "oscillator.resonance",
        "oscillator.detune"
    ];


    for (let i = 0, j = s.length; i < j; i += 1) {
        const path = s[i];
        const a = path.split(".");
        const mod = a[0];
        const param = a[1];
        const limits = {
            "out": {
                min: -1,
                max: 1
            },
            "in": {
                min: this.configuration.modulation.target[mod][param].min,
                max: this.configuration.modulation.target[mod][param].max
            }
        };
        const scaledValue = Utils.scale(patch[mod][param], limits.in, limits.out);
        this.sources.static[path].setValueAtTime(scaledValue, this.context.currentTime);
    }
};
ModulationMatrix.prototype.connect = function (sourceType, sourceIndex, range, amount, target) {
    if (this.targets[target]) {
        let source;
        switch (range) {
            case "full":
                source = this.globalModulators[sourceType][sourceIndex];
                break;
            case "positive":
                source = this.globalModulators[sourceType][sourceIndex].outputs.positive;
                break;
            case "negative":
                source = this.globalModulators[sourceType][sourceIndex].outputs.negative;
        }

        this.connections[sourceType] = this.connections[sourceType] || [];
        this.connections[sourceType][sourceIndex] = this.connections[sourceType][sourceIndex] || {};
        this.connections[sourceType][sourceIndex][target] = this.context.createGain();
        this.connections[sourceType][sourceIndex][target].gain.value = amount;

        source.connect(this.connections[sourceType][sourceIndex][target]);
        this.connections[sourceType][sourceIndex][target].connect(this.targets[target].outputNode);
    }
};
ModulationMatrix.prototype.patch = function (patch) {
    for (let i = 0, j = patch.lfos.length; i < j; i += 1) {
        const lfoPatch = patch.lfos[i];
        for (let target in lfoPatch) {
            if (lfoPatch.hasOwnProperty(target)) {
                this.connect("lfo", i, lfoPatch[target].range, lfoPatch[target].amount, target);
            }
        }
    }
};

ModulationMatrix.prototype.patchVoice = function (voice, patch) {
    let envelopePatch,
        localModulators = voice.getLocalModulators(),
        localTargets = voice.getEnvelopeTargets();

    if (!this.staticValuesSet) {
        this.setStaticModulatorValues(patch);
        this.staticValuesSet = true;
    }
    if (!this.patched) {
        this.patch(patch.modulation);
        this.patched = true;
    }
    for (let key in this.targets) {
        const split = key.split(".");
        this.targets[key].outputNode.connect(voice[split[0]][split[1]]);
    }
    for (let i = 0, j = patch.modulation.envelopes.length; i < j; i += 1) {
        if (localModulators.envelope[i]) {
            envelopePatch = patch.modulation.envelopes[i];
            for (let key in envelopePatch) {
                if (localTargets[key]) {
                    localModulators.envelopes[i].connect(localTargets[key]);
                }
            }
        }
    }
};
/*
ModulationMatrix.prototype.unpatchVoice = function (voice) {
    var locals = voice.getModulators(),
        split, key;

    for (key in this.targets) {
        split = key.split(".");
        this.targets[key].outputNode.disconnect(voice[split[0]][split[1]]);
    }
    console.log("voice unpatched");
};
*/
module.exports = ModulationMatrix;
