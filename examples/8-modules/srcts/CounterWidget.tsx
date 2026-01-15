import { useState } from "react";
import {
  useShinyInput,
  useShinyOutput,
  useShinyMessageHandler,
} from "@posit/shiny-react";

interface CounterWidgetProps {
  label: string;
}

function CounterWidget({ label }: CounterWidgetProps) {
  const [count, setCount] = useShinyInput("count", 0);
  const [serverCount] = useShinyOutput<number>("serverCount", 0);
  const [notification, setNotification] = useState<string | null>(null);

  useShinyMessageHandler<{ message: string }>("notification", (data) => {
    setNotification(data.message);
    setTimeout(() => setNotification(null), 3000);
  });

  return (
    <div className="counter-widget">
      <h3>{label}</h3>
      <div className="counter-content">
        <div className="counter-display">
          <div className="counter-value">
            <span className="label">Client count:</span>
            <span className="value">{count}</span>
          </div>
          <div className="counter-value">
            <span className="label">Server doubled:</span>
            <span className="value">{serverCount}</span>
          </div>
        </div>
        <button className="increment-button" onClick={() => setCount(count + 1)}>
          Increment
        </button>
        {notification && (
          <div className="notification">{notification}</div>
        )}
      </div>
    </div>
  );
}

export default CounterWidget;
