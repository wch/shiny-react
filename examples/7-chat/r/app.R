library(shiny)
library(ellmer)
dotenv::load_dot_env(".env")

source("shinyreact.R", local = TRUE)
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
    req(input$chat_input$text)

    tryCatch(
      {
        # Parse structured input (JSON with text and attachments)
        message_data <- input$chat_input

        # Extract text - handle both string (backwards compatibility) and structured input
        user_text <- if (is.character(message_data)) {
          message_data
        } else if (is.list(message_data) && !is.null(message_data$text)) {
          message_data$text
        } else {
          ""
        }

        # Extract attachments if present
        attachments <- if (
          is.list(message_data) && !is.null(message_data$attachments)
        ) {
          message_data$attachments
        } else {
          list()
        }

        # Build chat arguments
        chat_args <- list()

        # Add user text if present
        if (nzchar(user_text)) {
          chat_args <- append(chat_args, user_text)
        }

        # Add image attachments as content_image_url objects
        if (length(attachments) > 0) {
          for (i in seq_along(attachments)) {
            attachment <- attachments[[i]]
            if (!is.null(attachment$content) && !is.null(attachment$type)) {
              # Create data URL from base64 content
              data_url <- paste0(
                "data:",
                attachment$type,
                ";base64,",
                attachment$content
              )
              # Add image content to chat arguments
              chat_args <- append(
                chat_args,
                list(ellmer::content_image_url(data_url))
              )
            }
          }
        }

        # Ensure we have at least some content to send
        if (length(chat_args) == 0) {
          chat_args <- list("Please provide some content to analyze.")
        }

        # Create async streaming with all arguments
        stream <- do.call(chat$stream_async, chat_args)
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
