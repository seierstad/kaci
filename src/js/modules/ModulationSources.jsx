/*global require, module */
"use strict";
import LFO from "./LFO";
import DCGenerator from "./DCGenerator";
import Utils from "./Utils";
import StaticSources from "./StaticSources.jsx";


class ModulationSources {

    constructor(context, store, configuration) {

        this.context = context;
        this.store = store;
        this.state = store.getState();

        this.stateChangeHandler = this.stateChangeHandler.bind(this);
        this.unsubscribe = this.store.subscribe(this.stateChangeHandler);


        this.staticSources = new StaticSources(context, store, configuration.target);


        this.sources = {
            "lfos": this.setupLFOs(configuration.source.lfos, this.state.patch.lfos),
            "static": this.staticSources.nodes
        };


    }

    stateChangeHandler() {
        const newState = this.store.getState();

        // TODO:
        // handle change from local to global/retrigger lfo mode
        // and handle global lfo start/retrigger/stop on keypress/release

        this.state = newState;
    }

    setupLFOs(configuration, patch) {
        var i, j;
        const result = [];

        for (i = 0, j = configuration.count; i < j; i += 1) {
            if (patch[i].mode === "global" || patch[i].mode === "retrigger") {
                result[i] = new LFO(this.context, this.store, i);
                result[i].start();
            }
        }

        return result;
    }

    startGlobalModulators() {
        this.sources.lfos.forEach(lfo => lfo.start());
    }

    stopGlobalModulators() {
        this.sources.lfos.forEach(lfo => lfo.stop());
    }

}


export default ModulationSources;
