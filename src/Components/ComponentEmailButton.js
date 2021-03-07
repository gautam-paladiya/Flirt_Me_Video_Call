import React, { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import TermsComponent from "../pages/VideoCallPage/TermsComponent";
import AxiosInstance from "../utils/AxiosInstance";
import cookie from "react-cookies";

const emailFormat = /^[^s@]+@[^s@]+.[^s@]+$/;

function ComponentEmailButton(props) {
  const { onClose } = props;
  const [Term, setTerm] = useState(false);
  const [isLogin, setIsLogin] = useState(false);

  const [txtName, setTxtName] = useState("");
  const [txtEmail, setTxtEmail] = useState("");
  const [txtPassword, setTxtPassword] = useState("");

  const [txtNameError, setTxtNameError] = useState("");
  const [txtEmailError, setTxtEmailError] = useState("");
  const [txtPasswordError, setTxtPasswordError] = useState("");
  const [termsError, setTermsError] = useState(false);

  const doLogin = () => {};
  const doSignUp = async () => {
    if (!txtName || txtName.trim().length < 6) {
      setTxtNameError("Enter minimum 6 char long name !");
      return;
    }
    if (!txtEmail || !emailFormat.test(txtEmail.trim())) {
      setTxtEmailError("Enter valid email address !");
      return;
    }
    if (!txtPassword || txtPassword.trim().length < 6) {
      setTxtPasswordError("Enter minimum 6 char long password !");
      return;
    }
    if (!Term) {
      setTermsError(true);
      return;
    }

    setTermsError(false);
    setTxtNameError("");
    setTxtEmailError("");
    setTxtPasswordError("");

    const user = {
      name: txtName,
      email: txtEmail,
      password: txtPassword,
      country: localStorage.getItem("country"),
      signupType: "email",
    };

    const result = await AxiosInstance.post("/auth/register", user, null);
    console.log(`result ${JSON.stringify(result)}`);
    if (result.status == 200 && result.data) {
      cookie.save("id", result.data.token, { path: "/" });
      localStorage.setItem("name", txtName);
      localStorage.setItem("email", txtEmail);
      localStorage.setItem("picture", "");
      localStorage.setItem("signUpType", user.signupType);
      onClose();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* <div
        className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around  hover:bg-yellow-500 bg-yellow-400 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
        onClick={() => {
          // setLogWithEmail(true);
        }}
      >
        <FaEnvelope className="w-8 h-8 text-gray-800" />
        <div className="text-lg text-white font-semibold uppercase  group-hover:text-xl">
          Login with Email
        </div>
      </div> */}
      {/* {LogWithEmail && ( */}
      <div className="flex flex-col items-center mt-3">
        {!isLogin && (
          <input
            type="text"
            className="border w-full rounded-full p-2 my-2 font-semibold  focus:outline-none bg-gray-300 text-black text-lg focus:bg-white focus:text-gray-700 "
            placeholder="Enter Your Name .."
            value={txtName}
            onChange={(e) => setTxtName(e.target.value)}
          />
        )}
        <span className="text-red-500 text-lg font-bold my-2">
          {txtNameError}
        </span>
        <input
          type="text"
          className="border w-full rounded-full p-2 m-2 font-semibold  focus:outline-none bg-gray-300 text-black text-lg focus:bg-white focus:text-gray-700 "
          placeholder="email@address.com"
          value={txtEmail}
          onChange={(e) => setTxtEmail(e.target.value)}
        />
        <span className="text-red-500 text-lg font-bold my-2">
          {txtEmailError}
        </span>
        <input
          type="password"
          className="border w-full rounded-full p-2 m-2 font-semibold focus:outline-none bg-gray-300 text-black text-lg focus:bg-white focus:text-gray-700 "
          placeholder="Password"
          value={txtPassword}
          onChange={(e) => setTxtPassword(e.target.value)}
        />
        <span className="text-red-500 text-lg font-bold my-2">
          {txtPasswordError}
        </span>
        <TermsComponent
          terms={Term}
          onChangeTerms={(e) => {
            console.log(e.target.checked);
            setTerm(e.target.checked);
          }}
          showTermsPopper={termsError}
        />
        {termsError && (
          <span className="text-red-500 text-lg font-bold my-2">
            Please agree with terms and condition
          </span>
        )}
        <div
          className="m-3 p-2 px-5 rounded-lg bg-blue-700 text-lg font-bold text-white uppercase
        hover:bg-blue-600 shadow-xl cursor-pointer"
          onClick={() => {
            isLogin ? doLogin() : doSignUp();
          }}
        >
          join for free
        </div>
        {isLogin ? (
          <div className="m-2">
            New user ?{" "}
            <span
              className="hover:text-blue-600 font-semibold cursor-pointer"
              onClick={() => setIsLogin(false)}
            >
              Register here
            </span>
          </div>
        ) : (
          <div className="m-2">
            Already a Member?{" "}
            <span
              className="hover:text-blue-600 font-semibold cursor-pointer"
              onClick={() => setIsLogin(true)}
            >
              Log in Here
            </span>
          </div>
        )}
      </div>
      {/* )} */}
    </div>
  );
}

export default ComponentEmailButton;
