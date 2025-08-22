import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function ButtonInputCard() {
  const [buttonIn, setButtonIn] = useShinyInput<number>("buttonin", 0);
  const buttonOut = useShinyOutput<string>("buttonout", undefined);

  const handleButtonClick = () => {
    console.log("button clicked");
    setButtonIn(buttonIn + 1);
  };

  return (
    <InputOutputCard
      title="Button Input"
      inputElement={
        <div>
          <button
            type="button"
            onClick={handleButtonClick}
            className="button-input"
          >
            Click Me
          </button>
          <div className="button-value">Button sends: {buttonIn}</div>
        </div>
      }
      outputValue={buttonOut ? buttonOut : "undefined"}
    />
  );
}

export default ButtonInputCard;
