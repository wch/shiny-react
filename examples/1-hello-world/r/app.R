library(shiny)

source("shinyreact.R", local = TRUE)

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
    toupper(input$txtin)
  })
}

shinyApp(ui = ui, server = server)
