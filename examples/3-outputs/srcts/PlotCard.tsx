import { ImageOutput } from "@posit/shiny-react";
import React from "react";
import Card from "./Card";

function PlotCard() {
  return (
    <Card title='Plot output'>
      <div className='plot-section'>
        <div className='plot-container'>
          <ImageOutput id='plot1' className='data-plot' />
        </div>
      </div>
    </Card>
  );
}

export default PlotCard;
