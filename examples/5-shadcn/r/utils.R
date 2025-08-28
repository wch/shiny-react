library(shiny)

# Bare page without default Shiny styling
barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}

# Custom renderer for arbitrary JSON data
renderObject <- function(expr, env = parent.frame(), quoted = FALSE, outputArgs = list()) {
  func <- installExprFunction(expr, "func", env, quoted, label = "renderObject")
  createRenderFunction(
    func,
    function(value, session, name, ...) { value },
    function(...) { stop("Not implemented") },
    outputArgs
  )
}

# Generate sample sales data
generate_sample_data <- function(n_days = 30, n_products = 20) {
  set.seed(42)  # For reproducible data
  
  # Date range
  dates <- seq(from = Sys.Date() - n_days + 1, to = Sys.Date(), by = "day")
  
  # Product categories
  categories <- c("Electronics", "Clothing", "Books", "Home & Garden", "Sports")
  products <- c(
    "Wireless Headphones", "Laptop Stand", "Smart Watch", "Bluetooth Speaker", "Phone Case",
    "Cotton T-Shirt", "Jeans", "Sneakers", "Wool Sweater", "Baseball Cap",
    "Programming Book", "Novel", "Cookbook", "Journal", "Art Supplies",
    "Garden Tools", "Kitchen Utensils", "Bedding Set", "Decorative Pillow", "Plant Pot"
  )
  
  # Generate time series data
  revenue_trend <- data.frame(
    date = as.character(dates),
    revenue = pmax(1000, 2000 + 500 * sin(seq_along(dates) * 0.3) + rnorm(length(dates), 0, 200)),
    orders = pmax(10, 50 + 20 * sin(seq_along(dates) * 0.2) + rpois(length(dates), 10)),
    users = pmax(5, 25 + 15 * sin(seq_along(dates) * 0.25) + rpois(length(dates), 5))
  )
  
  # Generate product performance data
  product_data <- data.frame(
    id = paste0("prod_", 1:n_products),
    product = sample(products, n_products, replace = TRUE),
    category = sample(categories, n_products, replace = TRUE),
    sales = sample(50:500, n_products, replace = TRUE),
    revenue = round(runif(n_products, 1000, 10000), 2),
    growth = round(runif(n_products, -15, 25), 1),
    status = sample(c("active", "inactive", "low_stock"), n_products, 
                   replace = TRUE, prob = c(0.6, 0.2, 0.2)),
    stringsAsFactors = FALSE
  )
  
  # Generate category performance data
  category_performance <- aggregate(
    cbind(sales = product_data$sales, revenue = product_data$revenue),
    by = list(category = product_data$category),
    FUN = sum
  )
  
  list(
    revenue_trend = revenue_trend,
    products = product_data,
    category_performance = category_performance
  )
}

# Filter data based on inputs
filter_data <- function(data, date_range = "last_30_days", search_term = "", selected_categories = c()) {
  # Filter by date range (for time series data)
  days_back <- switch(date_range,
    "last_7_days" = 7,
    "last_30_days" = 30,
    "last_90_days" = 90,
    "this_year" = 365,
    30  # default
  )
  
  start_date <- Sys.Date() - days_back + 1
  filtered_revenue <- data$revenue_trend[data$revenue_trend$date >= as.character(start_date), ]
  
  # Filter products
  filtered_products <- data$products
  
  # Filter by search term
  if (search_term != "") {
    filtered_products <- filtered_products[
      grepl(search_term, filtered_products$product, ignore.case = TRUE) |
      grepl(search_term, filtered_products$category, ignore.case = TRUE),
    ]
  }
  
  # Filter by categories
  if (length(selected_categories) > 0) {
    # Map category values to labels
    category_map <- c(
      "electronics" = "Electronics",
      "clothing" = "Clothing", 
      "books" = "Books",
      "home" = "Home & Garden",
      "sports" = "Sports"
    )
    selected_labels <- category_map[selected_categories]
    selected_labels <- selected_labels[!is.na(selected_labels)]
    
    if (length(selected_labels) > 0) {
      filtered_products <- filtered_products[filtered_products$category %in% selected_labels, ]
    }
  }
  
  # Recalculate category performance based on filtered products
  if (nrow(filtered_products) > 0) {
    filtered_category_performance <- aggregate(
      cbind(sales = filtered_products$sales, revenue = filtered_products$revenue),
      by = list(category = filtered_products$category),
      FUN = sum
    )
  } else {
    filtered_category_performance <- data.frame(
      category = character(0),
      sales = numeric(0),
      revenue = numeric(0)
    )
  }
  
  list(
    revenue_trend = filtered_revenue,
    products = filtered_products,
    category_performance = filtered_category_performance
  )
}

# Calculate metrics
calculate_metrics <- function(current_data, previous_data = NULL) {
  if (is.null(previous_data)) {
    # Generate mock previous period data for comparison
    previous_data <- list(
      revenue_trend = current_data$revenue_trend,
      products = current_data$products
    )
    # Simulate previous period with slight variations
    previous_data$revenue_trend$revenue <- current_data$revenue_trend$revenue * runif(1, 0.8, 1.1)
    previous_data$products$sales <- current_data$products$sales * runif(nrow(current_data$products), 0.8, 1.1)
  }
  
  # Current metrics
  current_revenue <- sum(current_data$revenue_trend$revenue)
  current_users <- sum(current_data$revenue_trend$users)
  current_orders <- sum(current_data$revenue_trend$orders)
  current_conversion <- if (current_users > 0) (current_orders / current_users) * 100 else 0
  
  # Previous metrics (mock calculation)
  previous_revenue <- sum(previous_data$revenue_trend$revenue) * 0.9
  previous_users <- sum(previous_data$revenue_trend$users) * 0.85
  previous_orders <- sum(previous_data$revenue_trend$orders) * 0.88
  previous_conversion <- if (previous_users > 0) (previous_orders / previous_users) * 100 else 0
  
  # Calculate changes
  revenue_change <- ((current_revenue - previous_revenue) / previous_revenue) * 100
  users_change <- ((current_users - previous_users) / previous_users) * 100
  orders_change <- ((current_orders - previous_orders) / previous_orders) * 100
  conversion_change <- current_conversion - previous_conversion
  
  list(
    revenue = list(
      title = "Total Revenue",
      value = paste0("$", format(round(current_revenue), big.mark = ",")),
      change = round(revenue_change, 1),
      trend = if (revenue_change >= 0) "up" else "down"
    ),
    users = list(
      title = "New Users",
      value = format(round(current_users), big.mark = ","),
      change = round(users_change, 1),
      trend = if (users_change >= 0) "up" else "down"
    ),
    orders = list(
      title = "Orders",
      value = format(round(current_orders), big.mark = ","),
      change = round(orders_change, 1),
      trend = if (orders_change >= 0) "up" else "down"
    ),
    conversion = list(
      title = "Conversion Rate",
      value = paste0(round(current_conversion, 1), "%"),
      change = round(conversion_change, 1),
      trend = if (conversion_change >= 0) "up" else "down"
    )
  )
}