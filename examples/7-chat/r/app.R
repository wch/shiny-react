library(shiny)
library(ellmer)
dotenv::load_dot_env(".env")

source("utils.R", local = TRUE)
# Initialize chat object - using OpenAI GPT-4o-mini by default
# Users can set OPENAI_API_KEY environment variable or modify this
chat <-
  chat_openai(
    "You are a helpful AI assistant. Be concise but informative in your responses.",
    model = "gpt-4o-mini"
  )

ui <- barePage(
  title = "AI Chat - Shiny React",
  tags$head(
    tags$script(src = "main.js", type = "module"),
    tags$link(href = "main.css", rel = "stylesheet")
  ),
  tags$div(id = "root")
)


server <- function(input, output, session) {
  observeEvent(input$chat_input, {
    req(input$chat_input)

    tryCatch(
      {
        # Create async streaming
        stream <- chat$stream_async(input$chat_input)
        coro::async(function() {
          for (chunk in await_each(stream)) {
            send_chunk(chunk)
          }

          # Send final message when streaming is complete
          send_chunk("", done = TRUE)
        })()
      },
      error = function(e) {
        error_message <- paste("Error getting AI response:", e$message)
        warning(error_message)
        send_chunk(
          "Sorry, I encountered an error processing your request. Please try again.",
          done = TRUE
        )
      }
    )
  })

  # Send a chunk of text to front end
  send_chunk <- function(chunk, done = FALSE) {
    session$sendCustomMessage(
      "chat_stream",
      list(
        chunk = chunk,
        done = done
      )
    )
  }
}


shinyApp(ui = ui, server = server)
