import { useState, useEffect, useRef } from "react";

interface PanelConfig {
  id: string;
  title: string;
  icon: string | null;
}

interface SidebarLayoutProps {
  title: string | null;
  panels: PanelConfig[];
  collapsible: boolean;
  defaultOpen: boolean;
  position: 'left' | 'right';
  width: string;
  onPanelMount: (panelId: string, containerEl: HTMLElement | null) => void;
}

export function SidebarLayout({
  title,
  panels,
  collapsible,
  defaultOpen,
  position,
  width,
  onPanelMount,
}: SidebarLayoutProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activePanel, setActivePanel] = useState(panels[0]?.id || '');
  const panelRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const mountedPanels = useRef<Set<string>>(new Set());

  useEffect(() => {
    panels.forEach(panel => {
      if (!mountedPanels.current.has(panel.id)) {
        const containerEl = panelRefs.current.get(panel.id);
        if (containerEl) {
          onPanelMount(panel.id, containerEl);
          mountedPanels.current.add(panel.id);
        }
      }
    });
  }, [panels, onPanelMount]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="sidebar-layout"
      data-position={position}
      data-open={isOpen}
    >
      <aside className="sidebar" style={{ width: isOpen ? width : '60px' }}>
        {title && (
          <div className="sidebar-header">
            {isOpen && <span className="sidebar-title">{title}</span>}
            {collapsible && (
              <button
                className="sidebar-collapse-btn"
                onClick={toggleSidebar}
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  {position === 'left' ? (
                    isOpen ? (
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    ) : (
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    )
                  ) : (
                    isOpen ? (
                      <path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                    ) : (
                      <path d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" />
                    )
                  )}
                </svg>
              </button>
            )}
          </div>
        )}
        <nav className="sidebar-nav">
          {panels.map(panel => (
            <button
              key={panel.id}
              className={`sidebar-nav-item ${activePanel === panel.id ? 'active' : ''}`}
              onClick={() => setActivePanel(panel.id)}
              title={!isOpen ? panel.title : undefined}
            >
              {panel.icon && (
                <span
                  className="sidebar-nav-icon"
                  dangerouslySetInnerHTML={{ __html: panel.icon }}
                />
              )}
              {isOpen && <span className="sidebar-nav-label">{panel.title}</span>}
            </button>
          ))}
        </nav>
      </aside>
      <main className="sidebar-content">
        {panels.map(panel => (
          <div
            key={panel.id}
            ref={el => {
              panelRefs.current.set(panel.id, el);
            }}
            className={`sidebar-panel ${activePanel === panel.id ? 'active' : ''}`}
          />
        ))}
      </main>
    </div>
  );
}
