import DC from "./DCGenerator";

const mixValues = (source1, source2, ratio) => source1 * (1 - ratio) + source2 * ratio;

const vectorToLinearFunction = (vector) => {
    const rate = (vector[1][1] - vector[0][1]) / (vector[1][0] - vector[0][0]);
    const constant = vector[0][1] - (rate * vector[0][0]);
    return (phase) => (phase * rate) + constant;
};

const getDistortedPhase = (phase, envelope) => {
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

class PannableModule {

    inputNode () {
        const node = this.context.createGain();
        node.gain.value = 0;
        node.gain.setValueAtTime(1, this.context.currentTime);

        return node;
    }
    outputNode (value) {
        const node = this.context.createGain();
        node.gain.value = 0;
        node.gain.setValueAtTime(value, this.context.currentTime);
        this.dc.connect(node);

        return node;
    }
    connect (node) {
        this.output.connect(node);
    }
    disconnect () {
        this.output.disconnect();
    }
}


class ParamLogger {
    constructor (parameter, context, time = 1000) {
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

                console.log(result);
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

export {
    mixValues,
    vectorToLinearFunction,
    getDistortedPhase,
    PannableModule,
    ParamLogger
};
