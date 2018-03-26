import autobind from "autobind-decorator";

import {BUFFER_LENGTH} from "./constants";


class LoggerNode {
    constructor (context, interval = 1000, peaks = false, lows = false) {
        this.interval = interval;
        this.logPeaks = peaks;
        this.logLows = lows;

        this.counter = 0;
        this.previousValues = [0, 0];
        this.init = true;

        this.audioProcessHandler = (event) => {
            const inputBuffer = event.inputBuffer.getChannelData(0);
            const outputBuffer = event.outputBuffer.getChannelData(0);

            if (this.init) {
                console.log("logger started");
                this.init = false;
            }

            inputBuffer.forEach((value, index) => {
                if (this.counter === this.interval) {
                    this.counter = 0;
                    console.log("logger value: ", value);
                }
                if (this.logLows && (this.previousValues[0] <= this.previousValues[1] && value > this.previousValues)) {
                    console.log("up from: ", this.previousValues);
                }

                if (this.logPeaks && (this.previousValues[0] >= this.previousValues[1] && value < this.previousValues)) {
                    console.log("down from: ", this.previousValues);
                }

                this.previousValues[1] = this.previousValues[0];
                this.previousValues[0] = value;
                this.counter += 1;
                outputBuffer[index] = value;
            });
        };

        this.logger = context.createScriptProcessor(BUFFER_LENGTH, 1, 1);
        this.logger.addEventListener("audioprocess", this.audioProcessHandler);

        console.log("created logger");
        return this.logger;
    }
}


export default LoggerNode;

/*
    if (this.loggerCounter === 10000) {
        console.log(calculatedFrequency);
        this.loggerCounter = 0;
    }
    this.loggerCounter += 1;
*/
