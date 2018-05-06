import autobind from "autobind-decorator";

/*
    @class KaciNode
    shared setter for context and dc
    (common for all module types)
*/

class KaciNode {

    constructor (...args) {
        const [context, dc, store, patch] = args;
        this.context = context;
        this.dc = dc;
        this.store = store;
        this.state = {...patch};
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
