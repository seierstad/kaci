const audioWorkletNode = (typeof AudioWorkletNode === "undefined" ? Object : AudioWorkletNode);

class OscillatorWorkletNode extends audioWorkletNode {
    constructor (context) {
        super(context, "oscillator-worklet-processor");
    }

    get frequency () {
        return this.parameters.get("frequency");
    }

    set frequency (freq) {
        this.parameters.get("frequency").value = freq;
    }

    get detune () {
        return this.parameters.get("detune");
    }

    set detune (cents) {
        this.parameters.get("detune").value = cents;
    }

    set waveform (waveformName) {
        this.port.postMessage(JSON.stringify({"waveform": waveformName}));
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

export default OscillatorWorkletNode;
