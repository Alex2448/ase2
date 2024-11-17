import { combineReducers } from "redux";
import auth from "./auth.reducer";
import message from "./message.reducer";
import box from "./boxes.reducer";
import delivery from "./delivery.reducer"

export default combineReducers({
    auth,
    message,
    box,
    delivery
});