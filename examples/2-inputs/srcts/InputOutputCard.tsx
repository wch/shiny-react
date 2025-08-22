import React from "react";
import Card from "./Card";

interface InputOutputCardProps {
  title: string;
  inputElement: React.ReactNode;
  outputValue: React.ReactNode;
}

function InputOutputCard({
  title,
  inputElement,
  outputValue,
}: InputOutputCardProps) {
  return (
    <Card title={title}>
      <div className="input-output-container">
        <div className="input-group">{inputElement}</div>
        <div className="output-section">
          <div className="output-label">Server response:</div>
          <div className="output-content">{outputValue}</div>
        </div>
      </div>
    </Card>
  );
}

export default InputOutputCard;
