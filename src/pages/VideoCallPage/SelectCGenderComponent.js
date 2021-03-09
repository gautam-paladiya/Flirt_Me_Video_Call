import React from "react";
import MaleIcon from "../../assets/images/malel.png";
import FemaleIcon from "../../assets/images/femalel.png";
import GenOIcon from "../../assets/images/genderO.png";
import IconCoin from "../../assets/images/coin.png";
import { Modal } from "react-bootstrap";

function SelectCGenderComponent(props) {
  const { onClose, display, selectCGender } = props;

  return (
    <Modal show={display} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title> Connect me to :</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="p-2 lg:p-5 overflow-hidden flex flex-col ">
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
      </Modal.Body>
    </Modal>
  );
}

export default SelectCGenderComponent;
