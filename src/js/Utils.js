const scaleValue = function (inputValue, inputLimits, outputLimits) {
    const stTall = (outputLimits.max - outputLimits.min) / (inputLimits.max - inputLimits.min);
    return (inputValue - inputLimits.min) * stTall + outputLimits.min;
};

export default {
    "scale": scaleValue
};
