library(shiny)

source("utils.R", local = TRUE)

ui <- barePage(
  title = "Hello Shiny React",
  # shinyReactDependency(),
  tags$head(
    tags$script(src = "main.js", type = "module"),
    tags$link(href = "main.css", rel = "stylesheet")
  ),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  output$txtout <- renderText({
    paste("Value of input$txtin():", input$txtin)
  })
}

shinyApp(ui = ui, server = server)
