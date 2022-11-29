import * as AUDIOFILE from "./audiofile/actions.js";
import * as WALDORF from "./waldorf/actions.js";

const prefix = "WAVETABLE-GENERATOR_";

const TOGGLE = prefix + "TOGGLE";
const PARAMETER = prefix + "PARAMETER";
const PARAMETER_CHANGE_RATE = prefix + "PARAMETER_CHANGE_RATE";
const TYPE = prefix + "TYPE";
const WAVE_COUNT = prefix + "WAVE_COUNT";
const WAVE_LENGTH = prefix + "WAVE_LENGTH";
const SELECT_WAVE_INDEX = prefix + "SELECT_WAVE_INDEX";

export {
    TOGGLE,
    PARAMETER,
    PARAMETER_CHANGE_RATE,
    TYPE,
    WAVE_COUNT,
    WAVE_LENGTH,
    SELECT_WAVE_INDEX,

    AUDIOFILE,
    WALDORF
};
