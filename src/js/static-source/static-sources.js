import autobind from "autobind-decorator";
import KaciNode from "../kaci-node";
import {scale} from "../Utils";

const normalized = {
    min: -1,
    max: 1
};


class StaticSources extends KaciNode {

    constructor (...args) {
        super(...args);

        const [context, store, configuration] = args;

        this.store = store;
        this.patchState = store.getState().patch;
        this.playState = store.getState().playState;

        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);

        this.parameters = {};
        this.nodes = {};
        this.limits = {};

        for (const moduleName in configuration) {
            const targetModule = configuration[moduleName];

            for (const parameterName in targetModule) {
                const {
                    [moduleName]: {
                        [parameterName]: patchValue
                    } = {}
                } = this.patchState;

                const {
                    [moduleName]: {
                        [parameterName]: playStateValue
                    } = {}
                } = this.playState;

                const {
                    default: defaultValue = 0,
                    ...limits
                } = targetModule[parameterName];

                const name = [moduleName, parameterName].join(".");
                const node = context.createGain();

                this.nodes[name] = node;
                this.limits[name] = limits;
                this.parameters[name] = node.gain;

                const value = patchValue || playStateValue || defaultValue;
                const scaledValue = scale(value, limits, normalized);
                node.gain.setValueAtTime(scaledValue, context.currentTime);
                this.dc.connect(node);
            }
        }
    }

    @autobind
    stateChangeHandler () {
        const newState = this.store.getState();

        if (this.patchState !== newState.patch) {
            for (const modName in this.patchState) {
                const {[modName]: mod} = this.patchState;
                const {[modName]: modNew} = newState.patch;

                if (mod !== modNew) {
                    for (const paramName in mod) {
                        const {[paramName]: param} = mod;
                        const {[paramName]: newParam} = modNew;


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

            this.patchState = newState.patch;
        }

        if (this.playState !== newState.playState) {
            for (const modName in this.playState) {
                const {[modName]: mod} = this.playState;
                const {[modName]: modNew} = newState.playState;

                if (mod !== modNew) {
                    for (const paramName in mod) {
                        const {[paramName]: param} = mod;
                        const {[paramName]: newParam} = modNew;


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

            this.playState = newState.playState;
        }

    }
}


export default StaticSources;
