library(shiny)
library(jsonlite)

source("shinyreact.R", local = TRUE)
mtcars <- read.csv("mtcars.csv")


server <- function(input, output, session) {
  output$table_data <- render_object({
    req(input$table_rows)
    # This will be converted to a JSON object in column-major format, as in:
    # {
    #   "mpg": [21, 21, 22.8, ...],
    #   "cyl": [6, 6, 4, ...],
    #   "disp": [160, 160, 108, ...],
    #   ...
    # }
    mtcars[seq_len(input$table_rows), ]
  })

  output$table_stats <- render_object({
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

  output$plot1 <- renderPlot({
    req(input$table_rows)
    mtcars_subset <- mtcars[seq_len(input$table_rows), ]

    # Create a scatter plot of mpg vs wt
    plot(
      mtcars_subset$wt,
      mtcars_subset$mpg,
      xlab = "Weight (1000 lbs)",
      ylab = "Miles per Gallon",
      main = paste("MPG vs Weight -", nrow(mtcars_subset), "cars"),
      col = "steelblue",
      pch = 19,
      cex = 1.2
    )

    # Add a trend line
    abline(lm(mpg ~ wt, data = mtcars_subset), col = "red", lwd = 2)
  })
}

shinyApp(ui = page_react(title = "Outputs - Shiny React"), server = server)
