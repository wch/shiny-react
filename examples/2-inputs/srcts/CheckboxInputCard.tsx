import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React from "react";
import InputOutputCard from "./InputOutputCard";

function CheckboxInputCard() {
  const [checkboxIn, setCheckboxIn] = useShinyInput<boolean>(
    "checkboxin",
    false
  );
  const [checkboxOut, _] = useShinyOutput<boolean>("checkboxout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCheckboxIn(event.target.checked);
  };

  return (
    <InputOutputCard
      title='Checkbox Input'
      inputElement={
        <div>
          <label>
            <input
              id='checkbox-input'
              type='checkbox'
              checked={checkboxIn}
              onChange={handleInputChange}
              className='checkbox-input'
            />
            Enable feature
          </label>
        </div>
      }
      outputValue={checkboxOut}
    />
  );
}

export default CheckboxInputCard;
