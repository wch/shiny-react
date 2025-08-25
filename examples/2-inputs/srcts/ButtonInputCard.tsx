import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function ButtonInputCard() {
  const [buttonIn, setButtonIn] = useShinyInput<null | object>(
    "buttonin",
    null,
    {
      debounceMs: 0,
      priority: "event",
    }
  );
  const buttonOut = useShinyOutput<string>("buttonout", undefined);

  const handleButtonClick = () => {
    setButtonIn({});
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
          <div className="button-value">
            Button sends: {JSON.stringify(buttonIn)}
          </div>
          <div style={{ fontSize: "0.8em", color: "#666", marginTop: "4px" }}>
            Note: useShinyInput is called with priority:"event" so that even
            though the value (an empty object) is sent every time the button is
            clicked, it will still cause reactive invalidation on the server.
          </div>
        </div>
      }
      outputValue={buttonOut ? buttonOut : "undefined"}
    />
  );
}

export default ButtonInputCard;
