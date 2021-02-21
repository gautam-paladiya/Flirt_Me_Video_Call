import { combineReducers } from "redux";
import CallingReducer from "./CallingReducer";

const rootReducer = combineReducers({ calling: CallingReducer });

export default rootReducer