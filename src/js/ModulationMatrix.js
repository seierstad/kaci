//import WavyJones from "../../lib/wavy-jones";
//import {ParamLogger} from "./shared-functions";
import {MODULATION_SOURCE_TYPE, RANGE} from "./constants";

import LFOs from "./LFOs";
import StaticSources from "./static-sources";


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
        const moduleNames = Object.keys(patch);

        for (const moduleName of moduleNames) {
            const modulePatch = patch[moduleName];
            this.connectModule(connections, modulePatch, moduleName);
        }
    }

    connect (connections, connectionPatch, target) {
        const {amount, polarity: range, source} = connectionPatch;
        const {type, index} = source;
        let sourceNode;


        switch (type) {
            case MODULATION_SOURCE_TYPE.LFO:
                switch (range) {
                    case RANGE.FULL:
                        sourceNode = this.sources.lfos[index];
                        break;
                    case RANGE.POSITIVE:
                        sourceNode = this.sources.lfos[index].outputs.positive;
                        break;
                    case RANGE.NEGATIVE:
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
    }

    patchVoice (voice) {

        const voiceSources = voice.sources;
        const {lfos, envelopes} = voiceSources;

        const voiceTargets = voice.targets;


        for (let key in voiceTargets) {
            if (this.targets[key]) {
                this.targets[key].connect(voiceTargets[key]);
            }

            const [moduleName, parameterName] = key.split(".");
            const {[moduleName]: module = {}} = this.patch;
            const {[parameterName]: parameter = []} = module;
            const parameterEnvelopes = parameter.filter(p => {
                return (
                    p.enabled
                    && p.source.type === MODULATION_SOURCE_TYPE.ENVELOPE
                    && envelopes[p.source.index]
                );
            });
            console.log(moduleName, parameterName, parameterEnvelopes);
            parameterEnvelopes.forEach(p => envelopes[p.source.index].connect(voiceTargets[key].gain));
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
    unpatchVoice (voice) {
        var locals = voice.getModulators(),
            split, key;

        for (key in this.targets) {
            split = key.split(".");
            this.targets[key].outputNode.disconnect(voice[split[0]][split[1]]);
        }
        console.log("voice unpatched");
    }
    */
}


export default ModulationMatrix;
