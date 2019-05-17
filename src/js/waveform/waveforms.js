import {DOUBLE_PI} from "../constants";

export const wrappers = {
    sync: () => () => 1,

    saw: () => (phase) => 1 - (phase % 1),

    halfSinus: () => (phase) => Math.sin(phase * Math.PI),

    gaussian: ({mu = 0.5, sig = 0.1} = {}) => {
        const twoSigSquared = 2 * Math.pow(sig, 2);
        const muSquared = mu * mu;

        return (phase) => Math.exp(-(muSquared - (2 * mu * phase) + (phase * phase)) / twoSigSquared);
    }
};

const NUMBER_REGEX = /^(\d*)(?:[.,]?(\d*))?$/g;

const parseFloatRadix = (str, radix = 10) => {
    let result = 0;
    const match = NUMBER_REGEX.exec(str);
    if (match) {
        const intPart = match[1];
        const decimalPart = match[2];

        if (typeof intPart === "string") {
            result += parseInt(intPart, radix);
        }

        if (typeof decimalPart === "string") {
            result += (parseInt(decimalPart, radix) / Math.pow(radix, decimalPart.length));
        }
    }

    return result;
};

export const waveforms = {
    zero: () => () => 0,

    sinus: () => (phase) => Math.sin(phase * DOUBLE_PI),


    cycloid: () => (phase) => {
        const radPhase = phase * Math.PI / 2;
        return Math.acos(1 - radPhase) - Math.sqrt(2 * radPhase - Math.pow(radPhase, 2)) * 2 - 0.5;
    },

    square: () => (phase) => ((phase % 1) > 0.5) ? -1 : 1,

    additiveSquare: ({maxHarmonic = 8} = {}) => (phase, param1 = maxHarmonic) => {
        let value = 0;

        for (let i = 1; i < param1; i += 2) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
        }

        const decimalPart = param1 % 1;
        if (decimalPart !== 0) {
            const harmonic = Math.floor(param1) + 2;
            value += Math.sin(phase * DOUBLE_PI * harmonic) / harmonic * decimalPart;
        }


        return value * (4 / Math.PI);
    },

    saw: () => (phase) => ((phase % 1) - 0.5) * 2,

    additiveSaw: ({maxHarmonic = 8} = {}) => (phase, param1 = maxHarmonic) => {
        let value = 0;

        for (let i = 1; i < param1; i += 1) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
        }
        const decimalPart = param1 % 1;
        if (decimalPart !== 0) {
            const harmonic = Math.floor(param1) + 1;
            value += Math.sin(phase * DOUBLE_PI * harmonic) / harmonic * decimalPart;
        }

        return value * (2 / Math.PI);
    },

    saw_inverse: () => (phase) => 1 - ((phase % 1) * 2),

    triangle: () => (phase) => {
        const p = phase % 1;

        if (p < 0.25) {
            return p * 4;
        } else if (p < 0.75) {
            return (p - 0.5) * -4;
        }
        return (p - 1) * 4;
    },

    additiveTriangle: ({maxHarmonic = 5} = {}) => (phase, param1 = maxHarmonic) => {
        let odd = true,
            value = 0;

        for (let i = 1; i < param1; i += 2) {
            const partial = Math.sin(phase * DOUBLE_PI * i) / (i * i);
            value += odd ? partial : -partial;
            odd = !odd;
        }

        const decimalPart = param1 % 1;
        if (decimalPart !== 0) {
            const harmonic = Math.floor(param1) + 1;
            const partial = Math.sin(phase * DOUBLE_PI * harmonic) / (harmonic * harmonic) * decimalPart;
            value += odd ? partial : -partial;
        }

        return value * (8 / Math.pow(Math.PI, 2));
    },

    cantorSet: (params = {}) => {
        const {
            depth = 1.5,
            pattern = [1, 0, 1]
        } = params;

        return (phase, param1 = depth) => {
            let steps = pattern.length;

            for (let level = 1; level < param1 + 1; level += 1) {
                const step = Math.floor(phase * steps) % pattern.length;

                if (pattern[step] === 0) {
                    if (level > param1) {
                        return -1 + (param1 % 1) * 2;
                    }

                    return -1;
                }
                steps *= pattern.length;
            }
            return 1;
        };
    },

    cantorFunction: () => (phase) => {
        let base3 = phase.toString(3);
        const firstOne = base3.indexOf("1");

        if (firstOne !== -1) {
            base3 = base3.replace(/^([0-9.,]*?1).*$/, "$1");
        }
        base3 = base3.replace(/2/g, "1");

        return (parseFloatRadix(base3, 2) - 0.5) * 2;
    },

    minkowskiQuestionMark: () => (phase) => {
        // c implementation rewritten to JavaScript
        // c source: https://gist.github.com/pallas/5565556

        const a0 = Math.floor(phase);

        let sum_a = 1;
        let add_term = true;
        let sum_terms = 0.0;

        for (let t = phase - a0;;) {
            const tInverse = 1.0 / t;

            let a = Math.trunc(tInverse);
            t = tInverse % 1;
            sum_a -= a;
            const term = Math.pow(2, sum_a);

            if (!Number.isFinite(term) || term < Number.MIN_VALUE) {
                break;
            }

            sum_terms += add_term ? term : -term;
            add_term = !add_term;
        }

        return (a0 + sum_terms - phase) * 5;
    },

    sampleAndHold: ({steps = 2} = {}) => {
        const buffer = {};
        const fraction = 1 / steps;

        return (phase) => {

            if (!buffer.hasOwnProperty("value") || buffer.value === null) {
                buffer.value = (Math.random() - 0.5) * 2;
            }

            if (Math.ceil(phase / fraction) > Math.ceil(buffer.phase / fraction)) {
                buffer.value = (Math.random() - 0.5) * 2;
            }

            buffer.phase = phase % 1;

            return buffer.value;
        };
    }
};

/*
const sineSum = (min, max, weightFn = () => 1) => {
    const numberOfPartials = Math.ceil(Math.log(max - min) / Math.log(2));
    // make [weight, phaseOffset] pairs
    const partials = (new Array(numberOfPartials).fill(0)).map((part, index) => [weightFn(index), Math.random() * DOUBLE_PI]);
    const sumOfWeights = partials.reduce((acc, curr) => acc + curr[0], 0);
    let phase = 0;

    return () => {
        phase += 1;
        return partials.reduce((acc, partial, index) => (acc + Math.sin((phase * (1 << index)) + partial[1]) * partial[0]), 0) / sumOfWeights;
    };
};
*/
