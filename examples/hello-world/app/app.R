library(shiny)
library(htmltools)

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

ui <- bootstrapPage(
  # Use theme only here to load BS5, to make it look same as Python version
  theme = bslib::bs_theme(),
  shinyReactDependency(),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  output$txtout <- renderText({
    paste("Value of input$txtin():", input$txtin)
  })
}

shinyApp(ui = ui, server = server)
