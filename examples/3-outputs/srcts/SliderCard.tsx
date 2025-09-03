import { useShinyInput } from "@posit/shiny-react";
import React from "react";
import Card from "./Card";

function SliderCard() {
  const [rowCount, setRowCount] = useShinyInput<number>("table_rows", 4);

  return (
    <Card title='Data Control'>
      <div className='input-section'>
        <label htmlFor='row-slider'>Number of rows to load: {rowCount}</label>
        <input
          id='row-slider'
          type='range'
          min='1'
          max='32'
          value={rowCount}
          onChange={(e) => setRowCount(parseInt(e.target.value))}
          className='slider'
        />
      </div>
    </Card>
  );
}

export default SliderCard;
