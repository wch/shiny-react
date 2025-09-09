import React from "react";
import Card from "./Card";

interface InputOutputCardProps {
  title: string;
  inputElement: React.ReactNode;
  outputValue: React.ReactNode;
  layout?: "horizontal" | "vertical";
}

function InputOutputCard({
  title,
  inputElement,
  outputValue,
  layout = "horizontal",
}: InputOutputCardProps) {
  const containerClass = layout === "vertical" 
    ? 'input-output-container-vertical' 
    : 'input-output-container';
    
  return (
    <Card title={title}>
      <div className={containerClass}>
        <div className='input-group'>{inputElement}</div>
        <div className='output-section'>
          <div className='output-label'>Server response:</div>
          <div className='output-content'>{outputValue}</div>
        </div>
      </div>
    </Card>
  );
}

export default InputOutputCard;
