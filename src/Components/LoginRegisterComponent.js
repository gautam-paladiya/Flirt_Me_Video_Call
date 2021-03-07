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
import GoogleIcon from "../assets/images/google.png";

function LoginRegisterComponent(props) {
  const { display, onClose } = props;

  return (
    <Dialog open={display} onClose={onClose}>
      <div className="m-0 p-5 w-full h-full items-center flex flex-col">
        <div className="flex flex-col items-center w-full ">
          <h1 className="text-3xl text-center mb-4 font-bold text-blue-600 ">
            It’s Easy to Join {process.env.REACT_APP_NAME}, Get Started Now
          </h1>

          <ComponentFacebookButton>
            <div
              className="group p-2 px-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-indigo-800 hover:bg-indigo-900 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
              onClick={() => {
                onClose();
              }}
            >
              <FaFacebook className="w-8 h-8 text-white" />
              <div className="text-lg text-white font-semibold uppercase group-hover:scale-105">
                Continue with Facebook
              </div>
            </div>
          </ComponentFacebookButton>

          <ComponentGoogleButton>
            <div
              className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-red-600 hover:bg-red-700 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
              onClick={() => {
                onClose();
              }}
            >
              <img
                src={GoogleIcon}
                className="w-8 h-8  group-hover:text-white"
              />
              <div className="text-lg text-white font-semibold uppercase  scale-150">
                Continue with Google
              </div>
            </div>
          </ComponentGoogleButton>
          <div className="text-2xl text-gray-800 font-bold">OR</div>
          <ComponentEmailButton onClose={onClose} />
        </div>

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
