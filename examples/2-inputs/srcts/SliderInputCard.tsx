import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";
import InputOutputCard from "./InputOutputCard";

function SliderInputCard() {
  // Note that debounce has been set to 0, so that the value is sent immediately.
  const [sliderIn, setSliderIn] = useShinyInput<number>("sliderin", 50, {
    debounceMs: 0,
  });
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
          <div
            className="debounce-info"
            style={{ fontSize: "0.8em", color: "#666", marginTop: "4px" }}
          >
            Note: Debounce is set to 0ms for immediate updates
          </div>
        </div>
      }
      outputValue={sliderOut}
    />
  );
}

export default SliderInputCard;
