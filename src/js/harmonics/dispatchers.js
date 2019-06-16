import {
    ADD,
    DENOMINATOR_CHANGE,
    LEVEL_CHANGE,
    LEVELS_NORMALIZE,
    NEW,
    NUMERATOR_CHANGE,
    PHASE_CHANGE,
    REMOVE,
    TOGGLE,
    SERIES
} from "./actions";

const dispatchers = (dispatch) => ({
    "add": (numerator, denominator) => dispatch({
        type: ADD,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator
    }),
    "denominatorChange": (value) => dispatch({
        type: DENOMINATOR_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value
    }),
    "handleNormalize": () => dispatch({
        type: LEVELS_NORMALIZE,
        module: "oscillator",
        submodule: "harmonics"
    }),
    "handleNew": () => dispatch({
        type: NEW,
        module: "oscillator",
        submodule: "harmonics"
    }),
    "levelChange": (value, {numerator, denominator}) => dispatch({
        type: LEVEL_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value,
        numerator,
        denominator
    }),
    "numeratorChange": (value) => dispatch({
        type: NUMERATOR_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value
    }),
    "phaseChange": (value, {numerator, denominator}) => dispatch({
        type: PHASE_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value,
        numerator,
        denominator
    }),
    "remove": (module, index, {numerator, denominator}) => dispatch({
        type: REMOVE,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator
    }),
    "toggle": (module, index, {numerator, denominator}) => dispatch({
        type: TOGGLE,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator
    }),
    "preset": (preset, partials) => dispatch({
        type: SERIES,
        module: "oscillator",
        submodule: "harmonics",
        preset,
        partials
    })
});


export default dispatchers;

