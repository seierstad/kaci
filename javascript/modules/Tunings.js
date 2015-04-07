/*global require, module, document */

var getTemperedScale = function (fromKey, toKey, referenceKey, referenceFrequency) {
    var i, j, scale = [],
        keyOffset;

    for (i = fromKey, j = toKey; i < j; i += 1) {
        keyOffset = i - referenceKey;
        scale[i] = referenceFrequency * Math.pow(2, keyOffset / 12);
    }
    return scale;
};

var getPythagoreanScale = function (fromKey, toKey, referenceKey, referenceFrequency) {
    var i, j, scale = [],
        keyOffset,
        intervals = [(1 / 1), (256 / 243), (9 / 8), (32 / 27), (81 / 64), (4 / 3), (729 / 512), (3 / 2), (128 / 81), (27 / 16), (16 / 9), (243 / 128), (2 / 1)];

    for (i = fromKey, j = toKey; i < j; i += 1) {
        keyOffset = i - referenceKey;
        scale[i] = referenceFrequency * Math.pow(2, keyOffset / 12);
    }
    return scale;
};

module.exports = {
    getTemperedScale: getTemperedScale
};
