import autobind from "autobind-decorator";

import KaciNode from "./kaci-node";
import OutputStage from "./output-stage";

/*
    @class KaciNode
    shared setter for context and dc
    (common for all module types)
*/

class KaciAudioNode extends KaciNode {

    constructor (...args) {
        super(...args);
        const [context, dc, store, patch] = args;

        // used in generator functions to stop signal generation in the middle
        // of an audioprocess event
        this.disabled = false;

        // gain, pan and mute
        this.outputStage = new OutputStage(this.context, this.dc, !!patch.active);
    }

    set active (active) {
        this.outputStage.active = active;
    }

    connect (node) {
        this.outputStage.connect(node);
    }

    disconnect () {
        this.outputStage.disconnect();
    }

    @autobind
    destroy () {
        this.outputStage.destroy();
        this.outputStage = null;

        super.destroy();
    }
}


export default KaciAudioNode;