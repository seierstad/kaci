export const getTemperedScale = function (fromKey, toKey, referenceKey, referenceFrequency, steps = 12, base = 2) {
    const scale = [];

    for (let i = fromKey, j = toKey; i < j; i += 1) {
        const keyOffset = i - referenceKey;
        scale[i] = referenceFrequency * Math.pow(base, keyOffset / steps);
    }

    return scale;
};

/*
export const scaleRatios = function (base, numerator, denominator) {
    return noteNumber => {

        let t = Math.pow(numerator, noteNumber);
        let n = Math.pow(denominator, noteNumber);

        const r = Math.pow(numerator / denominator, noteNumber);

        if (r > base || r < 1) {
            const f = Math.log(r) / Math.log(base);

            if (r < 1) {
                t *= Math.pow(base, -Math.trunc(f));
            } else {
                n *= Math.pow(base, Math.trunc(f));
            }
        }
        // console.log("t:", t, "n: ", n, "r: ", t/n);
    };
};
*/

export const getRationalScale = function (intervals) {
    let base = intervals.pop();

    return function (fromKey, toKey, referenceKey, referenceFrequency) {
        const scale = [];
        const baseRatio = base[0] / base[1];

        for (let i = fromKey, j = toKey; i < j; i += 1) {
            const keyOffset = i - referenceKey;
            let index = keyOffset % intervals.length;
            if (index < 0) {
                index += intervals.length;
            }
            const [numerator, denominator] = intervals[index];
            scale[i] = referenceFrequency * Math.pow(baseRatio, Math.floor(keyOffset / intervals.length)) * (numerator / denominator);
        }

        return scale;
    };
};

export default {
    getTemperedScale,
    getRationalScale
};