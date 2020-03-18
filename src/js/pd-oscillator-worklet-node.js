// The code in the main global scope.
class PDOscillatorWorkletNode extends AudioWorkletNode {
    constructor (context) {
        super(context, "pd-oscillator-worklet-processor");
    }
}
