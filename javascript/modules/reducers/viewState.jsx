import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";


const envelopePart = (state = [], action) => {
	switch (action.type) {
		case Actions.ENVELOPE_POINT_ADD:
			// TODO: find out how to get index of the added point
			// add index of added point to an array ("activePoints"?)
			break;
		case Actions.ENVELOPE_BLUR:
			return [];
		case Actions.ENVELOPE_POINT_EDIT_START:
			if (state.indexOf(action.index) === -1) {
				return [...state, action.index];
			}
			break;
		case Actions.ENVELOPE_POINT_EDIT_END:
			const index = state.indexOf(action.index);
			if (index !== -1) {
				return [
		            ...state.slice(0, index), 
		            ...state.slice(index + 1)
		        ];
		    }
		    break;

	}
	return state;
}

const sustainedEnvelope = (state = {attack: [], release: []}, action) => {
    switch (action.envelopePart) {
        case "attack":
            return {
                ...state,
                attack: envelopePart(state.attack, action)
            };
        case "release":
            return {
                ...state,
                release: envelopePart(state.release, action)
            };
    }
    return state;
};




const envelope = (state = [], action) => {
	if (!isNaN(action.envelopeIndex)) {
		return [
			...state.splice(0, action.envelopeIndex),
			sustainedEnvelope(state[action.envelopeIndex], action),
			...state.splice(action.envelopeIndex + 1)
		];
	}
	return state;
}

const viewState = combineReducers({
	envelope
});


export default viewState;