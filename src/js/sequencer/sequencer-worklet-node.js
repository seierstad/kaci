const audioWorkletNode = (typeof AudioWorkletNode === "undefined" ? Object : AudioWorkletNode);

/*
Options available:
(https://developer.mozilla.org/en-US/docs/Web/API/AudioWorkletNodeOptions)

numberOfInputs Optional
    The value to initialize the numberOfInputs property to. Defaults to 1.
numberOfOutputs Optional
    The value to initialize the numberOfOutputs property to. Defaults to 1.
outputChannelCount Optional
    An array defining the number of channels for each output. For example, outputChannelCount: [n, m] specifies the number of channels in the first output to be n and the second output to be m. The array length must match numberOfOutputs.
parameterData Optional
    An object containing the initial values of custom AudioParam objects on this node (in its parameters property), with key being the name of a custom parameter and value being its initial value.
processorOptions Optional
    Any additional data that can be used for custom initialization of the underlying AudioWorkletProcessor.
*/

/*
    no inputs
    two outputs:
        - signal
            one channel
        - sync
            two channels:
                - frequency
                - phase
*/

const workletOptions = {
    numberOfInputs: 1,
    numberOfOutputs: 2,
    outputChannelCount: [1, 2]
};

class SequencerWorkletNode extends audioWorkletNode {
    constructor (context) {
        super(context, "sequencer-worklet-processor", workletOptions);
    }

    get frequency () {
        return this.parameters.get("frequency");
    }

    set frequency (freq) {
        this.parameters.get("frequency").value = freq;
    }

    set sampleRate (sampleRate) {
        this.port.postMessage(JSON.stringify({"command": "sampleRate", "message": sampleRate}));
    }

    set speedUnit (speedUnit) {
        this.port.postMessage(JSON.stringify({"command": "speedUnit", "message": speedUnit}));
    }

    set sequence (sequence) {
        this.port.postMessage(JSON.stringify({"command": "setSequence", "message": sequence}));
    }

    set maxValue (value) {
        this.port.postMessage(JSON.stringify({"command": "setMaxValue", "message": value}));
    }

    set sync (sync) {
        this.port.postMessage(JSON.stringify({"command": "sync", "message": sync}));
    }

    set glide (glide) {
        this.port.postMessage(JSON.stringify({"command": "glide", "message": glide}));
    }

    start () {
        this.port.postMessage(JSON.stringify({"command": "start"}));
    }

    pause () {
        this.port.postMessage(JSON.stringify({"command": "pause"}));
    }

    stop () {
        this.port.postMessage(JSON.stringify({"command": "stop"}));
    }

    destroy () {
        this.port.postMessage(JSON.stringify({"command": "destroy"}));
    }
}

export default SequencerWorkletNode;
