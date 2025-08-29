library(shiny)

source("shinyreact.R", local = TRUE)

ui <- barePage(
  title = "Hello Shiny React",
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

  # Simulate log events
  log_messages <- list(
    list(message = "User logged in", type = "info"),
    list(message = "File saved successfully", type = "success"),
    list(message = "Low disk space warning", type = "warning"),
    list(message = "Connection failed", type = "error"),
    list(message = "Backup completed", type = "success"),
    list(message = "Processing data...", type = "info"),
    list(message = "Invalid input detected", type = "error"),
    list(message = "Cache cleared", type = "info")
  )

  # Timer that triggers every 2 seconds
  observe({
    invalidateLater(2000)

    # Send a random log message
    log_event <- log_messages[[sample(seq_along(log_messages), 1)]]
    session$sendCustomMessage("logEvent", log_event)
  })
}

shinyApp(ui = ui, server = server)
