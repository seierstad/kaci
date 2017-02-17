import equal from "deep-equal";
import Utils from "./Utils";
import LFOs from "./LFOs";
import StaticSources from "./static-sources";
import Connection from "./modulation-connection";

import {ParamLogger} from "./sharedFunctions";

import WavyJones from "../../lib/wavy-jones";

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
        this.patch = state.patch.modulation;
        this.playState = state.playState;

        this.connect = this.connect.bind(this);

        this.lfos = new LFOs(context, store, this.configuration, dc);

        const flatConfig = new StaticSources(context, store, this.configuration.target, dc);

        this.sources = {
            static: flatConfig.nodes,
            lfos: this.lfos.lfos
        };


        this.targets = {};
        for (const key in flatConfig.limits) {
            const {min, max} = flatConfig.limits[key];

            this.targets[key] = context.createWaveShaper();
            this.targets[key].curve = new Float32Array([min, max]);

            this.sources.static[key].connect(this.targets[key]);
        }


        this.connections = {};

        this.initPatch(this.connections, this.state);

    }

    initPatch (connections, patch) {
        // const activeGlobalLfoConnection = pc => pc.enabled && pc.source.type === "lfo" && this.sources.lfos[pc.source.index];

        const moduleNames = Object.keys(patch);
        for (const moduleName of moduleNames) {
            const modulePatch = patch[moduleName];
            this.connectModule(connections, modulePatch, moduleName);
            /*
            const module = this.state[moduleName];
            const parameterNames = Object.keys(module);

            for (const parameterName of parameterNames) {
                const parameterConnections = module[parameterName];

                parameterConnections.filter(activeGlobalLfoConnection).forEach(c => {
                    this.connect(c.source.type, c.source.index, moduleName, parameterName, c);
                });
            }
            */
        }
    }

    connect (connections, connectionPatch, target) {
        const {amount, polarity: range, source} = connectionPatch;
        const {type, index} = source;
        let sourceNode;


        switch (type) {
            case "lfo":
                switch (range) {
                    case "full":
                        sourceNode = this.sources.lfos[index];
                        break;
                    case "positive":
                        sourceNode = this.sources.lfos[index].outputs.positive;
                        break;
                    case "negative":
                        sourceNode = this.sources.lfos[index].outputs.negative;
                        break;
                }
                break;
        }

        connections[index] = this.context.createGain();
        connections[index].gain.value = amount;

        sourceNode.connect(connections[index]);
        connections[index].connect(target);
    }

    connectType (connections, typeName, typePatch, target) {
        connections[typeName] = connections[typeName] || [];
        const enabledConnections = typePatch.filter(c => c.enabled);

        for (const connection of enabledConnections) {
            this.connect(connections[typeName], connection, target);
        }
    }

    connectParameter (connections, parameterPatch, parameterName, moduleName) {
        const targetKey = [moduleName, parameterName].join(".");
        const target = this.targets[targetKey];

        if (target) {
            connections[parameterName] = connections[parameterName] || {};

            const typeNames = Object.keys(this.configuration.source);
            for (const typeName of typeNames) {
                const typePatch = parameterPatch.filter(c => c.source.type === typeName);
                this.connectType(connections[parameterName], typeName, typePatch, target);
            }
        }
    }

    connectModule (connections, modulePatch, moduleName) {
        connections[moduleName] = connections[moduleName] || {};

        for (const parameterName in modulePatch) {
            const parameter = modulePatch[parameterName];
            this.connectParameter(connections[moduleName], parameter, parameterName, moduleName);
        }
    }

    disconnect (node) {
        if (typeof node.disconnect === "function") {
            node.disconnect();
            return null;
        }

        if (typeof node.forEach === "function") {
            node.forEach((connection, index, arr) => {arr[index] = this.disconnect(connection);});
            return null;
        }

        for (const propertyName in node) {
            node[propertyName] = this.disconnect(node[propertyName]);
        }

        return null;
    }

    stateChangeHandler () {
        const newState = this.store.getState();

        const keyDown = k => !!k && k.down;

        const connectionSourceFilter = (typeName, index) => c => c.source.type === typeName && c.source.index === index;

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

        if (newState.patch.modulation !== this.patch) {
            const patch = this.patch;
            const newPatch = newState.patch.modulation;

            for (const moduleName in this.configuration.target) {
                const module = patch[moduleName];
                const newModule = newPatch[moduleName];

                if (module && !newModule) {
                    this.connections[moduleName] = this.disconnect(this.connections[moduleName]);
                }

                if (!module && newModule) {
                    this.connectModule(this.connections, newModule, moduleName);

                } else if (module !== newModule) {

                    for (const parameterName in this.configuration.target[moduleName]) {

                        const parameter = module[parameterName];
                        const newParameter = newModule[parameterName];

                        if (parameter && !newParameter) {
                            this.connections[moduleName][parameterName] = this.disconnect(this.connections[moduleName][parameterName]);
                        } else if (newParameter && !parameter) {
                            this.connectParameter(this.connections[moduleName], newParameter, parameterName, moduleName);
                        } else if (parameter !== newParameter) {
                            for (const typeName in this.configuration.source) {
                                const config = this.configuration.source[typeName];

                                for (let index = 0; index < config.count; index += 1) {
                                    const f = connectionSourceFilter(typeName, index);
                                    const connection = parameter.find(f);
                                    const newConnection = newParameter.find(f);

                                    if (connection && !newConnection) {
                                        this.disconnect(this.connections[moduleName][parameterName][typeName][index]);
                                    } else if (!connection && newConnection) {
                                        const target = this.targets[[moduleName, parameterName].join(".")];
                                        if (target) {
                                            this.connections[moduleName][parameterName][typeName] = this.connections[moduleName][parameterName][typeName] || [];
                                            this.connect(this.connections[moduleName][parameterName][typeName], newConnection, target);
                                        }
                                    } else if (connection !== newConnection) {
                                        const {amount, polarity, enabled} = connection;
                                        const {amount: newAmount, polarity: newPolarity, enabled: newEnabled} = newConnection;

                                        if (enabled !== newEnabled) {
                                            if (enabled && !newEnabled) {
                                                this.disconnect(this.connections[moduleName][parameterName][typeName][index]);
                                            } else {
                                                const target = this.targets[[moduleName, parameterName].join(".")];
                                                if (target) {
                                                    this.connections[moduleName][parameterName][typeName] = this.connections[moduleName][parameterName][typeName] || [];
                                                    this.connect(this.connections[moduleName][parameterName][typeName], newConnection, target);
                                                }
                                            }
                                        }

                                        if (newEnabled) {
                                            if (polarity !== newPolarity) {
                                                this.connections[moduleName][parameterName][typeName][index].disconnect();
                                                const target = this.targets[[moduleName, parameterName].join(".")];
                                                if (target) {
                                                    this.connections[moduleName][parameterName][typeName] = this.connections[moduleName][parameterName][typeName] || [];
                                                    this.connect(this.connections[moduleName][parameterName][typeName], newConnection, target);
                                                }
                                            } else if (amount !== newAmount) {
                                                this.connections[moduleName][parameterName][typeName][index].gain.setValueAtTime(newAmount, this.context.currentTime);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            this.patch = newPatch;
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

    patchVoice (voice, patch) {

        const voiceLfos = voice.lfos;
        const voiceEnvs = voice.envelopes;
        const voiceParamTargets = voice.targets;


        for (let key in voiceParamTargets) {
            if (this.targets[key]) {
                this.targets[key].connect(voiceParamTargets[key]);
            }
        }

        /* start scope
        const scope = new WavyJones(this.context, "oscilloscope");
        scope.lineColor = "black";
        scope.lineThickness = 1;

        this.targets["main.gain"].connect(scope);

        new ParamLogger(voiceParamTargets["main.gain"], this.context, "main");
        //*/

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
