import { useShinyMessageHandler } from "@posit/shiny-react";
import React, { useState } from "react";

interface ToastMessage {
  id: number;
  message: string;
  type: string;
}

function App() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Handle log events from the server using useShinyMessage hook
  useShinyMessageHandler(
    "logEvent",
    (msg: { text: string; category: string }) => {
      console.log("Received log event message:", msg);
      const newToast: ToastMessage = {
        id: Date.now(),
        message: msg.text,
        type: msg.category,
      };
      console.log(newToast);

      setToasts((prev) => [...prev, newToast]);

      // Remove toast after 6 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id));
      }, 6000);
    }
  );

  return (
    <div className='app-container'>
      <h1>Event Message Demo</h1>
      <div className='card'>
        <h2>Toast messages from server</h2>
        <div className='toast-container'>
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
