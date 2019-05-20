import {oneOf, number, shape} from "prop-types";
import {waveforms} from "../waveform/waveforms";

const waveformProps = {
    "name": oneOf(Object.keys(waveforms)).isRequired,
    "parameter": number
};

const waveformShape = shape(waveformProps);

export {
    waveformShape
};
