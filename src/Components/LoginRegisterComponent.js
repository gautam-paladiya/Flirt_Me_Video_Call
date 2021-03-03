import React, { useState } from "react";
import ComponentAuthButton from "./ComponentAuthButton";
import { FaFacebook, FaGoogle, FaEnvelope, FaUserAlt } from "react-icons/fa";
import ReactFacebookLogin from "react-facebook-login";
import AxiosInstance from "../utils/AxiosInstance";
import GoogleLogin from "react-google-login";
import { Dialog, Switch } from "@material-ui/core";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import ComponentFacebookButton from "./ComponentFacebookButton";
import ComponentGoogleButton from "./ComponentGoogleButton";
import ComponentEmailButton from "./ComponentEmailButton";
import { connect } from "react-redux";

function LoginRegisterComponent(props) {
  const { display, onClose } = props;

  const responseFacebook = async (res) => {
    console.log(res);
    if (res.name) {
      const user = {
        name: res.name,
        email: res.email,
        signupType: "Facebook",
        password: res.accessToken,
        userId: res.userID,
        accessToken: res.signedRequest,
        picture: res.picture.data.url,
      };

      const result = await AxiosInstance.post("auth/fbRegister", user, null);

      console.log(`result ${JSON.stringify(result)}`);
      if (result.data.data) {
        var profile = result.data.data;
        localStorage.setItem("name", profile.name);
        localStorage.setItem("email", profile.email);
        localStorage.setItem("signupType", profile.signupType);
        localStorage.setItem("id", profile._id);
        localStorage.setItem("picture", profile.picture);
      }
    }
  };

  const [Term, setTerm] = useState(false);
  const [LogWithEmail, setLogWithEmail] = useState(false);

  const responseGoogle = async (res) => {
    console.log(res.getBasicProfile().getName());
    const profile = res.getBasicProfile();
    const user = {
      name: profile.getName(),
      email: profile.getEmail(),
      signupType: "Google",
      password: res.getAuthResponse().id_token,
      userId: profile.getId(),
      picture: profile.getImageUrl(),
    };

    const result = await AxiosInstance.post("auth/gRegister", user, null);

    console.log(`result ${JSON.stringify(result)}`);
  };
  const responseGoogleFailed = (res) => {
    console.log(res);
  };

  return (
    <Dialog open={display} onClose={onClose}>
      <div className="m-0 p-5 w-full h-full items-center flex flex-col">
        <div className="flex flex-col items-center w-full ">
          <h1 className="text-3xl text-center mb-4 font-bold text-blue-600 ">
            It’s Easy to Join {process.env.REACT_APP_NAME}, Get Started Now
          </h1>
          <FacebookLogin
            size="metro"
            appId="248937180191492"
            autoLoad={false}
            fields="name,email,picture,gender"
            callback={responseFacebook}
            // scope="public_profile,user_gender,user_location,user_age_range"
            cssClass="w-full"
            render={(renderProps) => (
              <ComponentFacebookButton
                onClick={renderProps.onClick}
                onClose={onClose}
              />
            )}
          />
          <GoogleLogin
            clientId="477437512812-d2dngsj4r6t7ibfbagm39ukq9tp1imrq.apps.googleusercontent.com"
            render={(renderProps) => (
              <ComponentGoogleButton
                onClick={renderProps.onClick}
                onClose={onClose}
              />
            )}
            onSuccess={responseGoogle}
            onFailure={responseGoogleFailed}
            cookiePolicy={"single_host_origin"}
          />
          <div
            onClick={() => {
              setLogWithEmail(!LogWithEmail);
            }}
          >
            <ComponentEmailButton />
          </div>
        </div>

        {LogWithEmail && (
          <div className="flex flex-col items-center">
            <input
              type="text"
              className="border rounded-full p-2 my-2 font-semibold  focus:outline-none bg-gray-300 text-white text-lg focus:bg-white focus:text-gray-700 "
              placeholder="Enter Your Name .."
            />
            <input
              type="text"
              className="border rounded-full p-2 m-2 font-semibold  focus:outline-none bg-gray-300 text-white text-lg focus:bg-white focus:text-gray-700 "
              placeholder="email@address.com"
            />
            <input
              type="password"
              className="border rounded-full p-2 m-2 font-semibold focus:outline-none bg-gray-300 text-white text-lg focus:bg-white focus:text-gray-700 "
              placeholder="Password"
            />
            <div className="flex bg-white rounded-lg p-1 items-center mt-5">
              <Switch
                checked={Term}
                onChange={(e) => {
                  setTerm(e.target.checked);
                }}
                color="primary"
                name="checkedA"
                inputProps={{ "aria-label": "primary checkbox" }}
              />
              <p className="text-base font-medium">
                I certify I have read and agree to textShadow
                <p>
                  <u>Terms of Use</u>
                </p>
              </p>
            </div>
            <div
              className="m-2 p-2 px-5 rounded-lg bg-blue-700 text-lg font-bold text-white uppercase
        hover:bg-blue-600 shadow-xl"
            >
              join for free
            </div>
            <div className="m-2">
              Already a Member?{" "}
              <span className="hover:text-blue-600 font-semibold">
                Log in Here
              </span>
            </div>
          </div>
        )}

        <div className="flex flex-row items-center mt-2">
          <FaUserAlt size={15} color="black" />
          <p>
            {"  "}
            <span className="text-sm font-bold ml-2">989 222</span>
            {"  "}joined {process.env.REACT_APP_NAME}
          </p>
        </div>
      </div>
    </Dialog>
  );
}

export default connect()(LoginRegisterComponent);
