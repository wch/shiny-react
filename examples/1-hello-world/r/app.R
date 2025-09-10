library(shiny)

source("shinyreact.R", local = TRUE)

server <- function(input, output, session) {
  output$txtout <- render_json({
    toupper(input$txtin)
  })
}

shinyApp(ui = page_react(title = "Hello Shiny React"), server = server)
