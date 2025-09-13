library(shiny)

source("shinyreact.R", local = TRUE)

server <- function(input, output, session) {
  output$txtout <- render_json({
    toupper(input$txtin)
  })

  output$numberout <- render_json({
    input$numberin
  })

  output$checkboxout <- render_json({
    as.character(input$checkboxin)
  })

  output$radioout <- render_json({
    input$radioin
  })

  output$selectout <- render_json({
    input$selectin
  })

  output$sliderout <- render_json({
    input$sliderin
  })

  output$dateout <- render_json({
    input$datein
  })

  num_button_clicks <- 0
  output$buttonout <- render_json({
    # Take a reactive dependency on the button, and ignore starting null value
    if (is.null(input$buttonin)) {
      return()
    }
    num_button_clicks <<- num_button_clicks + 1
    num_button_clicks
  })

  output$fileout <- render_json({
    input$filein
  })

  output$batchout <- render_json({
    data <- input$batchdata
    if (is.null(data)) {
      return("No data submitted yet.")
    }
    data$receivedAt <- as.character(Sys.time())
    data
  })
}

shinyApp(ui = page_react(title = "Inputs - Shiny React"), server = server)
