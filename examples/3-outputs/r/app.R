library(shiny)
library(jsonlite)

source("utils.R", local = TRUE)
mtcars <- read.csv("mtcars.csv")

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
  output$table_data <- renderObject({
    req(input$table_rows)
    mtcars[seq_len(input$table_rows), ]
  })

  output$table_stats <- renderObject({
    req(input$table_rows)
    mtcars_subset <- mtcars[seq_len(input$table_rows), ]

    # Return some summary statistics
    list(
      colname = "mpg",
      mean = mean(mtcars_subset$mpg),
      median = median(mtcars_subset$mpg),
      min = min(mtcars_subset$mpg),
      max = max(mtcars_subset$mpg)
    )
  })
}

shinyApp(ui = ui, server = server)
