library(shiny)

page_bare <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}

page_react <- function(
  ...,
  title = NULL,
  js_file = "main.js",
  css_file = "main.css",
  lang = "en"
) {
  page_bare(
    title = title,
    tags$head(
      if (!is.null(js_file)) tags$script(src = js_file, type = "module"),
      if (!is.null(css_file)) tags$link(href = css_file, rel = "stylesheet")
    ),
    tags$div(id = "root"),
    ...
  )
}


#' Reactively render arbitrary JSON object data.
#'
#' This is a generic renderer that can be used to render any Jsonifiable data.
#' The data goes through shiny:::toJSON() before being sent to the client.
render_json <- function(
  expr,
  env = parent.frame(),
  quoted = FALSE,
  outputArgs = list(),
  sep = " "
) {
  func <- installExprFunction(
    expr,
    "func",
    env,
    quoted,
    label = "render_json"
  )

  createRenderFunction(
    func,
    function(value, session, name, ...) {
      value
    },
    function(...) {
      stop("Not implemented")
    },
    outputArgs
  )
}

#' Send a custom message to the client
#'
#' A convenience function for sending custom messages from the Shiny server to
#' React components using useShinyMessageHandler() hook. This wraps messages in a
#' standard format and sends them via the "shinyReactMessage" channel.
#'
#' When called from within a Shiny module, the message type is automatically
#' namespaced using session$ns() to match the React component's namespace.
#'
#' @param session The Shiny session object
#' @param type The message type (should match messageType in useShinyMessageHandler)
#' @param data The data to send to the client
post_message <- function(session, type, data) {
  # Apply namespace to message type using session$ns()
  # session$ns() returns the ID unchanged if not in a module context
  namespaced_type <- session$ns(type)

  session$sendCustomMessage(
    "shinyReactMessage",
    list(
      type = namespaced_type,
      data = data
    )
  )
}

#' Create a React navigation panel
#'
#' Wraps Shiny content for a navigation panel in a React sidebar layout.
#' The panel content is initially hidden and shown by React when the panel
#' is activated.
#'
#' @param title The display title for the navigation panel
#' @param ... Shiny UI elements to display in the panel
#' @param icon Optional icon for the panel. Can be bsicons::bs_icon() or
#'   fontawesome::fa() which renders to SVG string
#' @param value The value/ID for this panel (defaults to title)
#' @return A div tag with appropriate data attributes for React integration
react_nav_panel <- function(title, ..., icon = NULL, value = title) {
  # icon can be bsicons::bs_icon() or fontawesome::fa() - renders to SVG string
  icon_svg <- if (!is.null(icon)) {
    if (inherits(icon, "shiny.tag")) as.character(icon) else icon
  } else {
    NULL
  }

  div(
    `data-slot` = value,
    `data-panel-title` = title,
    `data-panel-icon` = icon_svg,
    class = "react-sidebar-panel-content",
    style = "display: none;", # Hidden until React takes over
    ...
  )
}

#' Create a React sidebar layout
#'
#' Creates a custom element that combines React-based navigation with Shiny
#' content panels. The sidebar navigation is rendered by React while panel
#' content is pure Shiny UI.
#'
#' @param ... react_nav_panel() elements defining the sidebar panels
#' @param id Optional ID for the layout container
#' @param title Optional title to display in the sidebar header
#' @param collapsible Whether the sidebar can be collapsed (default: TRUE)
#' @param default_open Whether sidebar starts open (default: TRUE)
#' @param position Sidebar position: "left" or "right" (default: "left")
#' @param width Sidebar width when open (default: "250px")
#' @return A custom element tag containing the sidebar layout
react_sidebar_layout <- function(
  ...,
  id = NULL,
  title = NULL,
  collapsible = TRUE,
  default_open = TRUE,
  position = "left",
  width = "250px"
) {
  panels <- list(...)

  # Extract panel metadata for React
  panel_config <- lapply(panels, function(p) {
    list(
      id = p$attribs$`data-slot`,
      title = p$attribs$`data-panel-title`,
      icon = p$attribs$`data-panel-icon`
    )
  })

  tagList(
    tags$head(
      tags$script(src = "sidebar.js", type = "module"),
      tags$link(href = "sidebar.css", rel = "stylesheet")
    ),
    tag(
      "react-sidebar-layout",
      list(
        id = id,
        `data-title` = title,
        `data-panels` = jsonlite::toJSON(panel_config, auto_unbox = TRUE),
        `data-collapsible` = tolower(as.character(collapsible)),
        `data-default-open` = tolower(as.character(default_open)),
        `data-position` = position,
        `data-width` = width,
        class = "react-sidebar-layout-container",
        style = "display: flex; height: 100%; width: 100%;",
        panels # Shiny content as children
      )
    )
  )
}
