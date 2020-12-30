import autobind from "autobind-decorator";

/*
    @class KaciNode
    shared setter for context and dc
    (common for all module types)
*/

class KaciNode {

    constructor (...args) {
        const [context, store, patch] = args;
        this.context = context;
        this.dc = context.createConstantSource();
        this.dc.start();
        this.store = store;
        this.state = {
            ...patch
        };
    }

    getNewState () {
        return [...this.stateSelector].reduce((acc, current) => {
            return acc[current];
        }, this.store.getState());
    }

    stateChangeHandler () {
        const newState = this.getNewState();

        if (newState && (newState !== this.state)) {
            this.updateState(newState);
        }
    }

    @autobind
    disconnect () {
        this.dc.disconnect();
    }

    @autobind
    destroy () {
        this.context = null;
        this.dc = null;
        this.store = null;
        this.state = null;
    }
}


export default KaciNode;
