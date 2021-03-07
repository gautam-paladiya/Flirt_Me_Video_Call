import React from "react";
import FacebookLogin from "react-facebook-login";
import { FaFacebook } from "react-icons/fa";
import AxiosInstance from "../utils/AxiosInstance";
import cookie from "react-cookies";

function ComponentFacebookButton(props) {
  const responseFacebook = async (res) => {
    console.log(res);
    if (res.name) {
      const user = {
        name: res.name,
        email: res.email,
        signupType: "facebook",
        password: res.accessToken,
        userId: res.userID,
        accessToken: res.signedRequest,
        picture: res.picture.data.url,
      };

      const result = await AxiosInstance.post("/auth/register", user, null);
      console.log(`result ${JSON.stringify(result)}`);

      if (result.status == 200 && result.data) {
        cookie.save("id", result.data.token, { path: "/" });
        localStorage.setItem("name", user.name);
        localStorage.setItem("email", user.email);
        localStorage.setItem("picture", user.picture);
        localStorage.setItem("signUpType", user.signupType);
      }
    }
  };

  return (
    <FacebookLogin
      appId="248937180191492"
      autoLoad={false}
      fields="name,email,picture,gender"
      callback={responseFacebook}
      // scope="public_profile,user_gender,user_location,user_age_range"
      cssClass="w-full"
      // render={(renderProps) => <div onClick={renderProps.onClick}>hello</div>}
      textButton=""
      icon={props.children}
    />
  );
}

export default ComponentFacebookButton;
