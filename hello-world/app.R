library(shiny)
library(htmltools)

shinyReactDependency <- function() {
  htmlDependency(
    name = "shinyreact-hello-world",
    version = "1.0.0",
    src = c(file = "../dist/hello-world"),
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
    req(input$txtin)
    paste("Value of input$txtin():", input$txtin)
  })
}

shinyApp(ui = ui, server = server)
