import React from "react";
import BatchFormCard from "./BatchFormCard";
import ButtonInputCard from "./ButtonInputCard";
import CheckboxInputCard from "./CheckboxInputCard";
import DateInputCard from "./DateInputCard";
import NumberInputCard from "./NumberInputCard";
import RadioInputCard from "./RadioInputCard";
import SelectInputCard from "./SelectInputCard";
import SliderInputCard from "./SliderInputCard";
import TextInputCard from "./TextInputCard";

function App() {
  return (
    <div className='app-container'>
      <h1>Shiny React Input Examples</h1>
      <div className='cards-wrap'>
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
