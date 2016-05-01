const mixValues = (source1, source2, ratio) => source1 * (-ratio + 1) + source2 * ratio;

const vectorToLinearFunction = (vector) => {
    const rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    const constant = vector[0][1] - (rate * vector[0][0]);
    return (phase) => (phase * rate) + constant;
};

const getDistortedPhase = (phase, envelope) => {
    var i;

    if (envelope.length > 1) {
        const p = phase % 1;
        for (i = 1; i < envelope.length; i += 1) {
            if (p >= envelope[i - 1][0] && p < envelope[i][0]) {
                return vectorToLinearFunction([envelope[i - 1], envelope[i]])(p);
            }
        }
    }
    return 0;
};
export {
    mixValues,
    vectorToLinearFunction,
    getDistortedPhase
}