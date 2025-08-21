library(shiny)
library(htmltools)

barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}


# Load the shinyreact package (will need to install/load it first)
# For now, we'll use the local dependency function until the package is built
shinyReactDependency <- function() {
  htmlDependency(
    name = "shiny-react-hello-world",
    version = "1.0.0",
    src = c(file = "../dist/"),
    script = list(src = "main.js", type = "module")
  )
}

ui <- barePage(
  title = "Hello Shiny React",
  shinyReactDependency(),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  output$txtout <- renderText({
    paste("Value of input$txtin():", input$txtin)
  })
}

shinyApp(ui = ui, server = server)
