import React, { useState, useEffect } from "react";

interface ToastMessage {
  id: number;
  message: string;
  type: string;
}

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    console.log("useEffect");
    const handleLogEvent = (msg: { message: string; type: string }) => {
      console.log("Received log event:", msg);
      const newToast: ToastMessage = {
        id: Date.now(),
        message: msg.message,
        type: msg.type,
      };

      setToasts((prev) => [...prev, newToast]);

      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
      }, 6000);
    };

    // Register the custom message handler. When this is called more than once
    // for a given message type, only the most recent handler will be used.
    window.Shiny.addCustomMessageHandler("logEvent", handleLogEvent);
  }, []);

  return (
    <div className="app-container">
      <h1>Event Message Demo</h1>
      <div className="card">
        <h2>Toast messages from server</h2>
        <div className="toast-container">
          {toasts.map((toast) => (
            <div key={toast.id} className={`toast toast-${toast.type}`}>
              {toast.message}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
