import { createRoot, Root } from "react-dom/client";
import { ShinyModuleProvider } from "@posit/shiny-react";
import { SidebarLayout } from "./SidebarLayout";
import "./styles.css";

interface PanelConfig {
  id: string;
  title: string;
  icon: string | null;
}

class ReactSidebarLayoutElement extends HTMLElement {
  private root: Root | null = null;
  private panelContents: Map<string, Node[]> = new Map();

  connectedCallback() {
    // 1. Capture panel content children before React renders
    const panelDivs = this.querySelectorAll('[data-panel-id]');
    panelDivs.forEach(div => {
      const panelId = div.getAttribute('data-panel-id')!;
      // Store the child nodes (the actual Shiny content)
      this.panelContents.set(panelId, Array.from(div.childNodes));
    });

    // 2. Parse configuration from attributes
    const config = {
      title: this.dataset.title || null,
      panels: JSON.parse(this.dataset.panels || '[]') as PanelConfig[],
      collapsible: this.dataset.collapsible !== 'false',
      defaultOpen: this.dataset.defaultOpen !== 'false',
      position: (this.dataset.position || 'left') as 'left' | 'right',
      width: this.dataset.width || '250px',
    };

    const namespace = this.id || undefined;

    // 3. Clear element and create React root
    this.innerHTML = '';
    this.root = createRoot(this);

    // 4. Render with callback to restore Shiny content
    const element = namespace ? (
      <ShinyModuleProvider namespace={namespace}>
        <SidebarLayout
          {...config}
          onPanelMount={this.handlePanelMount}
        />
      </ShinyModuleProvider>
    ) : (
      <SidebarLayout
        {...config}
        onPanelMount={this.handlePanelMount}
      />
    );

    this.root.render(element);
  }

  private handlePanelMount = (panelId: string, containerEl: HTMLElement | null) => {
    const content = this.panelContents.get(panelId);
    if (content && containerEl) {
      content.forEach(node => containerEl.appendChild(node));
      // Initialize Shiny bindings after content is moved
      if (window.Shiny?.bindAll) {
        window.Shiny.bindAll(containerEl);
      }
    }
  };

  disconnectedCallback() {
    // Unbind Shiny before unmounting
    if (window.Shiny?.unbindAll) {
      window.Shiny.unbindAll(this);
    }
    this.root?.unmount();
    this.root = null;
  }
}

customElements.define('react-sidebar-layout', ReactSidebarLayoutElement);
