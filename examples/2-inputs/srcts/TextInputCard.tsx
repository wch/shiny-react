import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function TextInputCard() {
  const [txtin, setTxtin] = useShinyInput<string>("txtin", "Hello, world!");
  const txtout = useShinyOutput<string>("txtout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxtin(event.target.value);
  };

  return (
    <InputOutputCard
      title="Text Input"
      inputElement={
        <input
          type="text"
          value={txtin}
          onChange={handleInputChange}
          placeholder="Enter your message here..."
        />
      }
      outputValue={txtout}
    />
  );
}

export default TextInputCard;
