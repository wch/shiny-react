import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function SliderInputCard() {
  const [sliderIn, setSliderIn] = useShinyInput<number>("sliderin", 50);
  const sliderOut = useShinyOutput<number>("sliderout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSliderIn(Number(event.target.value));
  };

  return (
    <InputOutputCard
      title="Slider Input"
      inputElement={
        <div>
          <label>Adjust the slider (0-100):</label>
          <input
            type="range"
            min="0"
            max="100"
            value={sliderIn}
            onChange={handleInputChange}
            className="slider-input"
          />
          <div className="slider-value">Current value: {sliderIn}</div>
        </div>
      }
      outputValue={sliderOut}
    />
  );
}

export default SliderInputCard;