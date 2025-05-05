import { SketchPicker } from "react-color";
import React from "react";

import {
  makeReactInput,
  makeReactOutput,
} from "@posit-dev/shiny-bindings-react";

// Generates a new input binding that renders the supplied react component
// into the root of the webcomponent.
makeReactInput({
  name: "shiny-react-input",
  selector: "shiny-react-input",
  initialValue: "#fff",
  renderComp: ({ initialValue, updateValue }) => (
    <ColorPickerReact
      initialValue={initialValue}
      updateValue={(color) => updateValue(color)}
    />
  ),
});

// Color Picker React component
function ColorPickerReact({
  initialValue,
  updateValue,
}: {
  initialValue: string;
  updateValue: (x: string) => void;
}) {
  const [currentColor, setCurrentColor] = React.useState(initialValue);

  return (
    <SketchPicker
      color={currentColor}
      onChange={(color) => {
        setCurrentColor(color.hex);
        updateValue(color.hex);
      }}
    />
  );
}

makeReactOutput<{ value: string }>({
  name: "shiny-react-output",
  selector: "shiny-react-output",
  renderComp: ({ value }) => (
    <div
      style={{
        backgroundColor: value,
        border: "1px solid black",
        height: "100px",
        width: "100px",
      }}
    />
  ),
});
