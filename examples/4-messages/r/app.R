library(shiny)

source("shinyreact.R", local = TRUE)


server <- function(input, output, session) {
  output$txtout <- render_json({
    toupper(input$txtin)
  })

  # Simulate log events
  log_messages <- list(
    list(text = "User logged in", category = "info"),
    list(text = "File saved successfully", category = "success"),
    list(text = "Low disk space warning", category = "warning"),
    list(text = "Backup completed", category = "success"),
    list(text = "Processing data...", category = "info"),
    list(text = "Cache cleared", category = "info")
  )

  # Timer that triggers every 2 seconds
  observe({
    invalidateLater(2000)

    # Send a random log message
    log_event <- log_messages[[sample(seq_along(log_messages), 1)]]
    post_message(session, "logEvent", log_event)
  })
}

shinyApp(
  ui = page_react(title = "Server-to-client messages - Shiny React"),
  server = server
)
