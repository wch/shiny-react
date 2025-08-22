import React from "react";
import { useShinyInput, useShinyOutput } from "shiny-react";

function HelloWorldComponent() {
  const [txtin, setTxtin] = useShinyInput<string>("txtin", "Hello, world!");

  const txtout = useShinyOutput<string>("txtout", undefined);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTxtin(event.target.value);
  };

  return (
    <div className="card">
      <h1>Hello Shiny React!</h1>
      <hr />
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

export default HelloWorldComponent;
