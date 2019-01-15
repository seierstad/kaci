// The code in the main global scope.

const audioWorkletNode = (typeof AudioWorkletNode === "undefined" ? Object : AudioWorkletNode);

export default class NoiseWorkletNode extends audioWorkletNode {
    constructor (context) {
        super(context, "noise-worklet-processor");
    }
}
