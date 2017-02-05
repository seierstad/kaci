import equal from "deep-equal";
import Utils from "./Utils";
import LFOs from "./LFOs";
import StaticSources from "./static-sources";

import {ParamLogger} from "./sharedFunctions";

class ModulationMatrix {

    constructor (context, store, dc) {
        /*
        constructor:
            - initialize static parameters
            - initialize global modulators (lfos)
            - initial patch
        */

        this.context = context;

        this.store = store;
        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        const state = store.getState();

        this.state = state.patch.modulation;
        this.configuration = state.settings.modulation;
        this.patch = state.patch;
        this.playState = state.playState;

        this.connect = this.connect.bind(this);


        this.lfos = new LFOs(context, store, this.configuration);

        this.sources = {
            static: new StaticSources(context, store, this.configuration.target, dc).nodes,
            lfos: this.lfos.lfos
        };


        this.targets = this.setupTargets(this.configuration.target, this.context, dc);

        this.connectStaticSources(this.sources.static, this.targets);
        this.connections = {};

        this.initPatch();

    }

    initPatch () {
        const activeGlobalLfoConnection = pc => pc.enabled && pc.source.type === "lfo" && this.sources.lfos[pc.source.index];

        const moduleNames = Object.keys(this.state);
        for (const moduleName of moduleNames) {
            const module = this.state[moduleName];
            const parameterNames = Object.keys(module);

            for (const parameterName of parameterNames) {
                const parameterConnections = module[parameterName];

                parameterConnections.filter(activeGlobalLfoConnection).forEach(c => {
                    this.connect(c.source.type, c.source.index, [moduleName, parameterName].join("."), c.polarity, c.amount);
                });
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

    stateChangeHandler () {
        const newState = this.store.getState();

        const keyDown = k => !!k && k.down;

        if (newState.playState.keys !== this.playState.keys) {
            const currentKeyCount = this.playState.keys.filter(keyDown).length;
            const nextKeyCount = newState.playState.keys.filter(keyDown).length;

            if (currentKeyCount === 0 && nextKeyCount > 0) {
                this.lfos.start();
            } else if (currentKeyCount > 0 && nextKeyCount === 0) {
                this.lfos.stop();
            }

            this.playState.keys = newState.playState.keys;
        }

        /*
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
        */

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

    patchVoice (voice, patch) {

        const voiceLfos = voice.lfos;
        const voiceEnvs = voice.envelopes;
        const voiceParamTargets = voice.targets;


        for (let key in voiceParamTargets) {
            if (this.targets[key]) {
                this.targets[key].connect(voiceParamTargets[key]);
            }
        }

        /*
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

        context.addEventListener('voice.first.started', this.startGlobalModulators, false);
        context.addEventListener('voice.last.ended', this.stopGlobalModulators, false);

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


export default ModulationMatrix;
