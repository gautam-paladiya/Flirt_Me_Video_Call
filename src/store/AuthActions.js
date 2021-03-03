export const LOGIN_USER = "Login User";
export const LOGOUT_USER = "Logout User";

export const LoginUser = (data) => {
  return {
    type: LOGIN_USER,
    payload: data,
  };
};

export const LogoutUser = () => {
  return {
    type: LOGOUT_USER,
  };
};
