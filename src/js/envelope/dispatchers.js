//import {getValuePair} from "../views/ViewUtils";
import {
    BLUR,
    DURATION_CHANGE,
    POINT_ADD,
    POINT_CHANGE,
    POINT_DELETE,
    POINT_EDIT_END,
    POINT_EDIT_START,
    SUSTAIN_CHANGE,
    SUSTAIN_EDIT_END,
    SUSTAIN_EDIT_START
} from "./actions";

const dispatchHandlers = (dispatch) => ({
    "handlers": {
        "circleClick": (module, envelopeIndex, envelopePart, index, first, last) => {
            if (event.shiftKey) {
                dispatch({
                    type: POINT_DELETE,
                    module,
                    envelopeIndex,
                    envelopePart,
                    index
                });
            } else {
                if ((envelopePart === "sustain") || (envelopePart === "release" && first) || envelopePart === "attack" && last) {
                    dispatch({type: SUSTAIN_EDIT_START, module, envelopeIndex});
                } else {
                    dispatch({type: POINT_EDIT_START, module, envelopeIndex, envelopePart, index});
                }
            }
        },
        "mouseOut": (module, envelopeIndex, envelopePart, pos) => {
            if (pos.x > 1 || pos.x < 0 || pos.y > 1 || pos.y < 0) {
                if (envelopePart === "sustain") {
                    dispatch({type: SUSTAIN_EDIT_END, module, envelopeIndex});
                } else {
                    dispatch({type: BLUR, module, envelopeIndex, envelopePart});
                }
            }
        },
        "activeCircleMouseUp": (module, envelopeIndex, envelopePart, index) => {
            dispatch({
                type: POINT_EDIT_END,
                module,
                envelopeIndex,
                envelopePart,
                index
            });
        },
        "circleBlur": (module, envelopeIndex, envelopePart, index, first, last) => {
            if ((envelopePart === "sustain") || (envelopePart === "release" && last) || envelopePart === "attack" && first) {
                dispatch({type: SUSTAIN_EDIT_END, module, envelopeIndex});
            } else {
                dispatch({type: POINT_EDIT_END, module, envelopeIndex, envelopePart, index});
            }
        },
        "backgroundClick": (module, envelopeIndex, part, point, index) => {
            const {x, y} = point;

            if (part === "sustain") {
                dispatch({type: SUSTAIN_CHANGE, module, envelopeIndex, value: y});
            } else {
                dispatch({type: POINT_ADD, module, envelopeIndex, envelopePart: part, x, y, index});
            }

        },
        "circleMouseDrag": (module, envelopeIndex, envelopePart, index, point, isSustain) => {
            const {x, y} = point; //getValuePair(event, background);

            if ((envelopePart === "sustain") || isSustain) {

                dispatch({
                    type: SUSTAIN_CHANGE,
                    module,
                    envelopeIndex,
                    envelopePart,
                    value: y
                });
            } else {
                dispatch({type: POINT_CHANGE, module, envelopeIndex, envelopePart, index, x, y});
            }
        },
        "durationChange": (module, envelopeIndex, envelopePart, value) => {
            dispatch({
                type: DURATION_CHANGE,
                module,
                envelopeIndex,
                envelopePart,
                value
            });
        }
    }
});

export default dispatchHandlers;
