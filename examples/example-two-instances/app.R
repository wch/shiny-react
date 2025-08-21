library(shiny)
library(htmltools)

shinyReactDependency <- function() {
  htmlDependency(
    name = "shinyreact-example",
    version = "1.0.0",
    src = c(file = "../../dist/example"),
    script = list(src = "main.js", type = "module"),
    stylesheet = list(href = "main.css")
  )
}

barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}


ui <- barePage(
  title = "Example with two React app instances",
  shinyReactDependency(),
  tags$p(
    "This app has two separate React app instances which both use the same Shiny input value, `txtin`.",
    style = "padding: 1rem;"
  ),
  tags$div(id = "root"),
  tags$div(id = "root2")
)

server <- function(input, output, session) {
  output$txtout <- renderText({
    if (is.null(input$txtin)) {
      return("")
    }
    paste(rev(strsplit(input$txtin, "")[[1]]), collapse = "")
  })
}

shinyApp(ui = ui, server = server)
