import React from "react";
import { FaSkullCrossbones } from "react-icons/fa";
import MaleIcon from "../../assets/images/malel.png";
import FemaleIcon from "../../assets/images/femalel.png";
import GenOIcon from "../../assets/images/genderO.png";
import { Card, Modal } from "react-bootstrap";

const list = [
  {
    icon: MaleIcon,
    text: "MALE",
  },
  {
    icon: FemaleIcon,
    text: "FEMALE",
  },
  {
    icon: GenOIcon,
    text: "OTHER",
  },
];

function SelectGenderComponent(props) {
  const { display, onClose, onSelectGender } = props;

  return (
    <Modal show={display} onHide={onClose} size="sm">
      <Modal.Header closeButton>
        <Modal.Title>Select your gender type</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {list.map(({ icon, text }) => (
          <Card
            key={text}
            className=""
            onClick={() => onSelectGender(text)}
            className="m-3 "
          >
            <div className="p-2 flex items-center justify-start cursor-pointer hover:bg-gray-300">
              <img src={icon} className="w-16 h-14 object-cover" />
              <h1 className="text-2xl font-bold text-indigo-500 ml-3 font-Love">
                {text}
              </h1>
            </div>
          </Card>
        ))}
      </Modal.Body>
    </Modal>
  );
}

export default SelectGenderComponent;
