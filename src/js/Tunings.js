/*global require, module, document */
"use strict";

// TODO: experiment with scales where base = the golden ratio, pi, e etc...

const scales = {
    pythagorean: [(1 / 1), (256 / 243), (9 / 8), (32 / 27), (81 / 64), (4 / 3), (729 / 512), (3 / 2), (128 / 81), (27 / 16), (16 / 9), (243 / 128), (2 / 1)],
    experimental: [(1 / 1), (7 / 6), (4 / 3), (3 / 2), (7 / 4), (31 / 16), (2 / 1)],
    halvannen: [(1 / 1), (5 / 4), (3 / 2)]
};

const getTemperedScale = function (fromKey, toKey, referenceKey, referenceFrequency, steps = 12, base = 2) {
    const scale = [];

    for (let i = fromKey, j = toKey; i < j; i += 1) {
        const keyOffset = i - referenceKey;
        scale[i] = referenceFrequency * Math.pow(base, keyOffset / steps);
    }

    return scale;
};

const getScale = function (intervals) {
    let base = intervals.pop();

    return function (fromKey, toKey, referenceKey, referenceFrequency) {
        const scale = [];

        for (let i = fromKey, j = toKey; i < j; i += 1) {
            const keyOffset = i - referenceKey;
            let index = keyOffset % intervals.length;
            if (index < 0) {
                index += intervals.length;
            }
            scale[i] = referenceFrequency * Math.pow(base, Math.floor(keyOffset / intervals.length)) * intervals[index];
        }
        return scale;
    };
};


export default {
    getTemperedScale: getTemperedScale,
    getPythagoreanScale: getScale(scales.pythagorean),
    getExperimentalScale: getScale(scales.experimental),
    getHalvannenScale: getScale(scales.halvannen)
};
