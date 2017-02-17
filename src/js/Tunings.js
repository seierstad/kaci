// TODO: experiment with scales where base = the golden ratio, pi, e etc...
import {SCALES} from "./configuration";


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
    getPythagoreanScale: getScale(SCALES.pythagorean),
    getExperimentalScale: getScale(SCALES.experimental),
    getHalvannenScale: getScale(SCALES.halvannen)
};
