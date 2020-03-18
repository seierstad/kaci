import {
    HARMONICS_MIX_CHANGE
} from "../oscillator/actions";

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
    "add": groupIndex => (numerator, denominator) => dispatch({
        type: ADD,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator,
        groupIndex
    }),
    "denominatorChange": groupIndex => (value) => dispatch({
        type: DENOMINATOR_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        groupIndex,
        value
    }),
    "handleNormalize": groupIndex => () => dispatch({
        type: LEVELS_NORMALIZE,
        module: "oscillator",
        submodule: "harmonics",
        groupIndex
    }),
    "handleNew": groupIndex => () => dispatch({
        type: NEW,
        module: "oscillator",
        submodule: "harmonics",
        groupIndex
    }),
    "levelChange": groupIndex => (value, {numerator, denominator}) => dispatch({
        type: LEVEL_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value,
        numerator,
        denominator,
        groupIndex
    }),
    "numeratorChange": groupIndex => (value) => dispatch({
        type: NUMERATOR_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value,
        groupIndex
    }),
    "phaseChange": groupIndex => (value, {numerator, denominator}) => dispatch({
        type: PHASE_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value,
        numerator,
        denominator,
        groupIndex
    }),
    "remove": groupIndex => (module, index, {numerator, denominator}) => dispatch({
        type: REMOVE,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator,
        groupIndex,
        index
    }),
    "toggle": groupIndex => (module, index, {numerator, denominator}) => dispatch({
        type: TOGGLE,
        module: "oscillator",
        submodule: "harmonics",
        numerator,
        denominator,
        groupIndex,
        index
    }),
    "mixChange": (value) => dispatch({
        type: HARMONICS_MIX_CHANGE,
        module: "oscillator",
        submodule: "harmonics",
        value
    }),
    "preset": groupIndex => (preset, partials) => dispatch({
        type: SERIES,
        module: "oscillator",
        submodule: "harmonics",
        preset,
        partials,
        groupIndex
    })
});


export default dispatchers;

