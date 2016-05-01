import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";

const lfo = (state = [], action) => {
	switch (action.type) {
		case Actions.LFO_FREQUENCY_CHANGE:
			return {
				...state,
				"frequency": action.value
			};

		case Actions.LFO_AMOUNT_CHANGE:
			return {
				...state,
				"amount": action.value
			};

		case Actions.LFO_WAVEFORM_CHANGE:
			return {
				...state,
				"waveform": action.value
			};

		case Actions.LFO_RESET:
			// possible implementation: timestamp in the viewState?
			return state;

		case Actions.SYNC_NUMERATOR_CHANGE:
			return {
				...state,
				sync: {
					...state.sync,
					"numerator": action.value
				}
			};

		case Actions.SYNC_DENOMINATOR_CHANGE:
			return {
				...state,
				sync: {
					...state.sync,
					"denominator": action.value
				}
			};

		case Actions.SYNC_TOGGLE:
			return {
				...state,
				sync: {
					...state.sync,
					"enabled": !!!state.sync.enabled
				}
			};
	}
	return state;
}

const lfos = (state = [], action) => {
	if (action.module === "lfos") {

	    let result = [
	        ...state
	    ];
	    result[action.index] = lfo(state[action.index], action);

	    return result;
	}
	return state;
};

export default lfos;