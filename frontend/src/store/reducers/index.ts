import { combineReducers } from "redux";
import authReducer from "./authReducer.ts";
import teamReducer from "./teamReducer.ts";
import userListReducer from "./userListReducer.ts";
import notificationReducer from "./notificationReducer.ts";

const rootReducer = combineReducers({
    auth: authReducer,
    teams: teamReducer,
    userList: userListReducer,
    notifications: notificationReducer
})

export default rootReducer;
