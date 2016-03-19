import { combineReducers } from "redux";
import patch from "./patch.jsx";

const settings = (state = {}, action) => {
    return state;
};
const reducer = combineReducers({
    patch,
    settings
});
export default reducer;
