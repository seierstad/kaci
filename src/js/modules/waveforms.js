const DOUBLE_PI = require("./constants").DOUBLE_PI;

export const wrappers = {
    sync: function () {
        return 1;
    },
    saw: function (phase) {
        return 1 - (phase % 1);
    },
    halfSinus: function (phase) {
        return Math.sin(phase * Math.PI);
    },
    gaussian: function () {
        // dummy function to be replaced by constructor
        // added for static enumeration purposes
    }
};

export const waveforms = {
    zero: function zero () {
        return 0;
    },
    sinus: function sinus (phase) {
        return Math.sin(phase * DOUBLE_PI);
    },
    square: function square (phase) {
        if ((phase % 1) > 0.5) {
            return -1;
        }
        return 1;
    },
    additiveSquare: function additiveSquare (phase, maxHarmonic) {
        const h = maxHarmonic || 8;
        let value = 0;

        for (let i = 1; i < h; i += 2) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
        }

        return value * (4 / Math.PI);
    },
    saw: function saw (phase) {
        return ((phase % 1) - 0.5) * 2;
    },
    additiveSaw: function additiveSaw (phase, maxHarmonic) {
        const h = maxHarmonic || 8;
        let value = 0;

        for (let i = 1; i < h; i += 1) {
            value += Math.sin(phase * DOUBLE_PI * i) / i;
        }

        return value * (2 / Math.PI);
    },

    saw_inverse: function saw_inverse (phase) {
        return 1 - ((phase % 1) * 2);
    },

    triangle: function triangle (phase) {
        const p = phase % 1;

        if (p < 0.25) {
            return p * 4;
        } else if (p < 0.75) {
            return (p - 0.5) * -4;
        }
        return (p - 1) * 4;
    },

    additiveTriangle: function additiveTriangle (phase, maxHarmonic) {
        const h = maxHarmonic || 5;
        let odd = true,
            value = 0;

        for (let i = 1; i < h; i += 2) {
            if (odd) {
                value += Math.sin(phase * DOUBLE_PI * i) / (i * i);
            } else {
                value -= Math.sin(phase * DOUBLE_PI * i) / (i * i);
            }
            odd = !odd;
        }
        return value * (8 / Math.pow(Math.PI, 2));
    },

    sampleAndHold: function sampleAndHold (phase, buffer, steps) {
        const s = steps || 2;
        const fraction = 1 / s;

        if (!buffer.hasOwnProperty("value") || buffer.value === null) {
            buffer.value = (Math.random() - 0.5) * 2;
        }
        if (Math.ceil(phase / fraction) > Math.ceil(buffer.phase / fraction)) {
            buffer.value = (Math.random() - 0.5) * 2;
        }
        buffer.phase = phase % 1;
        return buffer.value;
    }
};