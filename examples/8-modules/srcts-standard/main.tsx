import { ShinyReactComponentElement } from "@posit/shiny-react";
import { CounterWidget } from "./CounterWidget";
import "./styles.css";

class CounterWidgetElement extends ShinyReactComponentElement {
  static component = CounterWidget;
}

if (!customElements.get("counter-widget")) {
    customElements.define("counter-widget", CounterWidgetElement);
}
