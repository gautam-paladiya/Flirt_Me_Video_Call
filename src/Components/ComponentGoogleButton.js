import React from "react";
import { useCookies } from "react-cookie";
import GoogleLogin from "react-google-login";
import AxiosInstance from "../utils/AxiosInstance";

function ComponentGoogleButton(props) {
  const [cookies, setCookie, removeCookie] = useCookies(["auth"]);

  const responseGoogle = async (res) => {
    console.log(res.getBasicProfile());
    const profile = res.getBasicProfile();
    const user = {
      name: profile.getName(),
      email: profile.getEmail(),
      password: res.getAuthResponse().id_token,
      userId: profile.getId(),
      picture: profile.getImageUrl(),
      signupType: "google",
    };

    const result = await AxiosInstance.post("/auth/register", user, null);
    console.log(`result ${JSON.stringify(result)}`);

    if (result.status == 200 && result.data) {
      setCookie("id", result.data.token);
      localStorage.setItem("name", user.name);
      localStorage.setItem("email", user.email);
      localStorage.setItem("picture", user.picture);
      localStorage.setItem("signUpType", user.signupType);
    }
  };
  const responseGoogleFailed = (res) => {
    console.log(res);
  };

  return (
    <GoogleLogin
      clientId={process.env.REACT_APP_GOOGLE_ID}
      render={(renderProps) => {
        return <div onClick={renderProps.onClick}>{props.children}</div>;
      }}
      onSuccess={responseGoogle}
      onFailure={responseGoogleFailed}
      cookiePolicy={"single_host_origin"}
      isSignedIn={true}
    />
  );
}

export default ComponentGoogleButton;
