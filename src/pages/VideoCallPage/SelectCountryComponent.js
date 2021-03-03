import { Dialog, Divider } from "@material-ui/core";
import React from "react";
import { countries, getEmojiFlag, getUnicode } from "countries-list";

function SelectCountryComponent(props) {
  const { display, onClose, setCountrySelect } = props;

  console.log(`cu ${JSON.stringify(countries.AE.emojiU)}`);
  return (
    <Dialog open={display} onClose={onClose}>
      <div className="grid grid-cols-2 gap-0 lg:grid-cols-3 ">
        {Object.entries(countries).map((k, v) => (
          <div
            className="flex  justify-start items-center space-x-3 p-1 cursor-pointer hover:bg-gray-400 hover:text-white"
            onClick={() => setCountrySelect(k[0])}
          >
            <div className={`flag:${k[0]} w-10 h-6`}></div>
            <div className="text-lg font-bold line-clamp-1">{k[1].name}</div>
            <Divider />
          </div>
        ))}
      </div>
    </Dialog>
  );
}

export default SelectCountryComponent;
