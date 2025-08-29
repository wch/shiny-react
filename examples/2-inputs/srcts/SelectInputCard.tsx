import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function SelectInputCard() {
  const [selectIn, setSelectIn] = useShinyInput<string>("selectin", "apple");
  const selectOut = useShinyOutput<string>("selectout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectIn(event.target.value);
  };

  return (
    <InputOutputCard
      title='Select Input'
      inputElement={
        <select
          value={selectIn}
          onChange={handleInputChange}
          className='select-input'
        >
          <option value='apple'>Apple</option>
          <option value='banana'>Banana</option>
          <option value='orange'>Orange</option>
          <option value='grape'>Grape</option>
          <option value='mango'>Mango</option>
        </select>
      }
      outputValue={selectOut}
    />
  );
}

export default SelectInputCard;
