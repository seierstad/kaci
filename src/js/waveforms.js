import {DOUBLE_PI} from "./constants";

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

export const waveforms = {
    zero: () => () => 0,

    sinus: () => (phase) => Math.sin(phase * DOUBLE_PI),

    square: () => (phase) => ((phase % 1) > 0.5) ? -1 : 1,

    additiveSquare: ({maxHarmonic = 8} = {}) => (phase) => {
        let value = 0;

        for (let i = 1; i < maxHarmonic; i += 2) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
        }

        return value * (4 / Math.PI);
    },

    saw: () => (phase) => ((phase % 1) - 0.5) * 2,

    additiveSaw: ({maxHarmonic = 8} = {}) => (phase) => {
        let value = 0;

        for (let i = 1; i < maxHarmonic; i += 1) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
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

    additiveTriangle: ({maxHarmonic = 5} = {}) => (phase) => {
        let odd = true,
            value = 0;

        for (let i = 1; i < maxHarmonic; i += 2) {
            if (odd) {
                value += Math.sin(phase * DOUBLE_PI * i) / (i * i);
            } else {
                value -= Math.sin(phase * DOUBLE_PI * i) / (i * i);
            }
            odd = !odd;
        }
        return value * (8 / Math.pow(Math.PI, 2));
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

const trailingZeros = (size) => {

    const MASK = (1 << size + 1) - 1;

    return (number) => {
        if ((number & MASK) === 0) {
            return size;
        }

        let zeros = 1;

        while ((MASK & number) === ((MASK << zeros) & number)) {
            zeros += 1;
        }

        return zeros - 1;
    };
};

export const noise = {
    "white": () => (buffer) => {
        buffer.forEach((val, index, arr) => arr[index] = Math.random() * 2 - 1);
    },

    "pink": (resolution = 8) => {
        const values = new Float32Array(resolution);
        values.forEach((v, index, arr) => arr[index] = Math.random() * 2);

        const getIndex = trailingZeros(resolution);

        let sum = values.reduce((acc, current) => acc + current);
        let maxPosition = (1 << resolution) - 1;
        let position = 1;

        const pinkSum = (v, i, output) => {
            const index = getIndex(position);
            const prev = values[index];
            const curr = Math.random() * 2;
            values[index] = curr;
            sum += (curr - prev);

            position = (position % maxPosition) + 1;

            output[i] = (sum / resolution) - 1;
        };

        return (buffer) => {
            buffer.forEach(pinkSum);
        };
    }
};
