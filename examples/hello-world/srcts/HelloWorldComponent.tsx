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
      <div className="input-group">
        <label>Type something to send to Shiny server:</label>
        <input
          type="text"
          value={txtin}
          onChange={handleInputChange}
          placeholder="Enter your message here..."
        />
      </div>
      <hr />
      <div className="output-section">
        <label className="output-label">Response from Shiny server:</label>
        <div className="output-content">{txtout}</div>
      </div>
    </div>
  );
}

export default HelloWorldComponent;
