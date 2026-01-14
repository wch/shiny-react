import { ShinyModuleProvider } from "@posit/shiny-react";
import CounterWidget from "./CounterWidget";

function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Shiny Module Namespace Demo</h1>
        <p className="subtitle">
          Three independent counter widgets, each in its own namespace
        </p>
      </header>

      <div className="widgets-grid">
        <ShinyModuleProvider namespace="counter1">
          <CounterWidget label="Counter 1" />
        </ShinyModuleProvider>

        <ShinyModuleProvider namespace="counter2">
          <CounterWidget label="Counter 2" />
        </ShinyModuleProvider>

        <ShinyModuleProvider namespace="counter3">
          <CounterWidget label="Counter 3" />
        </ShinyModuleProvider>
      </div>

      <div className="info-section">
        <h2>How It Works</h2>
        <p>
          Each counter widget is wrapped in a <code>ShinyModuleProvider</code>{" "}
          with a unique namespace. This allows multiple instances of the same
          component to operate independently without ID conflicts.
        </p>
        <ul>
          <li>
            <strong>Counter 1</strong> uses namespace <code>counter1</code>
          </li>
          <li>
            <strong>Counter 2</strong> uses namespace <code>counter2</code>
          </li>
          <li>
            <strong>Counter 3</strong> uses namespace <code>counter3</code>
          </li>
        </ul>
        <p>
          On the server side, Shiny modules automatically namespace the outputs
          and messages, keeping each widget's state completely separate.
        </p>
      </div>
    </div>
  );
}

export default App;
