export const CONNECTING = "CONNECTING";
export const WAITING = "WAITING";
export const CONNECTED = "CONNECTED";
export const DISCONNECT = "DISCONNECT";
export const NOTCONNECTED = "NOTCONNECTED";

export const GO_ONLINE = "GOONLINE";
export const GO_OFFLINE = "GOOFFLINE";

export const GoOnline = () => {
  return {
    type: GO_ONLINE,
  };
};
export const GoOffline = () => {
  return {
    type: GO_OFFLINE,
  };
};

export const StartConnecting = () => {
  return {
    type: CONNECTING,
  };
};

export const StartWaiting = () => {
  return {
    type: WAITING,
  };
};

export const CompleteConnected = () => {
  return {
    type: CONNECTED,
  };
};

export const StopConnecting = () => {
  return {
    type: NOTCONNECTED,
  };
};
