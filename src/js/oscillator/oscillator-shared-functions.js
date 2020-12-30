import {getDistortedPhase, mixValues} from "../shared-functions";
import {waveforms, wrappers} from "../waveform/waveforms";


export const getPdFunction = (steps, waveform) => {
    const {name, parameter} = waveform;
    const waveFunction = waveforms[name](parameter);

    return (phase) => waveFunction(getDistortedPhase(phase, steps));
};

export const getMixFunction = (fn0, fn1, mix) => {
    return (phase) => mixValues(fn0(phase), fn1(phase), mix);
};

export const getWrapperFunction = (wrapperName, waveform, resonance) => {
    return (parameter) => {
        const paramWrapper = wrappers[wrapperName](parameter);
        return (phase) => paramWrapper(phase) * waveform(phase * resonance);
    };
};
