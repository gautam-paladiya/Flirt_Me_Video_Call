import React from "react";
import { FaEnvelope } from "react-icons/fa";

function ComponentEmailButton(props) {
  return (
    <div
      className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-white hover:bg-gray-300 bg-gray-200 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      <FaEnvelope className="w-8 h-8 text-gray-800" />
      <div className="text-lg text-gray-600 font-bold uppercase  group-hover:text-xl">
        Login with Email
      </div>
    </div>
  );
}

export default ComponentEmailButton;
