const audioWorkletNode = (typeof AudioWorkletNode === "undefined" ? Object : AudioWorkletNode);

class VoiceWorkletNode extends audioWorkletNode {
    constructor (context) {
        super(context, "voice-processor");
    }
}
