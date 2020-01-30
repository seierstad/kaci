import {DOUBLE_PI, TRIPLE_PI, SINC_EXTREMA} from "../constants";

//import {getScale} from "../shared-functions";

const scale = (value, min, max, diff = max - min) => {
    return min + value * diff;
};

export const fourierSeries = {
    saw: (partials = 8) => {
        const result = Array(partials).fill(0);
        for (let p = 1; p <= partials; p += 1) {
            result[p] = 1 / p;
        }
        return result;
    },

    square: (partials = 8) => {
        const result = Array(partials * 2).fill(0);
        for (let p = 1, q = partials * 2; p <= q; p += 2) {
            result[p] = 1 / p;
        }
        return result;
    },

    triangle: (partials = 8) => {
        const result = Array(partials * 2).fill(0);
        for (let odd = true, p = 1, q = partials * 2; p <= q; p += 2, odd = !odd) {
            result[p] = (odd ? 1 : -1) / (p * p);
        }
        return result;
    }
};


export const wrappers = {
    sync: (defaultLength = 1) => (phase, length = defaultLength) => phase < length ? 1: 0,

    saw: (expDefault = 1) => {
        const expMin = 1/8;
        const expMax = 4;
        const expDiff = expMax - expMin;

        return (phase, exp = expDefault) => Math.pow(1 - (phase % 1), expMin + (1 - exp) * expDiff);
    },

    halfSinus: () => (phase) => Math.sin(phase * Math.PI),

    gaussian: (sigDefault = 0.1, mu = 0.5) => {
        const muSquared = mu * mu;
        const sigMax = 0.25;
        const sigMin = 0.05;

        return (phase, sig = sigDefault) => {
            const scaledSig = (sigMax - sigMin) * sig + sigMin;
            const twoSigSquared = 2 * scaledSig * scaledSig;

            return Math.exp(-(muSquared - (2 * mu * phase) + (phase * phase)) / twoSigSquared);
        };
    },

    mexican: (sigDefault = 0.1) => {
        const sigMin = 0.05;
        const sigMax = 0.25;
        const sigDiff = sigMax - sigMin;

        const min = 0;
        const max = 1;
        const diff = max - min;

        const twoDivByPiToOneQuarter = 2 / Math.pow(Math.PI, 0.25);

        return (phase, sig = sigDefault) => {
            const x = 2 * ((phase % 1) - 0.5) * scale(1 - length, min, max, diff);
            const scaledSig = scale(sig, sigMin, sigMax, sigDiff);

            const twoSigSquared = 2 * scaledSig * scaledSig;
            const firstFactor = twoDivByPiToOneQuarter / (Math.sqrt(3 * scaledSig));
            const secondFactor = 1 - Math.pow(x / scaledSig, 2);
            const thirdFactor = Math.pow(Math.E, -x * x / twoSigSquared);

            return firstFactor * secondFactor * thirdFactor;
        };
    },

    blackman: (defaultLength = 0) => {
        // Blackman window, variable between 1/4 and 1/1 width
        const min = 0.25;
        const max = 1;
        const diff = max - min;
        const QUADRUPLE_PI = DOUBLE_PI * 2;

        return (phase, param = defaultLength) => {
            const length = scale(param, min, max, diff);
            const pl = phase / length;
            return (phase >= length) ? 0 : 0.42 - 0.5 * Math.cos(DOUBLE_PI * pl) + 0.08 * Math.cos(QUADRUPLE_PI * pl);
        };

    },

    sinc: (defaultLength = 0) => {
        const min = Math.PI;
        const max = Math.PI * 5;
        const diff = max - min;

        return (phase, length = defaultLength) => {
            const x = 2 * ((phase % 1) - 0.5) * scale(1 - length, min, max, diff);
            return Math.sin(x) / x;
        };
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

    triangle: (shape = 0.5) => (phase, param1 = shape) => {
        const p = phase % 1;
        const halfShape = param1 / 2;
        const riseFactor = 1 / halfShape;
        const fallFactor = 1 / (0.5 - halfShape);

        if (p < halfShape) {
            return p * riseFactor;
        } else if (p < 1 - halfShape) {
            return (p - 0.5) * -fallFactor;
        }
        return (p - 1) * riseFactor;
    },

    square: (pulseWidth = 0.2) => (phase, param1 = pulseWidth) => ((phase % 1) > (param1 % 1)) ? -1 : 1,

    sampleAndHold: ({steps = 2} = {}) => {
        const buffer = {};
        const fraction = 1 / steps;

        return (phase) => {

            if (!Object.prototype.hasOwnProperty.call(buffer, "value") || buffer.value === null) {
                buffer.value = (Math.random() - 0.5) * 2;
            }

            if (Math.ceil(phase / fraction) > Math.ceil(buffer.phase / fraction)) {
                buffer.value = (Math.random() - 0.5) * 2;
            }

            buffer.phase = phase % 1;

            return buffer.value;
        };
    },

    additiveTriangle: (defaultParam = 1) => {
        const max = 20;
        const min = 2;
        const diff = max - min;

        return (phase, param = defaultParam) => {
            let odd = true,
                value = 0;

            const maxHarmonic = scale(param, min, max, diff);

            for (let i = 1; i < maxHarmonic; i += 2) {
                const partial = Math.sin(phase * DOUBLE_PI * i) / (i * i);
                value += odd ? partial : -partial;
                odd = !odd;
            }

            const decimalPart = maxHarmonic % 1;
            if (decimalPart !== 0) {
                const harmonic = Math.floor(maxHarmonic) + 1;
                const partial = Math.sin(phase * DOUBLE_PI * harmonic) / (harmonic * harmonic) * decimalPart;
                value += odd ? partial : -partial;
            }

            return value * (8 / Math.pow(Math.PI, 2));
        };
    },

    additiveSaw: (defaultParam = 0.5) => {
        const max = 20;
        const min = 2;
        const diff = max - min;

        return (phase, param = defaultParam) => {
            let value = 0;

            const maxHarmonic = scale(param, min, max, diff);

            let i;
            for (i = 1; i <= maxHarmonic; i += 1) {
                value += Math.sin(phase * DOUBLE_PI * i) / i;
            }
            const decimalPart = maxHarmonic % 1;
            if (decimalPart !== 0) {
                const harmonic = Math.floor(maxHarmonic) + 1;
                value += Math.sin(phase * DOUBLE_PI * harmonic) / harmonic * decimalPart;
            }

            return value * (2 / Math.PI);
        };
    },

    additiveSquare: (defaultParam = 0.5) => {
        const max = 20;
        const min = 2;
        const diff = max - min;

        return (phase, param = defaultParam) => {
            let value = 0;

            const maxHarmonic = scale(param, min, max, diff);

            for (let i = 1; i < maxHarmonic; i += 2) {
                value += Math.sin(phase * DOUBLE_PI * i) / i;
            }

            const decimalPart = (maxHarmonic + 1) % 2;
            if (decimalPart !== 0) {
                const harmonic = maxHarmonic - decimalPart + 2;
                value += Math.sin(phase * DOUBLE_PI * harmonic) / harmonic * decimalPart / 2;
            }


            return value * (4 / Math.PI);
        };
    },

    clausen: (defaultParam = 0) => {
        const min = 1;
        const max = 4;
        const diff = max - min;
        const iterations = 20;

        return (phase, param = defaultParam) => {
            const order = scale(param, min, max, diff);

            let value = 0;
            for (let i = 1; i < iterations; i += 1) {
                value += Math.sin(phase * i * DOUBLE_PI) / Math.pow(i, order);
            }
            return value;
        };
    },

    cantorSet: (depth = 1, pattern = [1, 0, 1]) => {
        const maxIterations = 5;

        return (phase, param1 = depth) => {
            const iterationCount = maxIterations * param1;
            let steps = pattern.length;

            for (let level = 1; level < iterationCount + 1; level += 1) {
                const step = Math.floor(phase * steps) % pattern.length;

                if (pattern[step] === 0) {
                    if (level > iterationCount) {
                        return 1 - (iterationCount % 1) * 2;
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

    mexican: (sigDefault = 0.5) => {
        const sigMin = 0.75;
        const sigMax = 2;
        const sigDiff = sigMax - sigMin;

        const max = 7.5;

        const twoDivByPiToOneQuarter = 2 / Math.pow(Math.PI, 0.25);

        return (phase, sig = sigDefault) => {
            const x = 2 * ((phase % 1) - 0.5) * max;
            const scaledSig = scale(1 - sig, sigMin, sigMax, sigDiff);

            const twoSigSquared = 2 * scaledSig * scaledSig;
            const firstFactor = twoDivByPiToOneQuarter / (Math.sqrt(3 * scaledSig));
            const secondFactor = 1 - Math.pow(x / scaledSig, 2);
            const thirdFactor = Math.pow(Math.E, -x * x / twoSigSquared);

            return firstFactor * secondFactor * thirdFactor;
        };
    },

    sinc: (defaultLength = 0) => {
        const min = SINC_EXTREMA[1];
        const max = SINC_EXTREMA[6];
        const diff = max - min;

        return (phase, length = defaultLength) => {
            const x = 2 * ((phase % 1) - 0.5) * scale(length, min, max, diff);
            return Math.sin(x) / x;
        };
    },

    shannon_wavelet: (defaultParam = 0) => {
        const min = 3;
        const max = 12;
        const diff = max - min;

        const threePiHalves = TRIPLE_PI / 2;
        const halfPi = Math.PI / 2;

        return (phase, param = defaultParam) => {
            const x = 2 * ((phase % 1) - 0.5) * scale(param, min, max, diff);
            const y = halfPi * x;
            return Math.sin(y) / y * Math.cos(threePiHalves * x);
        };

    },

    /*
    shannon_scale: () => {
        const max = 5;
        return phase => {
            const x = 2 * ((phase % 1) - 0.5) * max;
            return Math.pow(Math.PI * x, -1) * Math.sin(Math.PI * x);
        };
    },
    */

    cycloid: () => (phase) => {
        const radPhase = phase * Math.PI / 2;
        return Math.acos(1 - radPhase) - Math.sqrt(2 * radPhase - Math.pow(radPhase, 2)) * 2 - 0.5;
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
