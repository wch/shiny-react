import React from "react";
import TextInputCard from "./TextInputCard";
import NumberInputCard from "./NumberInputCard";
import CheckboxInputCard from "./CheckboxInputCard";
import RadioInputCard from "./RadioInputCard";
import SelectInputCard from "./SelectInputCard";
import SliderInputCard from "./SliderInputCard";

function HelloWorldComponent() {
  return (
    <div className="app-container">
      <h1>Shiny React Input Examples</h1>
      <div className="cards-grid">
        <TextInputCard />
        <NumberInputCard />
        <CheckboxInputCard />
        <RadioInputCard />
        <SelectInputCard />
        <SliderInputCard />
      </div>
    </div>
  );
}

export default HelloWorldComponent;
