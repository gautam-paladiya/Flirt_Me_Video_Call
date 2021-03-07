import React from "react";
import { countries, getEmojiFlag, getUnicode } from "countries-list";
import { Modal } from "react-bootstrap";

function SelectCountryComponent(props) {
  const { display, onClose, setCountrySelect } = props;

  console.log(`cu ${JSON.stringify(countries.AE.emojiU)}`);
  return (
    <Modal show={display} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Select Matching Country</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-2 gap-0 lg:grid-cols-3 ">
          {Object.entries(countries).map((k, v) => (
            <div
              key={v}
              className="flex  justify-start items-center space-x-3 p-1 cursor-pointer hover:bg-gray-400 hover:text-white"
              onClick={() => setCountrySelect(k[0])}
            >
              <div className={`flag:${k[0]} w-10 h-6`}></div>
              <div className="text-lg font-bold line-clamp-1 font-mono">
                {k[1].name}
              </div>
              {/* <Divide /> */}
            </div>
          ))}
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default SelectCountryComponent;
