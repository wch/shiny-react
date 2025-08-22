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
    toupper(input$txtin)
  })

  output$numberout <- renderText({
    input$numberin
  })

  output$checkboxout <- renderText({
    input$checkboxin
  })

  output$radioout <- renderText({
    input$radioin
  })

  output$selectout <- renderText({
    input$selectin
  })

  output$sliderout <- renderText({
    input$sliderin
  })

  output$dateout <- renderText({
    input$datein
  })

  output$buttonout <- renderText({
    input$buttonin
  })
}

shinyApp(ui = ui, server = server)
