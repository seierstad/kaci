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

export const morseEncode = (text = "") => {
    return text.toLowerCase()
        .replace(/ch/, "C")
        .split("")
        .map(char => (MORSE_CODE[char] || "").split("").join(" "))
        .map(sequence => sequence.replace(/\./g, "1").replace(/-/g, "111"))
        .join("   ").split("").map(p => p === "1");
};

export const padPattern = (pattern, padding = 0) => {
    if (padding === 0) {
        return pattern;
    }
    if (padding < 0) {
        return pattern.slice(0, pattern.length + padding - 1);
    }

    const pad = new Array(padding);
    pad.fill(false);
    return [...pattern, ...pad];
};

export const shiftPattern = (pattern, shift = 0) => {
    if (shift === 0) {
        return pattern;
    }
    return [
        ...pattern.slice(-shift),
        ...pattern.slice(0, -shift)
    ];
};

export const fillPatternToMultipleOf = (pattern, number) => {
    const remainder = pattern.length % number;
    const count = (remainder === 0) ? 0 : number - remainder;

    return padPattern(pattern, count);
};

export const gcd = (a, b) => !b ? a : gcd(b, a % b);
export const lcm = (a, b) => (a * b) / gcd(a, b);
export const lcmReducer = (accumulator, current) => lcm(current, accumulator);

// find the least integer divisible by all fractions
export const fractionsLcm = (fractions) => fractions.map(f => {
    const max = Math.max(f.numerator, f.denominator);
    if (f.denominator === 1) {
        return 1;
    }
    if (f.numerator === 1) {
        return max;
    }
    return max / gcd(f.numerator, f.denominator);
}).reduce(lcmReducer, 1);

export const factors = (number, min = 2) => {
    const half = number / 2;

    for (let i = min; i < half; i += 1) {
        if (number % i === 0) {
            return [i, ...factors(number / i, i)];
        }
    }

    return [number];
};

export const divisors = (number, limit) => {
    const sqr = Math.sqrt(number);
    const result = [];

    for (let i = 1; i < sqr; i += 1) {
        if (number % i === 0) {
            result.push(i);
            result.push(number / i);
        }
    }

    if ((sqr | 0) === sqr) {
        result.push(sqr);
    }

    return result;
};
