import * as Actions from "../Actions.jsx";
import { combineReducers } from "redux";
import config from "../../configuration.json";

const envelopePart = (state = [], action) => {
	switch (action.type) {
		case Actions.ENVELOPE_POINT_ADD:
			return [
				...state.map(el => (el >= action.index ? el + 1 : el)),
				action.index
			];
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
	switch (action.type) {
		case Actions.ENVELOPE_SUSTAIN_EDIT_START:
			return {
				...state,
				editSustain: true
			};
		case Actions.ENVELOPE_SUSTAIN_EDIT_END:
			return {
				...state,
				editSustain: false
			};
	}

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




const envelope = (state = new Array(config.modulation.source.envelope.count), action) => {
	const index = action.envelopeIndex;

	if (!isNaN(index)) {	

		let result = [
			...state
		];
		result[index] = sustainedEnvelope(state[index], action);

		return result;
	}

	return state;
}

const viewState = combineReducers({
	envelope
});


export default viewState;