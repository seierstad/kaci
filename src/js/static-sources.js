import {scale} from "./Utils";


class StaticSources {

    constructor (context, store, configuration, dc) {

        this.context = context;
        this.store = store;
        this.state = store.getState().patch;

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);


        this.dc = dc;
        let init = this.init(configuration, this.state);
        this.parameters = init.params;
        this.nodes = init.nodes;
        this.limits = init.limits;

        Object.values(this.nodes).map(n => this.dc.connect(n));

    }

    stateChangeHandler () {
        const newState = this.store.getState().patch;

        for (let parameter in this.parameters) {
            const p = parameter.split(".");
            if (this.state.hasOwnProperty(p[0]) && this.state[p[0]].hasOwnProperty(p[1]) && this.state[p[0]][p[1]] !== newState[p[0]][p[1]]) {
                const scaledValue = scale(newState[p[0]][p[1]], this.limits[parameter], {min: -1, max: 1});
                this.parameters[parameter].setValueAtTime(scaledValue, this.context.currentTime);
            }
        }

        this.state = newState;
    }

    init (targets, patch, path) {
        let result = {
            nodes: {},
            params: {},
            limits: {}
        };

        if (!path) {
            return this.init(targets, patch, []);
        }

        let name = "";

        for (const key in targets) {
            if (targets.hasOwnProperty(key)) {
                path.push(key);
                const target = targets[key];
                name = path.join(".");

                if (typeof target.min !== "undefined") {
                    // create static source node

                    const scaledValue = scale(patch[key], target, {min: -1, max: 1});
                    const node = this.context.createGain();
                    node.gain.value = scaledValue;
                    node.gain.setValueAtTime(scaledValue, this.context.currentTime);

                    result.nodes[name] = node;
                    result.limits[name] = target;
                    result.params[name] = node.gain;


                    path.pop();
                } else {
                    const nextLevel = this.init(target, patch[key], path.slice());
                    result = {
                        nodes: {
                            ...result.nodes,
                            ...nextLevel.nodes
                        },
                        params: {
                            ...result.params,
                            ...nextLevel.params
                        },
                        limits: {
                            ...result.limits,
                            ...nextLevel.limits
                        }
                    };
                    path.pop();
                }
            }
        }
        return result;
    }
}


export default StaticSources;
