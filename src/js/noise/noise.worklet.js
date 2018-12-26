import autobind from "autobind-decorator";
import noise from "./noise";

class NoiseProcessor extends AudioWorkletProcessor {

    // Static getter to define AudioParam objects in this custom processor.
    static get parameterDescriptors () {
        return [{
            name: "myParam",
            defaultValue: 0.707
        }];
    }


    constructor () {
        super();
        this.stopped = false;

        // initialize with silence generator
        this.generatorFunction = (outputBuffer) => outputBuffer.forEach((val, index, arr) => arr[index] = 0);

        this.port.onmessage = this.messageHandler;

    }

    @autobind
    messageHandler (event) {
        const {
            color
        } = JSON.parse(event.data);

        if (color && typeof noise[color] === "function") {
            this.generatorFunction = noise[color]();
        }
    }

    process (inputs, outputs, parameters) {
        const outputChannel = outputs[0][0];

        this.generatorFunction(outputChannel);

        return !this.stopped;
    }
}


registerProcessor("noise-worklet-processor", NoiseProcessor);

