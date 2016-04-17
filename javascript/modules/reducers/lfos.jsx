import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";

const lfo = (state = [], action) => {
	switch (action.type) {
		case Actions.LFO_FREQUENCY_CHANGE:
			return {
				...state,
				"frequency": action.value
			};
		case Actions.LFO_SYNC_NUMERATOR_CHANGE:
			return {
				...state,
				sync: {
					...state.sync,
					"numerator": action.value
				}
			};
		case Actions.LFO_SYNC_DENOMINATOR_CHANGE:
			return {
				...state,
				sync: {
					...state.sync,
					"denominator": action.value
				}
			};
		case Actions.LFO_SYNC_TOGGLE:
			return {
				...state,
				sync: {
					...state.sync,
					"enabled": !!!state.sync.enabled
				}
			};
		case Actions.LFO_AMOUNT_CHANGE:
			return {
				...state,
				"amount": action.value
			};
		case Actions.LFO_WAVEFORM_CHANGE:
		//todo
		case Actions.LFO_RESET:
		// possibly implemented as a timestamp in the viewState?
	}
	return state;
}

const lfos = (state = [], action) => {
    const index = action.lfoIndex;

    let result = [
        ...state
    ];
    result[index] = lfo(state[index], action);

    return result;
};

export default lfos;