import { Button, makeStyles } from "@material-ui/core";
import React from "react";
import { FaFacebook } from "react-icons/fa";

const useStyle = makeStyles({
  button: {
    fontSize: 17,
    fontWeight: "bold",
  },
});

function ComponentFacebookButton(props) {
  const classes = useStyle();

  return (
    <div
      className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-indigo-800 hover:bg-indigo-900 bg-gray-200 rounded-md focus:ring-2 focus:ring-blue-600 hover:shadow-lg "
      onClick={() => {
        if (props.onClick) {
          props.onClick();
          props.onClose();
        }
      }}
    >
      <FaFacebook className="w-8 h-8 text-white" />
      <div className="text-lg text-white font-semibold uppercase  group-hover:text-xl">
        Login with Facebook
      </div>
    </div>
  );
}

export default ComponentFacebookButton;
