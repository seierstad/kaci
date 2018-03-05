//import WavyJones from "../../lib/wavy-jones";
//import {ParamLogger} from "./shared-functions";
import autobind from "autobind-decorator";

import {MODULATION_SOURCE_TYPE, RANGE} from "./constants";

import LFOs from "./LFOs";
import StaticSources from "./static-sources";
import MorseGenerators from "./morse-generators";
import StepSequencers from "./modulators/step-sequencers";

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
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        const state = store.getState();

        this.state = state.patch.modulation;
        this.configuration = state.settings.modulation;
        this.patch = state.patch.modulation;


        this.lfos = new LFOs(context, store, this.configuration, dc);
        this.steps = new StepSequencers(context, store, this.configuration, dc);
        this.morse = new MorseGenerators(context, store, this.configuration, dc);

        const flatConfig = new StaticSources(context, store, this.configuration.target, dc);

        this.sources = {
            static: flatConfig.nodes,
            lfos: this.lfos.lfos,
            steps: this.steps.sequencers,
            morse: this.morse.generators
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

    startGlobalModulators () {
        this.lfos.start();
        this.steps.start();
        this.morse.start();
    }

    stopGlobalModulators () {
        this.lfos.stop();
        this.steps.stop();
        this.morse.stop();
    }

    initPatch (connections, patch) {
        const moduleNames = Object.keys(patch);

        for (const moduleName of moduleNames) {
            const modulePatch = patch[moduleName];
            this.connectModule(connections, modulePatch, moduleName);
        }
    }

    @autobind
    connect (connections, connectionPatch, target) {
        const {amount, polarity: range, source} = connectionPatch;
        const {type, index} = source;
        let sourceNode;
        let sourceArray;

        switch (type) {
            case MODULATION_SOURCE_TYPE.LFO:
                sourceArray = this.sources.lfos;
                break;

            case MODULATION_SOURCE_TYPE.MORSE:
                sourceArray = this.sources.morse;
                break;

            case MODULATION_SOURCE_TYPE.STEPS:
                sourceArray = this.sources.steps;
        }

        if (sourceArray[index]) {
            switch (range) {
                case RANGE.FULL:
                    sourceNode = sourceArray[index];
                    break;
                case RANGE.POSITIVE:
                    sourceNode = sourceArray[index].outputs.positive;
                    break;
                case RANGE.NEGATIVE:
                    sourceNode = sourceArray[index].outputs.negative;
                    break;
            }

            connections[index] = this.context.createGain();
            connections[index].gain.setValueAtTime(amount, this.context.currentTime);

            sourceNode.connect(connections[index]);
            connections[index].connect(target);
        }
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

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        const connectionSourceFilter = (typeName, index) => c => c.source.type === typeName && c.source.index === index;

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

    patcher (patchable) {

        const {
            sources: {
                lfos,
                envelopes,
                steps,
                morse
            } = {},
            targets: patchableTargets = {}
        } = patchable;


        const envelopeConnections = {};
        const lfoConnections = {};
        const stepsConnections = {};
        const morseConnections = {};

        for (let key in patchableTargets) {
            if (this.targets[key]) {
                this.targets[key].connect(patchableTargets[key]);
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
            parameterEnvelopes.forEach(p => {
                envelopes[p.source.index].connect(patchableTargets[key].gain);
                envelopeConnections[key] = envelopes[p.source.index];
            });

            const parameterLfos = parameter.filter(p => {
                return (
                    p.enabled
                    && p.source.type === MODULATION_SOURCE_TYPE.LFO
                    && lfos[p.source.index]
                );
            });
            parameterLfos.forEach(p => {
                lfos[p.source.index].connect(patchableTargets[key]);
                lfoConnections[key] = lfos[p.source.index];
            });

            const parameterSteps = parameter.filter(p => {
                return (
                    p.enabled
                    && p.source.type === MODULATION_SOURCE_TYPE.STEPS
                    && steps[p.source.index]
                );
            });
            parameterSteps.forEach(p => {
                steps[p.source.index].connect(patchableTargets[key]);
                stepsConnections[key] = steps[p.source.index];
            });

            const parameterMorse = parameter.filter(p => {
                return (
                    p.enabled
                    && p.source.type === MODULATION_SOURCE_TYPE.MORSE
                    && morse[p.source.index]
                );
            });
            parameterMorse.forEach(p => {
                morse[p.source.index].connect(patchableTargets[key]);
                morseConnections[key] = morse[p.source.index];
            });
        }


        patchable.envelopeConnections = envelopeConnections;
        patchable.lfoConnections = lfoConnections;
        patchable.morseConnections = morseConnections;
        patchable.stepsConnections = stepsConnections;
    }

    patchVoice (voice) {
        this.patcher(voice);
    }

    patchVoiceRegister (voiceRegister) {
        this.patcher(voiceRegister);
    }

    /*
    unpatchVoice (voice) {
        var locals = voice.getModulators(),
            split, key;

        for (key in this.targets) {
            split = key.split(".");
            this.targets[key].outputNode.disconnect(voice[split[0]][split[1]]);
        }
        //console.log("voice unpatched");
    }
    */
}


export default ModulationMatrix;
