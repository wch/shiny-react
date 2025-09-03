library(shiny)

barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}

page_react_app <- function(
  ...,
  title = NULL,
  js_file = "main.js",
  css_file = "main.css",
  lang = "en"
) {
  barePage(
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
#' It sends the data to the client-side and let the client-side code handle the
#' rendering.
renderObject <- function(
  expr,
  env = parent.frame(),
  quoted = FALSE,
  outputArgs = list(),
  sep = " "
) {
  func <- installExprFunction(expr, "func", env, quoted, label = "renderObject")

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
