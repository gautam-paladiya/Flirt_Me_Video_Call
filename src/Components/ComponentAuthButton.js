import React from "react";

function ComponentAuthButton({ Img, text, ...props }) {
  return (
    <div
      className="group p-2 m-2 mx-3 cursor-pointer flex flex-row w-72 items-center justify-around bg-white hover:bg-gray-800 hover:text-white border-2 border-gray-800 rounded-md "
      onClick={() => {
        if (props.onClick) {
          props.onClick();
        }
      }}
    >
      <Img size={30} className=" text-black group-hover:text-white" />
      <div className="text-lg text-gray-700 font-bold uppercase group-hover:text-white">
        {text}
      </div>
    </div>
  );
}

export default ComponentAuthButton;
