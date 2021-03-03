import { Dialog } from "@material-ui/core";
import React from "react";

function ProfileDialogComponent(props) {
  const { onClose, display } = props;

  const imgSrc = localStorage.getItem("picture");
  const name = localStorage.getItem("name");

  return (
    <Dialog open={display} onClose={onClose}>
      <div className="flex flex-col items-center p-5 overflow-hidden">
        <img src={imgSrc} className="w-20 h-20 m-10 rounded-2xl" />
        <div className="text-lg font-bold caps m-3">{name}</div>
        <div
          className="bg-red-600 text-white font-bold px-3 py-2  m-3 cursor-pointer rounded-2xl"
          onClick={() => {}}
        >
          Logout
        </div>
      </div>
    </Dialog>
  );
}

export default ProfileDialogComponent;
