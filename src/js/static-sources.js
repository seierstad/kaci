import {scale} from "./Utils";


const normalized = {min: -1, max: 1};

class StaticSources {

    constructor (context, store, configuration, dc) {

        this.context = context;
        this.store = store;
        this.state = store.getState().patch;

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.parameters = {};
        this.nodes = {};
        this.limits = {};


        for (const moduleName in configuration) {
            const targetModule = configuration[moduleName];

            for (const parameterName in targetModule) {
                const limits = targetModule[parameterName];
                const name = [moduleName, parameterName].join(".");
                const node = context.createGain();

                this.nodes[name] = node;
                this.limits[name] = limits;
                this.parameters[name] = node.gain;

                const patchValue = this.state[moduleName][parameterName];
                const scaledValue = scale(patchValue, limits, normalized);
                node.gain.value = scaledValue;
                node.gain.setValueAtTime(scaledValue, context.currentTime);
                dc.connect(node);
            }
        }

    }

    stateChangeHandler () {
        const newState = this.store.getState().patch;

        if (this.state !== newState) {
            for (const modName in this.state) {
                const mod = this.state[modName];
                const modNew = newState[modName];

                if (mod !== modNew) {
                    for (const paramName in mod) {
                        const param = mod[paramName];
                        const newParam = modNew[paramName];


                        if (param !== newParam) {
                            const key = [modName, paramName].join(".");
                            if (this.parameters[key]) {
                                const normalizedValue = scale(newParam, this.limits[key], normalized);
                                this.parameters[key].setValueAtTime(normalizedValue, this.context.currentTime);
                            }

                        }
                    }
                }
            }

            this.state = newState;
        }
    }
}


export default StaticSources;
