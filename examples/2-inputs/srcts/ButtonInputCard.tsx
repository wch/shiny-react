import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function ButtonInputCard() {
  const [buttonIn, setButtonIn] = useShinyInput<null | object>(
    "buttonin",
    null,
    {
      // This makes it so there's no delay to sending the value when the button
      // is clicked.
      debounceMs: 0,
      // This makes it so that even if the input value is the same as the
      // previous, it will still cause invalidation of reactive functions on the
      // server.
      priority: "event",
    }
  );
  const buttonOut = useShinyOutput<string>("buttonout", undefined);

  const handleButtonClick = () => {
    setButtonIn({});
  };

  return (
    <InputOutputCard
      title='Button Input'
      inputElement={
        <div>
          <button
            type='button'
            onClick={handleButtonClick}
            className='button-input'
          >
            Click Me
          </button>
          <div className='button-value'>
            Button sends: {JSON.stringify(buttonIn)}
          </div>
          <div className='note'>
            Note: useShinyInput is called with priority:"event" so that even
            though the same value (an empty object) is sent every time the
            button is clicked, it will still cause reactive invalidation on the
            server.
          </div>
        </div>
      }
      outputValue={buttonOut ? buttonOut : "undefined"}
    />
  );
}

export default ButtonInputCard;
