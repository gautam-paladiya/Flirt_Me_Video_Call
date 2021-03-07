import {
  CONNECTED,
  CONNECTING,
  DISCONNECT,
  GO_OFFLINE,
  GO_ONLINE,
  NOTCONNECTED,
  WAITING,
} from "../CallingAction";

const initialState = {
  connectStatus: "",
  isActive: false,
  connected: false,
};

const CallingReducer = (state = initialState, action) => {
  switch (action.type) {
    case GO_ONLINE: {
      return { ...state, isActive: true };
    }
    case GO_OFFLINE: {
      return { ...state, isActive: false };
    }
    case CONNECTING: {
      return { ...state, connectStatus: CONNECTING };
    }
    case WAITING: {
      return { ...state, connectStatus: WAITING };
    }
    case CONNECTED: {
      return { ...state, connectStatus: CONNECTED, connected: true };
    }
    case DISCONNECT: {
      return { ...state, connectStatus: DISCONNECT };
    }
    case NOTCONNECTED: {
      return { ...state, connectStatus: NOTCONNECTED, connected: false };
    }
    default:
      return state;
  }
};

export default CallingReducer;
