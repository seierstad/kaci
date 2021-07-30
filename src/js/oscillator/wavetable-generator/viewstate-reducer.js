import {
    getPdFunction,
    getMixFunction,
    getWrapperFunction
} from "../oscillator-shared-functions";

import * as WAVETABLE_GENERATOR from "./actions";
import DEFAULTS from "./defaults";


const getParamFunction = (parameter, patchValue, waveCount) => {
    const {
        value,
        change_rate: rate
    } = parameter;

    if (value !== patchValue) {

        if (rate !== "lin") {
            const ratio = value / patchValue;
            return (waveNumber) => patchValue * Math.pow(ratio, waveNumber / waveCount);
        }

        const diff = value - patchValue;
        return (waveNumber) => patchValue + diff * waveNumber / waveCount;
    }

    return () => patchValue;
};

const getResult = (state) => {
    const {
        wave_count,
        wave_length,
        parameters: params,
        patch
    } = state;

    const phaseIncrement = 1 / (wave_length + 1);

    const waveParamFn = getParamFunction(params.waveform, patch.waveform.parameter, wave_count);
    const mixParamFn = getParamFunction(params.pd_mix, patch.pd_mix, wave_count);
    const resonanceParamFn = getParamFunction(params.resonance, patch.resonance, wave_count);
    const wrapperParamFn = getParamFunction(params.wrapper, patch.wrapper.parameter, wave_count);

    const result = [];
    for (let i = 0; i < wave_count; i += 1) {
        const waveParam = waveParamFn(i);

        const pdFunction = [
            getPdFunction(patch.pd[0].steps, {...patch.waveform, parameter: waveParam}),
            getPdFunction(patch.pd[1].steps, {...patch.waveform, parameter: waveParam})
        ];

        const mixFunction = getMixFunction(pdFunction[0], pdFunction[1], mixParamFn(i));

        const wave = new Float32Array(wave_length);
        let useFunction = mixFunction;

        if (patch.mode === "resonant") {
            useFunction = getWrapperFunction(patch.wrapper.name, mixFunction, resonanceParamFn(i))(wrapperParamFn(i));
        }

        for (let j = 0, phase = 0; j < wave_length; j += 1) {
            wave[j] = useFunction(phase);
            phase += phaseIncrement;
        }
        result.push(wave);
    }
    return result;
};

const wavetableGenerator = (state = {...DEFAULTS}, action = {}) => {
    if (action.submodule === "wavetable-generator") {
        const {type} = action;

        let newState;
        let altered = false;

        switch (type) {
            case WAVETABLE_GENERATOR.TOGGLE:
                newState = {
                    ...state,
                    "parameters": {
                        ...action.parameters
                    },
                    "active": !state.active
                };
                altered = true;
                break;

            case WAVETABLE_GENERATOR.PARAMETER_CHANGE:
                newState = {
                    ...state,
                    "parameters": {
                        ...state.parameters,
                        [action.parameter]: {
                            ...state.parameters[action.parameter],
                            "value": action.value
                        }
                    }
                };
                altered = true;
                break;

            case WAVETABLE_GENERATOR.CHANGE_RATE:
                newState = {
                    ...state,
                    "parameters": {
                        ...state.parameters,
                        [action.parameter]: {
                            ...state.parameters[action.parameter],
                            "change_rate": action.value
                        }
                    }
                };
                altered = true;
                break;

            case WAVETABLE_GENERATOR.WAVE_COUNT_CHANGE:
                newState = {
                    ...state,
                    "wave_count": action.value
                };
                altered = true;
                break;

            case WAVETABLE_GENERATOR.WAVE_LENGTH_CHANGE:
                newState = {
                    ...state,
                    "wave_length": action.value
                };
                altered = true;
                break;
        }

        if (altered) {
            if (action.patch !== newState.patch) {
                newState.patch = action.patch;
            }
        } else if (state.patch !== action.patch) {
            newState = {
                ...state,
                patch: action.patch
            };
            altered = true;
        }

        if (altered) {
            newState.result = getResult(newState);
            return newState;
        }
    }

    return state;
};

export default wavetableGenerator;
