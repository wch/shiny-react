import { useShinyInput, useShinyOutput } from "@posit/shiny-react";
import React, { useState } from "react";
import InputOutputCard from "./InputOutputCard";

function BatchFormCard() {
  // Local state (NOT Shiny inputs)
  const [comment, setComment] = useState("");
  const [priority, setPriority] = useState(50);
  const [features, setFeatures] = useState({
    authentication: false,
    notifications: false,
    darkMode: false,
    analytics: false,
  });

  // Shiny input/output for batch submission
  const [batchData, setBatchData] = useShinyInput<object | null>(
    "batchdata",
    null,
    {
      // This makes it so there's no delay to sending the value when the button
      // is clicked.
      debounceMs: 0,
      // This makes it so that even if the input value is the same as the
      // previous, it will still cause invalidation of reactive functions on the
      // server.
      priority: "event",
    }
  );
  const [batchOutput, _] = useShinyOutput<string>("batchout", "");

  const handleFeatureChange = (feature: keyof typeof features) => {
    setFeatures((prev) => ({
      ...prev,
      [feature]: !prev[feature],
    }));
  };

  const handleSubmit = () => {
    const formData = {
      comment,
      priority,
      features,
    };
    setBatchData(formData);
  };

  const selectedFeaturesCount = Object.values(features).filter(Boolean).length;

  const inputElement = (
    <div className='batch-form'>
      <div className='form-group'>
        <label>Comment:</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Enter your feedback or description...'
          rows={3}
        />
      </div>

      <div className='form-group'>
        <label>Priority: {priority}%</label>
        <input
          className='slider-input'
          type='range'
          min='0'
          max='100'
          value={priority}
          onChange={(e) => setPriority(Number(e.target.value))}
        />
      </div>

      <div className='form-group'>
        <label>Select Features:</label>
        <div className='checkbox-group'>
          {Object.entries(features).map(([feature, checked]) => (
            <label key={feature} className='checkbox-item'>
              <input
                type='checkbox'
                checked={checked}
                onChange={() =>
                  handleFeatureChange(feature as keyof typeof features)
                }
              />
              {feature.charAt(0).toUpperCase() + feature.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <div className='form-summary'>
        <small>
          Summary: {comment.length} characters, {priority}% priority,{" "}
          {selectedFeaturesCount} features selected
        </small>
      </div>

      <button
        onClick={handleSubmit}
        className='submit-button'
        disabled={!comment.trim()}
      >
        Submit Form Data
      </button>
      <div className='note'>
        Shiny input value is set only when the button is clicked, and it
        includes an aggregation of all of the values from above.
      </div>
    </div>
  );

  const outputElement = <pre className='batch-form-output'>{batchOutput}</pre>;

  return (
    <InputOutputCard
      title='Batch Form Submission'
      inputElement={inputElement}
      outputValue={outputElement}
    />
  );
}

export default BatchFormCard;
