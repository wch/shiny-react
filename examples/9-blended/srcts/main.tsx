import { ShinyReactComponentElement } from "@posit/shiny-react";
import { SidebarLayout } from "./SidebarLayout";
import "./styles.css";

interface PanelConfig {
  id: string;
  title: string;
  icon: string | null;
}

class ReactSidebarLayoutElement extends ShinyReactComponentElement {
  protected render() {
    const config = this.getConfig();
    return (
      <SidebarLayout
        title={(config.title as string) || null}
        panels={(config.panels as PanelConfig[]) || []}
        collapsible={config.collapsible !== false}
        defaultOpen={config.defaultOpen !== false}
        position={(config.position as "left" | "right") || "left"}
        width={(config.width as string) || "250px"}
        onPanelMount={this.onSlotMount}
      />
    );
  }
}

if (!customElements.get("react-sidebar-layout")) {
  customElements.define("react-sidebar-layout", ReactSidebarLayoutElement);
}
