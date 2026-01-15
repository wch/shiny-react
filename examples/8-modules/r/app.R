library(shiny)
source("shinyreact.R", local = TRUE)

# Module server function
counterModuleServer <- function(id) {
  moduleServer(id, function(input, output, session) {
    # Double the count value and send to client
    output$serverCount <- render_json({
      req(input$count)
      input$count * 2
    })

    # Send notification message every 5 counts
    observe({
      req(input$count)
      if (input$count > 0 && input$count %% 5 == 0) {
        post_message(
          session,
          "notification",
          list(message = paste("Milestone reached:", input$count))
        )
      }
    })
  })
}

server <- function(input, output, session) {
  # Initialize three independent module servers
  counterModuleServer("counter1")
  counterModuleServer("counter2")
  counterModuleServer("counter3")
}

shinyApp(
  ui = page_react(
    title = "Modules - Shiny React",
    js_file = "app.js",
    css_file = "app.css"
  ),
  server = server
)
