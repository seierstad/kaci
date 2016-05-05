import * as Actions from "../Actions.jsx";
import config from "../../configuration.json";

const key  = (state = {down: false}, action) => {
	switch (action.type) {
		case Actions.MIDI_KEY_DOWN:
		case Actions.KEYBOARD_KEY_DOWN:
			return {
				...state,
				pressed: true
			};
		case Actions.KEYBOARD_KEY_UP:
		case Actions.MIDI_KEY_UP:
			return {
				...state,
				pressed: false
			};
	}
}

const keys = (state = [], action) => {
	switch (action.type) {
		case Actions.MIDI_KEY_DOWN:
		case Actions.KEYBOARD_KEY_DOWN:
		case Actions.KEYBOARD_KEY_UP:
		case Actions.MIDI_KEY_UP:
			const result = [
				...(state.slice(0, action.keyNumber)),
				...(state.slice(action.keyNumber))
			];
			result[action.keyNumber] = key({...state[action.keyNumber]}, action);
			return result; 
	}
	return state;
}

const playState = (state = {keys: [], pitch: 0, chordShift: 0, hold: 0}, action) => {
	switch (action.type) {
		case Actions.MIDI_KEY_DOWN:
		case Actions.MIDI_KEY_UP:
		case Actions.KEYBOARD_KEY_DOWN:
		case Actions.KEYBOARD_KEY_UP:
			return {
				...state,
				keys: keys(state.keys, action)
			};
	}
	return state;
}

export default playState;
