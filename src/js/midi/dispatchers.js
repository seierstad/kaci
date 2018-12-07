import {PORT_SELECT, CHANNEL_SELECT, TOGGLE} from "./actions";

const mapDispatch = (dispatch) => ({
    "handlers": {
        "portChange": (event) => {
            const value = event.target.value;
            dispatch({type: PORT_SELECT, value});
        },
        "channelChange": (value) => {dispatch({type: CHANNEL_SELECT, value});},
        "toggle": () => dispatch({type: TOGGLE})
    }
});

export default mapDispatch;
