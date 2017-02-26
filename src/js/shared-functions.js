import {MORSE_CODE} from "./constants";

export const mixValues = (source1, source2, ratio) => source1 * (1 - ratio) + source2 * ratio;

export const vectorToLinearFunction = (vector) => {
    const rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    const constant = vector[0][1] - (rate * vector[0][0]);
    return (phase) => (phase * rate) + constant;
};

export const phaseDistortionFunction = (envelope) => {
    if (!envelope || envelope.length < 2) {
        throw new Error("invalid phase distortion data");
    }

    const functions = [];
    for (let i = 1; i < envelope.length; i += 1) {
        functions[i - 1] = {
            from: envelope[i - 1][0],
            to: envelope[i][0],
            fn: vectorToLinearFunction([envelope[i - 1], envelope[i]])
        };
    }

    return (phase) => {
        const p = phase % 1;
        return functions.find(f => (p >= f.from && p < f.to)).fn(p);
    };
};

export const getDistortedPhase = (phase, envelope) => phaseDistortionFunction(envelope)(phase);


export const inputNode = (context) => {
    const node = context.createGain();
    node.gain.value = 0;
    node.gain.setValueAtTime(1, context.currentTime);

    return node;
};

export const outputNode = (context, dc, value) => {
    const node = context.createGain();
    node.gain.value = 0;
    node.gain.setValueAtTime(value, context.currentTime);
    dc.connect(node);

    return node;
};

export class ParamLogger {
    constructor (parameter, context, label, time = 1000) {
        this.logger = context.createScriptProcessor(512, 1, 1);
        this.logger.onaudioprocess = (evt) => {
            if (!this.justLogged) {
                const result = {};
                evt.inputBuffer.getChannelData(0).map((val) => {
                    if (result[val]) {
                        result[val] += 1;
                    } else {
                        result[val] = 1;
                    }
                });

                /* eslint-disable no-console */
                console.log(label ? label : "", result);
                /* eslint-enable no-console */

                this.justLogged = true;
                this.timer = setTimeout(() => {
                    this.justLogged = false;
                }, time);
            }
        };
        parameter.connect(this.logger);
        this.logger.connect(context.destination);
    }

    disconnect () {
        this.logger.onaudioprocess = null;
        this.logger.disconnect();
    }

    destroy () {
        clearTimeout(this.timer);
        this.logger = null;
    }
}

export const splicedArrayCopy = (arr, index, deleteCount, ...newContent) => {
    const result = [...arr];
    result.splice(index, deleteCount, ...newContent);
    return result;
};

export const morseEncode = (text) => {
    return text.toLowerCase()
        .replace(/ch/, "C")
        .split("")
        .map(char => (MORSE_CODE[char] || "").split("").join(" "))
        .map(sequence => sequence.replace(/\./g, "1").replace(/-/g, "111"))
        .join("   ").split("").map(p => p === "1");
};
