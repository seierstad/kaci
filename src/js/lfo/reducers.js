import * as MODULATOR from "../modulator/actions";
import modulatorReducer from "../modulator/reducers";
import speedReducer from "../speed/reducer";
import waveform from "../waveform/reducer";
import {defaultLfoParameters} from "./defaults";

const lfo = (state = {...defaultLfoParameters}, action) => {
    switch (action.type) {
        case MODULATOR.FREQUENCY_CHANGE:
        case MODULATOR.AMOUNT_CHANGE:
        case MODULATOR.MODE_CHANGE:
        case MODULATOR.RESET:
            return modulatorReducer(state, action);
    }

    const newWaveform = waveform(state.waveform, action);
    if (newWaveform !== state.waveform) {
        return {
            ...state,
            waveform: newWaveform
        };
    }

    const speedState = state.speed;
    const newSpeedState = speedReducer(speedState, action);
    if (speedState !== newSpeedState) {
        return {
            ...state,
            speed: newSpeedState
        };
    }

    return state;
};

const lfos = (state = [], action) => {
    if (action.module === "lfos") {

        const stateAtIndex = state[action.index];
        const newStateAtIndex = lfo(stateAtIndex, action);

        if (stateAtIndex !== newStateAtIndex) {
            const result = [
                ...state
            ];
            result[action.index] = newStateAtIndex;

            return result;
        }
    }

    return state;
};


export default lfos;
