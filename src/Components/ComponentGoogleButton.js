import React from "react";
import GoogleIcon from "../assets/images/google.png";

function ComponentGoogleButton(props) {
  return (
    <div
      className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-white hover:bg-gray-400 bg-gray-300 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
      onClick={() => {
        if (props.onClick) {
          props.onClick();
          props.onClose();
        }
      }}
    >
      <img
        src={GoogleIcon}
        className="w-8 h-8 text-black group-hover:text-white"
      />
      <div className="text-lg text-gray-700 font-bold uppercase  group-hover:text-xl">
        Login with Google
      </div>
    </div>
  );
}

export default ComponentGoogleButton;
