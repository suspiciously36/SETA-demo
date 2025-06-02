import { combineReducers } from "redux";
import authReducer from "./authReducer.ts";
import teamReducer from "./teamReducer.ts";
import userListReducer from "./userListReducer.ts";
import notificationReducer from "./notificationReducer.ts";
import folderReducer from "./folderReducer.ts";
import noteReducer from "./noteReducer.ts";

const rootReducer = combineReducers({
    auth: authReducer,
    teams: teamReducer,
    userList: userListReducer,
    notifications: notificationReducer,
    folders: folderReducer,
    notes: noteReducer
})

export default rootReducer;
