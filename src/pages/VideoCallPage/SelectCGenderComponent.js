import { Dialog } from "@material-ui/core";
import React from "react";
import MaleIcon from "../../assets/images/malel.png";
import FemaleIcon from "../../assets/images/femalel.png";
import GenOIcon from "../../assets/images/genderO.png";
import IconCoin from "../../assets/images/coin.png";

function SelectCGenderComponent(props) {
  const { onClose, display, selectCGender } = props;

  return (
    <Dialog open={display} onClose={onClose}>
      <div className="p-2 lg:p-5 overflow-hidden flex flex-col ">
        <h1 className="text-center mb-3 text-3xl font-bold font-sans text-red-500">
          Connect me to :
        </h1>
        <div
          className="group flex items-center justify-between bg-gray-400 rounded-2xl shadow-lg px-3 py-2 my-2 lg:py-1 m-2 hover:bg-green-100 cursor-pointer"
          onClick={() => selectCGender("EVERYONE")}
        >
          <img src={GenOIcon} className="w-12 h-12" />
          <div className="text-white group-hover:text-black font-bold text-2xl px-2">
            Everyone
          </div>
          <div className="text-xl text-red-500 font-semibold">Free</div>
        </div>
        <div
          className="group flex items-center justify-between bg-gray-400 rounded-2xl shadow-lg px-3 py-2 my-2 lg:py-1 m-2 hover:bg-green-100 cursor-pointer"
          onClick={() => selectCGender("MALE")}
        >
          <img src={MaleIcon} className="w-12 h-12" />
          <div className="text-white group-hover:text-black font-bold text-2xl px-2">
            Male
          </div>
          <img src={IconCoin} className="w-8 h-8" />
        </div>
        <div
          className="group flex items-center justify-between bg-gray-400 rounded-2xl shadow-lg px-3 py-2 my-2 lg:py-1 m-2 hover:bg-green-100 cursor-pointer"
          onClick={() => selectCGender("FEMALE")}
        >
          <img src={FemaleIcon} className="w-12 h-12" />
          <div className="text-white group-hover:text-black font-bold text-2xl px-2">
            Female
          </div>
          <img src={IconCoin} className="w-8 h-8" />
        </div>
      </div>
    </Dialog>
  );
}

export default SelectCGenderComponent;
