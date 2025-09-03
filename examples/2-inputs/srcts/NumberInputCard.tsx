import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React from "react";
import InputOutputCard from "./InputOutputCard";

function NumberInputCard() {
  const [numberIn, setNumberIn] = useShinyInput<number>("numberin", 42);
  const numberOut = useShinyOutput<number>("numberout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumberIn(Number(event.target.value));
  };

  return (
    <InputOutputCard
      title='Number Input'
      inputElement={
        <input
          type='number'
          value={numberIn}
          onChange={handleInputChange}
          min='0'
          max='100'
          step='1'
        />
      }
      outputValue={numberOut}
    />
  );
}

export default NumberInputCard;
