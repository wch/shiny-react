library(shiny)
source("utils.R", local = TRUE)

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
    date_range <- if (is.null(input$date_range)) "last_30_days" else input$date_range
    search_term <- if (is.null(input$search_term)) "" else input$search_term
    selected_categories <- if (is.null(input$selected_categories)) c() else input$selected_categories
    
    tryCatch({
      filter_data(
        sample_data, 
        date_range = date_range,
        search_term = search_term,
        selected_categories = selected_categories
      )
    }, error = function(e) {
      cat("Error in filter_data:", e$message, "\n")
      # Return sample data as fallback
      sample_data
    })
  })
  
  # Metrics output
  output$metrics_data <- renderObject({
    tryCatch({
      data <- filtered_data()
      calculate_metrics(data)
    }, error = function(e) {
      cat("Error in metrics_data:", e$message, "\n")
      # Return default metrics
      list(
        revenue = list(title = "Total Revenue", value = "$0", change = 0, trend = "up"),
        users = list(title = "New Users", value = "0", change = 0, trend = "up"),
        orders = list(title = "Orders", value = "0", change = 0, trend = "up"),
        conversion = list(title = "Conversion Rate", value = "0%", change = 0, trend = "up")
      )
    })
  })
  
  # Chart data output
  output$chart_data <- renderObject({
    tryCatch({
      data <- filtered_data()
      
      # Convert data frames to lists for proper JSON serialization
      revenue_trend_list <- if (nrow(data$revenue_trend) > 0) {
        lapply(1:nrow(data$revenue_trend), function(i) {
          row <- data$revenue_trend[i, ]
          list(
            date = as.character(row$date),
            revenue = as.numeric(row$revenue),
            orders = as.numeric(row$orders),
            users = as.numeric(row$users)
          )
        })
      } else {
        list()
      }
      
      category_performance_list <- if (nrow(data$category_performance) > 0) {
        lapply(1:nrow(data$category_performance), function(i) {
          row <- data$category_performance[i, ]
          list(
            category = as.character(row$category),
            sales = as.numeric(row$sales),
            revenue = as.numeric(row$revenue)
          )
        })
      } else {
        list()
      }
      
      list(
        revenue_trend = revenue_trend_list,
        category_performance = category_performance_list
      )
    }, error = function(e) {
      cat("Error in chart_data:", e$message, "\n")
      # Return empty chart data
      list(
        revenue_trend = list(),
        category_performance = list()
      )
    })
  })
  
  # Table data output  
  output$table_data <- renderObject({
    tryCatch({
      data <- filtered_data()
      
      # Sort products by revenue (descending) and take top 10
      sorted_products <- data$products[order(data$products$revenue, decreasing = TRUE), ]
      top_products <- if (nrow(sorted_products) > 10) sorted_products[1:10, ] else sorted_products
      
      # Convert to list format for JSON
      rows <- if (nrow(top_products) > 0) {
        lapply(1:nrow(top_products), function(i) {
          row <- top_products[i, ]
          list(
            id = as.character(row$id),
            product = as.character(row$product),
            category = as.character(row$category),
            sales = as.numeric(row$sales),
            revenue = as.numeric(row$revenue),
            growth = as.numeric(row$growth),
            status = as.character(row$status)
          )
        })
      } else {
        list()
      }
      
      list(
        rows = rows,
        total_rows = nrow(data$products)
      )
    }, error = function(e) {
      cat("Error in table_data:", e$message, "\n")
      # Return empty table data
      list(
        rows = list(),
        total_rows = 0
      )
    })
  })
  
  # Debug: Print input changes and data status
  observe({
    cat("Date range:", input$date_range %||% "NULL", "\n")
    cat("Search term:", input$search_term %||% "NULL", "\n")
    cat("Selected categories:", paste(input$selected_categories %||% "NULL", collapse = ", "), "\n")
    
    # Debug data
    tryCatch({
      data <- filtered_data()
      cat("Revenue trend rows:", nrow(data$revenue_trend), "\n")
      cat("Products rows:", nrow(data$products), "\n")
      cat("Category performance rows:", nrow(data$category_performance), "\n")
    }, error = function(e) {
      cat("Error in filtered_data():", e$message, "\n")
    })
    cat("---\n")
  })
}

shinyApp(ui = ui, server = server)