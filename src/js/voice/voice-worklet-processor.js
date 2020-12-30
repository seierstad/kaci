// This is "processor.js" file, evaluated in AudioWorkletGlobalScope upon
// audioWorklet.addModule() call in the main global scope.
class VoiceProcessor extends AudioWorkletProcessor {
    constructor () {
        super();
    }

    process (inputs, outputs, parameters) {
    // audio processing code here.
    }
}

registerProcessor("voice-processor", VoiceProcessor);
