import { combineReducers } from "redux";
import patch from "./patch.jsx";
import settings from "./settings.jsx";

const reducer = combineReducers({
    patch,
    settings
});
export default reducer;
