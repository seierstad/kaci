import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";

const nullReducer = (state = {}, action) => {
    return state;
};

const keyboard = (state = {}, action) => {
	console.log(action.type + ": " + action.value);
	switch (action.type) {
		case Actions.KEYBOARD_LAYOUT_CHANGE:
			return {
				...state,
				activeLayout: action.value
			};
		default: 
			return state;
	}
};

const midi = (state = {}, action) => {
	switch (action.type) {
		case Actions.MIDI_PORT_ADDED:
			return {
				...state,
				ports: [
					...state.ports,
					...action.value
				]
			}
		case Actions.MIDI_PORT_SElECTED:
			if (state.ports.some((item) => item.name === action.value)) {
				return {
					...state,
					portId: action.value
				}
			}
			break;
	}
	return state;

};

const tuning = nullReducer;
const modulation = nullReducer;

const settings = combineReducers({
	keyboard,
	midi,
	tuning,
	modulation
});

export default settings;