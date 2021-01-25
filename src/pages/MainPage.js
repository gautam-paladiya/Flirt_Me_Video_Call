import React, { useState } from "react";
import QrReader from "react-qr-reader";

function MainPage() {
  const initialState = {
    result: "No results",
  };

  const [state, setstate] = useState(initialState);

  const handleScan = (data) => {
    if (data) {
      setstate({ result: data });
    }
  };
  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div>
      <QrReader
        delay={300}
        onError={handleError}
        onScan={handleScan}
        className="w-32 h-full"
      />
      <p className="text-lg font-bold text-red-400">{state.result}</p>
    </div>
  );
}

export default MainPage;
