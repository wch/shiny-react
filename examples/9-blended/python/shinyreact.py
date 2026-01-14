import json
from shiny import ui, render, Session
from htmltools import Tag, TagList, HTMLDependency


def page_bare(*args, title=None, lang=None):
    """Create a bare page with minimal dependencies."""
    jquery_dep = HTMLDependency(
        name="jquery",
        version="3.6.0",
        source={"href": "https://code.jquery.com"},
        script={"src": "jquery-3.6.0.min.js"}
    )

    elements = [jquery_dep]
    if title is not None:
        elements.append(ui.tags.head(ui.tags.title(title)))
    elements.extend(args)

    result = ui.TagList(*elements)
    if lang is not None:
        # Store lang attribute for potential HTML wrapper
        pass
    return result


def page_react(
    *args,
    title=None,
    js_file="main.js",
    css_file="main.css",
    lang="en"
):
    """Create a React-enabled page with script and style dependencies."""
    head_elements = []
    if js_file is not None:
        head_elements.append(ui.tags.script(src=js_file, type="module"))
    if css_file is not None:
        head_elements.append(ui.tags.link(href=css_file, rel="stylesheet"))

    return page_bare(
        ui.tags.head(*head_elements) if head_elements else None,
        ui.tags.div(id="root"),
        *args,
        title=title
    )


def render_json(func=None):
    """
    Reactively render arbitrary JSON object data.

    This is a generic renderer that can be used to render any JSON-serializable data.
    The data is converted to JSON before being sent to the client.

    Usage:
        @render_json
        def my_output():
            return {"key": "value", "number": 42}
    """
    if func is None:
        return lambda f: render_json(f)

    @render.ui
    def _render():
        return func()

    return _render


def post_message(session: Session, type: str, data):
    """
    Send a custom message to the client.

    A convenience function for sending custom messages from the Shiny server to
    React components using useShinyMessageHandler() hook. This wraps messages in a
    standard format and sends them via the "shinyReactMessage" channel.

    When called from within a Shiny module, the message type is automatically
    namespaced using session.ns() to match the React component's namespace.

    Args:
        session: The Shiny session object
        type: The message type (should match messageType in useShinyMessageHandler)
        data: The data to send to the client
    """
    # Apply namespace to message type using session.ns()
    # session.ns() returns the ID unchanged if not in a module context
    namespaced_type = session.ns(type)

    session.send_custom_message(
        "shinyReactMessage",
        {
            "type": namespaced_type,
            "data": data
        }
    )


def react_nav_panel(title, *args, icon=None, value=None):
    """
    Create a React navigation panel.

    Wraps Shiny content for a navigation panel in a React sidebar layout.
    The panel content is initially hidden and shown by React when the panel
    is activated.

    Args:
        title: The display title for the navigation panel
        *args: Shiny UI elements to display in the panel
        icon: Optional icon for the panel. Can be an icon object that renders to SVG string
        value: The value/ID for this panel (defaults to title)

    Returns:
        A div tag with appropriate data attributes for React integration
    """
    if value is None:
        value = title

    # icon can be an icon object - convert to string if it's a Tag
    icon_svg = None
    if icon is not None:
        if isinstance(icon, (Tag, TagList)):
            icon_svg = str(icon)
        else:
            icon_svg = icon

    attrs = {
        "data-panel-id": value,
        "data-panel-title": title,
        "class": "react-sidebar-panel-content",
        "style": "display: none;"  # Hidden until React takes over
    }

    if icon_svg is not None:
        attrs["data-panel-icon"] = icon_svg

    return ui.tags.div(
        *args,
        **attrs
    )


def react_sidebar_layout(
    *args,
    id=None,
    title=None,
    collapsible=True,
    default_open=True,
    position="left",
    width="250px"
):
    """
    Create a React sidebar layout.

    Creates a custom element that combines React-based navigation with Shiny
    content panels. The sidebar navigation is rendered by React while panel
    content is pure Shiny UI.

    Args:
        *args: react_nav_panel() elements defining the sidebar panels
        id: Optional ID for the layout container
        title: Optional title to display in the sidebar header
        collapsible: Whether the sidebar can be collapsed (default: True)
        default_open: Whether sidebar starts open (default: True)
        position: Sidebar position: "left" or "right" (default: "left")
        width: Sidebar width when open (default: "250px")

    Returns:
        A custom element tag containing the sidebar layout
    """
    panels = list(args)

    # Extract panel metadata for React
    panel_config = []
    for p in panels:
        if hasattr(p, 'attrs'):
            panel_config.append({
                "id": p.attrs.get("data-panel-id"),
                "title": p.attrs.get("data-panel-title"),
                "icon": p.attrs.get("data-panel-icon")
            })

    # Build attributes for custom element
    attrs = {
        "class": "react-sidebar-layout-container",
        "style": "display: flex; height: 100%; width: 100%;",
        "data-panels": json.dumps(panel_config),
        "data-collapsible": str(collapsible).lower(),
        "data-default-open": str(default_open).lower(),
        "data-position": position,
        "data-width": width
    }

    if id is not None:
        attrs["id"] = id

    if title is not None:
        attrs["data-title"] = title

    # Create the custom element
    custom_element = Tag(
        "react-sidebar-layout",
        attrs,
        *panels
    )

    return ui.TagList(
        ui.tags.head(
            ui.tags.script(src="sidebar.js", type="module"),
            ui.tags.link(href="sidebar.css", rel="stylesheet")
        ),
        custom_element
    )
