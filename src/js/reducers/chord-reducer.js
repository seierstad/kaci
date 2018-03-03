import * as Actions from "../actions";


const chord = (state = {}, action = {}) => {
    const {
        afterTouch,
        keyNumber,
        type,
        velocity
    } = action;

    switch (type) {
        case Actions.MIDI.KEY_DOWN:
        case Actions.KEYBOARD_KEY_DOWN:
            if (!state.hasOwnProperty(keyNumber)) {
                return {
                    ...state,
                    [keyNumber]: {
                        "down": true,
                        "number": keyNumber,
                        velocity,
                        afterTouch
                    }
                };
            }
            break;

        case Actions.KEYBOARD_KEY_UP:
        case Actions.MIDI.KEY_UP:
            if (state.hasOwnProperty(keyNumber)) {
                const result = {
                    ...state
                };
                delete result[keyNumber];
                return result;
            }
            break;
    }

    return state;
};


export default chord;
