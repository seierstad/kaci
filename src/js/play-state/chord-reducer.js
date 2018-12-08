import * as MIDI from "../midi/actions";
import * as KEYBOARD from "../keyboard/actions";

const chord = (state = {}, action = {}) => {
    const {
        afterTouch,
        keyNumber,
        type,
        velocity
    } = action;

    switch (type) {
        case MIDI.KEY_DOWN:
        case KEYBOARD.KEY_DOWN:
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

        case KEYBOARD.KEY_UP:
        case MIDI.KEY_UP:
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
