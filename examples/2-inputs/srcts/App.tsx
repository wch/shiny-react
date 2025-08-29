import React from "react";
import TextInputCard from "./TextInputCard";
import NumberInputCard from "./NumberInputCard";
import CheckboxInputCard from "./CheckboxInputCard";
import RadioInputCard from "./RadioInputCard";
import SelectInputCard from "./SelectInputCard";
import SliderInputCard from "./SliderInputCard";
import DateInputCard from "./DateInputCard";
import ButtonInputCard from "./ButtonInputCard";
import BatchFormCard from "./BatchFormCard";

function App() {
  return (
    <div className="app-container">
      <h1>Shiny React Input Examples</h1>
      <div className="cards-wrap">
        <TextInputCard />
        <NumberInputCard />
        <CheckboxInputCard />
        <RadioInputCard />
        <SelectInputCard />
        <SliderInputCard />
        <DateInputCard />
        <ButtonInputCard />
        <BatchFormCard />
      </div>
    </div>
  );
}

export default App;
