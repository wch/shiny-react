import React from "react";
import { useShinyInput, useShinyOutput } from "../hooks/shiny";

function ExampleComponent() {
  const [txtin, setTxtin] = useShinyInput<string>("txtin", "Hello, world!");

  const txtout = useShinyOutput<string>("txtout", null);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxtin(event.target.value);
  };

  return (
    <div>
      <div>
        <label style={{ display: "block" }}>
          Text input value sent to Shiny (<code>input.txtin</code>):{" "}
        </label>
        <input type="text" value={txtin} onChange={handleInputChange} />
      </div>
      <hr />
      <div>
        <pre style={{ whiteSpace: "pre-wrap" }}>{txtout}</pre>
      </div>
    </div>
  );
}

export default ExampleComponent;
