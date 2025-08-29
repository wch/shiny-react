library(shiny)
source("shinyreact.R", local = TRUE)

# Generate sample data
sample_data <- data.frame(
  id = 1:8,
  age = c(25, 30, 35, 28, 32, 27, 29, 33),
  score = c(85.5, 92.1, 88.3, 88.7, 95.2, 81.9, 87.4, 90.6),
  category = c("A", "B", "A", "C", "B", "A", "C", "B")
)

ui <- barePage(
  title = "Shiny + shadcn/ui Example",
  tags$head(
    tags$script(src = "main.js", type = "module"),
    tags$link(href = "main.css", rel = "stylesheet")
  ),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  # Process text input
  output$processed_text <- renderText({
    text <- input$user_text %||% ""
    reversed_text <- paste(rev(strsplit(text, "")[[1]]), collapse = "")
    toupper(reversed_text)
  })

  # Calculate text length
  output$text_length <- renderText({
    text <- input$user_text %||% ""
    nchar(text)
  })

  output$button_response <- renderText({
    paste("Event received at:", as.character(Sys.time(), digits = 2))
  }) |>
    bindEvent(input$button_trigger) # Trigger on button events

  # Table data output
  output$table_data <- renderObject({
    sample_data
  })

  # Plot output
  output$plot1 <- renderPlot({
    plot(
      sample_data$age,
      sample_data$score,
      xlab = "Age",
      ylab = "Score",
      main = "Age vs Score",
      pch = 19,
      cex = 1.5
    )

    # Add a trend line
    abline(lm(score ~ age, data = sample_data), col = "red", lwd = 2)

    # Add grid
    grid()
  })
}

shinyApp(ui = ui, server = server)
