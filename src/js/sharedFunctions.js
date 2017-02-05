export const mixValues = (source1, source2, ratio) => source1 * (1 - ratio) + source2 * ratio;

export const vectorToLinearFunction = (vector) => {
    const rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    const constant = vector[0][1] - (rate * vector[0][0]);
    return (phase) => (phase * rate) + constant;
};

export const getDistortedPhase = (phase, envelope) => {
    let i;

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


export const inputNode = (context) => {
    const node = context.createGain();
    node.gain.value = 0;
    node.gain.setValueAtTime(1, context.currentTime);

    return node;
};

export const outputNode = (context, dc, value) => {
    const node = context.createGain();
    node.gain.value = 0;
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

                console.log(label ? label : "", result);
                this.justLogged = true;
                setTimeout(() => {
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
}

export const splicedArrayCopy = (arr, index, deleteCount, ...newContent) => {
    const result = [...arr];
    result.splice(index, deleteCount, ...newContent);
    return result;
};
