export const getWrapperFunction = (wrapper, waveform, resonance) => (phase) => {
    return wrapper(phase) * waveform(phase * resonance);
};
