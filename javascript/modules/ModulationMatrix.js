/*global require, module */
"use strict";
var LFO = require("./LFO"),
    DCGenerator = require("./DCGenerator"),
    Utils = require("./Utils"),
    ModulationMatrix;

ModulationMatrix = function (context, configuration, patch, store) {
    var lfo = [],
        dc = new DCGenerator(context),
        that = this,
        setupSources,
        setupTargets,
        connectStaticSources,
        startGlobalModulators,
        stopGlobalModulators,
        staticParameterChangeHandler;

    this.store = store;
    this.state = store.getState();
    this.targets = {};
    this.sources = {};
    this.connections = {};
    this.context = context;
    this.staticValuesSet = false;
    this.patched = false;
    this.configuration = configuration;

    setupSources = function setupSources(sources, results, path) {
        var i, j,
            key;
        for (i = 0, j = sources.lfo; i < j; i += 1) {
            if (patch.lfos[i].mode === "global" || patch.lfos[i].mode === "retrigger") { // TODO: implement voice LFOs
                lfo[i] = new LFO(context, patch.lfos[i], "lfo" + i, { // TODO: rewrite LFO constructor to initialize without patch data
                    syncMaster: i === 0
                });
            }
        }
    }

    setupSources(configuration.modulation.source, this.sources, "");

    this.globalModulators = {
        "lfo": lfo
    };

    setupTargets = function setupTargets(targets, results, staticSources, path) {
        var target,
            key,
            curve,
            name;

        if (!path) {
            setupTargets(targets, results, staticSources, []);
            return results;
        }
        for (key in targets) {
            if (targets.hasOwnProperty(key)) {
                path.push(key);
                target = targets[key];
                name = path.join(".");
                if (typeof target.min !== "undefined" && !isNaN(target.min)) {
                    results[name] = {};
                    results[name].outputNode = context.createWaveShaper();
                    curve = new Float32Array([target.min, target.max]);
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
    }
    this.sources.static = {};
    setupTargets(configuration.modulation.target, this.targets, this.sources.static);

    connectStaticSources = function connectStaticSources(staticSources, targets) {
        var key;
        for (key in staticSources) {
            if (staticSources.hasOwnProperty(key) && targets[key]) {
                staticSources[key + "Node"].connect(targets[key].outputNode);
            }
        }
    };
    connectStaticSources(this.sources.static, this.targets);

    startGlobalModulators = function startGlobalModulators() {
        this.globalModulators.lfo.forEach(function (lfo) {
            lfo.start();
        });
    };

    stopGlobalModulators = function stopGlobalModulators() {
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

    context.addEventListener('voice.first.started', startGlobalModulators.bind(this), false);
    context.addEventListener('voice.last.ended', stopGlobalModulators.bind(this), false);
    context.addEventListener("modulation.change.connect", connectHandler.bind(this));
    context.addEventListener("modulation.change.disconnect", disconnectHandler.bind(this));
    context.addEventListener("modulation.change.amount", amountHandler.bind(this));
    context.addEventListener("modulation.change.range", rangeHandler.bind(this));

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

ModulationMatrix.prototype.setStaticModulatorValues = function initStaticModulators(patch) {
    var i,
        j,
        mod,
        param,
        path,
        a,
        scaledValue,
        limits,
        s = [
            "noise.gain",
            "sub.gain",
            "noise.pan",
            "sub.pan",
            "oscillator.pan",
            "oscillator.mix",
            "oscillator.resonance",
            "oscillator.detune"
        ];

    for (i = 0, j = s.length; i < j; i += 1) {
        path = s[i];
        a = path.split(".");
        mod = a[0];
        param = a[1];
        limits = {
            "out": {
                min: -1,
                max: 1
            },
            "in": {
                min: this.configuration.modulation.target[mod][param].min,
                max: this.configuration.modulation.target[mod][param].max
            }
        };
        scaledValue = Utils.scale(patch[mod][param], limits.in, limits.out);
        this.sources.static[path].setValueAtTime(scaledValue, this.context.currentTime);
    }
};
ModulationMatrix.prototype.connect = function (sourceType, sourceIndex, range, amount, target) {
    var source;
    if (this.targets[target]) {
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
    var i, j, target, lfoPatch, source;
    for (i = 0, j = patch.lfos.length; i < j; i += 1) {
        lfoPatch = patch.lfos[i];
        for (target in lfoPatch) {
            if (lfoPatch.hasOwnProperty(target)) {
                this.connect("lfo", i, lfoPatch[target].range, lfoPatch[target].amount, target);
            }
        }
    }
};
ModulationMatrix.prototype.patchVoice = function (voice, patch) {
    var localModulators = voice.getLocalModulators(),
        localTargets = voice.getEnvelopeTargets(),
        split, key, envelopePatch, i, j;

    if (!this.staticValuesSet) {
        this.setStaticModulatorValues(patch);
        this.staticValuesSet = true;
    }
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