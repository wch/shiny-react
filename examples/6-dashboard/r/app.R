library(shiny)
source("utils.R", local = TRUE)
source("data.R", local = TRUE)

# Generate sample data once when app starts
sample_data <- generate_sample_data()

ui <- barePage(
  title = "Shiny React Dashboard",
  tags$head(
    tags$script(src = "main.js", type = "module"),
    tags$link(href = "main.css", rel = "stylesheet")
  ),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  # Reactive data filtering
  filtered_data <- reactive({
    # Use default values if inputs are NULL (don't require them)
    date_range <- if (is.null(input$date_range)) {
      "last_30_days"
    } else {
      input$date_range
    }
    search_term <- if (is.null(input$search_term)) "" else input$search_term
    selected_categories <- if (is.null(input$selected_categories)) {
      c()
    } else {
      input$selected_categories
    }

    tryCatch(
      {
        filter_data(
          sample_data,
          date_range = date_range,
          search_term = search_term,
          selected_categories = selected_categories
        )
      },
      error = function(e) {
        cat("Error in filter_data:", e$message, "\n")
        # Return sample data as fallback
        sample_data
      }
    )
  })

  # Metrics output
  output$metrics_data <- renderObject({
    tryCatch(
      {
        data <- filtered_data()
        calculate_metrics(data)
      },
      error = function(e) {
        cat("Error in metrics_data:", e$message, "\n")
        # Return default metrics
        list(
          revenue = list(
            title = "Total Revenue",
            value = "$0",
            change = 0,
            trend = "up"
          ),
          users = list(
            title = "New Users",
            value = "0",
            change = 0,
            trend = "up"
          ),
          orders = list(
            title = "Orders",
            value = "0",
            change = 0,
            trend = "up"
          ),
          conversion = list(
            title = "Conversion Rate",
            value = "0%",
            change = 0,
            trend = "up"
          )
        )
      }
    )
  })

  # Chart data output
  output$chart_data <- renderObject({
    tryCatch(
      {
        data <- filtered_data()

        # Convert data frames to column-major format
        revenue_trend_columns <- if (nrow(data$revenue_trend) > 0) {
          list(
            date = as.character(data$revenue_trend$date),
            revenue = as.numeric(data$revenue_trend$revenue),
            orders = as.numeric(data$revenue_trend$orders),
            users = as.numeric(data$revenue_trend$users)
          )
        } else {
          list(
            date = character(0),
            revenue = numeric(0),
            orders = numeric(0),
            users = numeric(0)
          )
        }

        category_performance_columns <- if (
          nrow(data$category_performance) > 0
        ) {
          list(
            category = as.character(data$category_performance$category),
            sales = as.numeric(data$category_performance$sales),
            revenue = as.numeric(data$category_performance$revenue)
          )
        } else {
          list(
            category = character(0),
            sales = numeric(0),
            revenue = numeric(0)
          )
        }

        list(
          revenue_trend = revenue_trend_columns,
          category_performance = category_performance_columns
        )
      },
      error = function(e) {
        cat("Error in chart_data:", e$message, "\n")
        # Return empty chart data in column format
        list(
          revenue_trend = list(
            date = character(0),
            revenue = numeric(0),
            orders = numeric(0),
            users = numeric(0)
          ),
          category_performance = list(
            category = character(0),
            sales = numeric(0),
            revenue = numeric(0)
          )
        )
      }
    )
  })

  # Table data output
  output$table_data <- renderObject({
    tryCatch(
      {
        data <- filtered_data()

        # Sort products by revenue (descending) and take top 10
        sorted_products <- data$products[
          order(data$products$revenue, decreasing = TRUE),
        ]
        top_products <- if (nrow(sorted_products) > 10) {
          sorted_products[1:10, ]
        } else {
          sorted_products
        }

        list(
          columns = top_products,
          total_rows = nrow(data$products)
        )
      },
      error = function(e) {
        cat("Error in table_data:", e$message, "\n")
        # Return empty table data in column format
        list(
          columns = sample_data[0, ],
          total_rows = 0
        )
      }
    )
  })
}

shinyApp(ui = ui, server = server)
