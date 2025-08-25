import React from "react";
import { ImageOutput } from "shiny-react";
import Card from "./Card";

function PlotCard() {
  return (
    <Card title="Plot output">
      <div className="plot-section">
        <div className="plot-container">
          <ImageOutput id="plot1" className="data-plot" />
        </div>
      </div>
    </Card>
  );
}

export default PlotCard;
