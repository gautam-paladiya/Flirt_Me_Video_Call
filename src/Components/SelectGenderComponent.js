import React from "react";
import { FaSkullCrossbones } from "react-icons/fa";
import MaleIcon from "../assets/images/malel.png";
import FemaleIcon from "../assets/images/femalel.png";
import GenOIcon from "../assets/images/genderO.png";

function SelectGenderComponent() {
  return (
    <div className=" w-full h-full">
      <div className="flex flex-col items-center ">
        <h1 className="text-blue-600 text-2xl mb-4 font-bold">
          Select your gender
        </h1>
        <div className="flex flex-row items-center justify-start rounded-lg shadow-lg bg-gray-300 mx-3 my-1 p-1 w-full hover:bg-gray-400">
          <img src={MaleIcon} className="w-16 h-14 object-cover" />
          <h1 className="text-lg font-bold text-black ">Male</h1>
        </div>
        <div className="flex flex-row items-center justify-start rounded-lg shadow-lg bg-gray-300 mx-3 my-1 p-1 w-full hover:bg-gray-400">
          <img src={FemaleIcon} className="w-16 h-14 object-cover" />
          <h1 className="text-lg font-bold text-black">Female</h1>
        </div>
        <div className="flex flex-row items-center justify-start rounded-lg shadow-lg bg-gray-300 mx-3 my-1 p-1 w-full hover:bg-gray-400">
          <img src={GenOIcon} className="w-16 h-14 object-fill" />
          <h1 className="text-lg font-bold text-black">Other</h1>
        </div>
      </div>
    </div>
  );
}

export default SelectGenderComponent;
