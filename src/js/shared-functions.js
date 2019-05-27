export const mixValues = (source1, source2, ratio) => source1 * (1 - ratio) + source2 * ratio;

export const vectorToLinearFunction = (vector) => {
    const rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    const constant = vector[0][1] - (rate * vector[0][0]);
    return (phase) => (phase * rate) + constant;
};

export const phaseDistortionFunction = (envelope) => {
    if (!envelope || envelope.length < 2) {
        throw new Error("invalid phase distortion data");
    }

    const functions = [];
    for (let i = 1; i < envelope.length; i += 1) {
        functions[i - 1] = {
            from: envelope[i - 1][0],
            to: envelope[i][0],
            fn: vectorToLinearFunction([envelope[i - 1], envelope[i]])
        };
    }

    return (phase) => {
        const p = phase % 1;
        return functions.find(f => (p >= f.from && p < f.to)).fn(p);
    };
};

export const getDistortedPhase = (phase, envelope) => phaseDistortionFunction(envelope)(phase);


const logBase = (x, base) => Math.log(x) / Math.log(base);

export const getScale = (min, max, mid) => {

    if (typeof mid === "number") {
        const highSpan = max - mid;
        const lowSpan = mid - min;

        const down = (value) => {
            if (value >= mid) {
                return logBase(value - mid + 1, highSpan + 1) * highSpan + mid;
            }
            return logBase(mid - value + 1, lowSpan + 1) * -lowSpan - mid;
        };

        const up = (value) => {
            if (value >= mid) {
                return Math.pow(highSpan + 1, (value - mid) / highSpan) - 1 + mid;
            }
            return mid - (Math.pow(lowSpan + 1, (mid - value) / lowSpan) - 1);
        };

        return {up, down};
    }

    const span = max - min;
    const down = (value) => logBase(value - min + 1, span + 1) * span + min;
    const up = (value) => Math.pow(span + 1, (value - min) / span) + min - 1;

    return {up, down};
};


export const inputNode = (context) => {
    const node = context.createGain();
    node.gain.setValueAtTime(1, context.currentTime);

    return node;
};

export const outputNode = (context, value) => {
    const dc = context.createConstantSource();
    dc.start();
    const node = context.createGain();
    node.gain.setValueAtTime(value, context.currentTime);
    dc.connect(node);

    return node;
};

export class ParamLogger {
    constructor (parameter, context, label, time = 1000) {
        this.logger = context.createScriptProcessor(512, 1, 1);
        this.logger.onaudioprocess = (evt) => {
            if (!this.justLogged) {
                const result = {};
                evt.inputBuffer.getChannelData(0).map((val) => {
                    if (result[val]) {
                        result[val] += 1;
                    } else {
                        result[val] = 1;
                    }
                });

                /* eslint-disable no-console */
                console.log(label ? label : "", result);
                /* eslint-enable no-console */

                this.justLogged = true;
                this.timer = setTimeout(() => {
                    this.justLogged = false;
                }, time);
            }
        };
        parameter.connect(this.logger);
        this.logger.connect(context.destination);
    }

    disconnect () {
        this.logger.onaudioprocess = null;
        this.logger.disconnect();
    }

    destroy () {
        clearTimeout(this.timer);
        this.logger = null;
    }
}

export const splicedArrayCopy = (arr, index, deleteCount, ...newContent) => {
    const result = [...arr];
    result.splice(index, deleteCount, ...newContent);
    return result;
};


export const gcd = (a, b) => !b ? a : gcd(b, a % b);
export const gcdReducer = (accumulator, current) => gcd(current, accumulator);
export const lcm = (a, b) => (a * b) / gcd(a, b);
export const lcmReducer = (accumulator, current) => lcm(current, accumulator);


export const simplifyFraction = (fraction = {}) => {
    const {numerator, denominator} = fraction;
    const greatestCommonDivisor = gcd(numerator, denominator);
    return (greatestCommonDivisor === 1) ? fraction : {numerator: numerator / greatestCommonDivisor, denominator: denominator / greatestCommonDivisor};
};

export const flipFraction = fraction => ({numerator: fraction.denominator, denominator: fraction.numerator});

// find the least integer divisible by all fractions
export const fractionsLeastCommonIntegerMultiple = (fractions) => {
    const simplified = fractions.map(f => simplifyFraction(f));
    const numeratorsLcm = simplified.map(f => f.numerator).reduce(lcmReducer);
    const numeratorsGcd = simplified.map(f => f.numerator).reduce(gcdReducer);

    return numeratorsLcm / numeratorsGcd;
};


export const factors = (number, min = 2) => {
    const half = number / 2;

    for (let i = min; i < half; i += 1) {
        if (number % i === 0) {
            return [i, ...factors(number / i, i)];
        }
    }

    return [number];
};

export const divisors = (number) => {
    const sqr = Math.sqrt(number);
    const result = [];

    for (let i = 1; i < sqr; i += 1) {
        if (number % i === 0) {
            result.push(i);
            result.push(number / i);
        }
    }

    if ((sqr | 0) === sqr) {
        result.push(sqr);
    }

    return result;
};
