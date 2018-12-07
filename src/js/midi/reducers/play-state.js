import {TEMPO_CHANGE} from "../actions";
import {defaultClockState} from "../defaults";

const midiClock = (state = defaultClockState, action = {}) => {

    switch (action.type) {
        case TEMPO_CHANGE:
            const {tempo, sync, quarterNoteDuration} = action;

            return {
                ...state,
                tempo,
                sync,
                quarterNoteDuration
            };
    }

    return state;
};

export {
    midiClock
};
