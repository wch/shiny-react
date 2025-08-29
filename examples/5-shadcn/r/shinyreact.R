library(shiny)

# Bare page without default Shiny styling
barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}

# Custom renderer for arbitrary JSON data
renderObject <- function(expr, env = parent.frame(), quoted = FALSE, outputArgs = list()) {
  func <- installExprFunction(expr, "func", env, quoted, label = "renderObject")
  createRenderFunction(
    func,
    function(value, session, name, ...) { value },
    function(...) { stop("Not implemented") },
    outputArgs
  )
}