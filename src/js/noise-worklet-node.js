// The code in the main global scope.
export default class NoiseWorkletNode extends AudioWorkletNode {
  constructor(context) {
    super(context, "noise-worklet-processor");
  }
}
