"use strict";

const flattenWavetable = (wavetable = [[]]) => {
    const result = new Float32Array(wavetable.length * wavetable[0].length);
    wavetable.forEach((wave, index) => result.set(wave, index * wave.length));
    return result;
};

export {
    flattenWavetable
};
