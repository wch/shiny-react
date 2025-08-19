#' Shiny React Dependency
#'
#' HTML dependency for the shiny-react JavaScript library.
#'
#' @return An htmltools HTML dependency object
#' @export
#' @examples
#' \dontrun{
#' ui <- fluidPage(
#'   shinyReactDependency(),
#'   div(id = "react-root")
#' )
#' }
shinyReactDependency <- function() {
  htmltools::htmlDependency(
    name = "shiny-react",
    version = utils::packageVersion("shinyreact"),
    src = c(file = system.file("www", package = "shinyreact")),
    script = list(src = "shiny-react.js", type = "module"),
    all_files = FALSE
  )
}

#' Create a React Component Container
#'
#' Creates a div element with the shiny-react dependency for mounting React components.
#'
#' @param id The element ID for the React root
#' @param ... Additional attributes to pass to the div
#' @return An HTML tag with the shiny-react dependency
#' @export
#' @examples
#' \dontrun{
#' ui <- fluidPage(
#'   reactComponent("my-react-app")
#' )
#' }
reactComponent <- function(id = "react-root", ...) {
  htmltools::tagList(
    shinyReactDependency(),
    htmltools::div(id = id, ...)
  )
}