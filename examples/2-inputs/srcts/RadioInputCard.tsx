import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React from "react";
import InputOutputCard from "./InputOutputCard";

function RadioInputCard() {
  const [radioIn, setRadioIn] = useShinyInput<string>("radioin", "option1");
  const [radioOut, _] = useShinyOutput<string>("radioout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioIn(event.target.value);
  };

  return (
    <InputOutputCard
      title='Radio Button Input'
      inputElement={
        <div className='radio-group'>
          <label className='radio-label'>
            <input
              type='radio'
              name='radio-options'
              value='option1'
              checked={radioIn === "option1"}
              onChange={handleInputChange}
              className='radio-input'
            />
            Option 1
          </label>
          <label className='radio-label'>
            <input
              type='radio'
              name='radio-options'
              value='option2'
              checked={radioIn === "option2"}
              onChange={handleInputChange}
              className='radio-input'
            />
            Option 2
          </label>
          <label className='radio-label'>
            <input
              type='radio'
              name='radio-options'
              value='option3'
              checked={radioIn === "option3"}
              onChange={handleInputChange}
              className='radio-input'
            />
            Option 3
          </label>
        </div>
      }
      outputValue={radioOut}
    />
  );
}

export default RadioInputCard;
