import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function DateInputCard() {
  // Get today's date as default in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  
  const [dateIn, setDateIn] = useShinyInput<string>("datein", today);
  const dateOut = useShinyOutput<string>("dateout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDateIn(event.target.value);
  };

  return (
    <InputOutputCard
      title="Date Input"
      inputElement={
        <div>
          <label>Select a date:</label>
          <input
            type="date"
            value={dateIn}
            onChange={handleInputChange}
            className="date-input"
          />
          <div className="date-value">Selected date: {dateIn}</div>
        </div>
      }
      outputValue={dateOut}
    />
  );
}

export default DateInputCard;