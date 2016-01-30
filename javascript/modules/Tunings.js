/*global require, module, document */
"use strict";

// TODO: experiment with scales where base = the golden ratio, pi, e etc...
var scales,
    getTemperedScale,
    getScale;

scales = {
    pythagorean: [(1 / 1), (256 / 243), (9 / 8), (32 / 27), (81 / 64), (4 / 3), (729 / 512), (3 / 2), (128 / 81), (27 / 16), (16 / 9), (243 / 128), (2 / 1)],
    experimental: [(1 / 1), (7 / 6), (4 / 3), (3 / 2), (7 / 4), (31 / 16), (2 / 1)],
    halvannen: [(1 / 1), (5 / 4), (3 / 2)]
};
getTemperedScale = function (fromKey, toKey, referenceKey, referenceFrequency, steps, base) {
    var i, j, scale = [],
        keyOffset,
        s = steps || 12,
        b = base || 2;

    for (i = fromKey, j = toKey; i < j; i += 1) {
        keyOffset = i - referenceKey;
        scale[i] = referenceFrequency * Math.pow(b, keyOffset / s);
    }
    return scale;
};

getScale = function (intervals) {
    var base = intervals.pop();

    return function (fromKey, toKey, referenceKey, referenceFrequency) {
        var i, j, scale = [],
            keyOffset, index;

        for (i = fromKey, j = toKey; i < j; i += 1) {
            keyOffset = i - referenceKey;
            index = keyOffset % intervals.length;
            if (index < 0) {
                index += intervals.length;
            }
            scale[i] = referenceFrequency * Math.pow(base, Math.floor(keyOffset / intervals.length)) * intervals[index];
        }
        return scale;
    };
};
module.exports = {
    getTemperedScale: getTemperedScale,
    getPythagoreanScale: getScale(scales.pythagorean),
    getExperimentalScale: getScale(scales.experimental),
    getHalvannenScale: getScale(scales.halvannen)
};