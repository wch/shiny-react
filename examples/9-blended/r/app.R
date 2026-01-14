library(shiny)
library(bslib)
library(bsicons)

source("shinyreact.R", local = TRUE)

# Define UI
ui <- page_fillable(
  theme = bs_theme(version = 5, preset = "lumen"),
  padding = 0,

  # React sidebar layout with three panels
  react_sidebar_layout(
    title = "Blended Demo",

    # Panel 1: Dashboard
    react_nav_panel(
      "Dashboard",
      icon = bs_icon("bar-chart-fill"),
      value = "dashboard",

      # Sales Overview Card
      card(
        card_header("Sales Overview"),
        card_body(
          plotOutput("salesPlot", height = "300px")
        )
      ),

      # Controls Card
      card(
        card_header("Controls"),
        card_body(
          sliderInput("months", "Months:", min = 1, max = 12, value = 6),
          selectInput(
            "region",
            "Region:",
            choices = c("North", "South", "East", "West")
          )
        )
      )
    ),

    # Panel 2: Data
    react_nav_panel(
      "Data",
      icon = bs_icon("table"),
      value = "data",

      # Data Table Card
      card(
        card_header("Data Table"),
        card_body(
          tableOutput("dataTable")
        )
      ),

      # Refresh Controls
      actionButton("refresh", "Refresh Data", class = "btn-primary mt-3"),
      verbatimTextOutput("refreshCount")
    ),

    # Panel 3: Settings
    react_nav_panel(
      "Settings",
      icon = bs_icon("gear-fill"),
      value = "settings",

      # Preferences Card
      card(
        card_header("Preferences"),
        card_body(
          textInput("username", "Username:"),
          checkboxInput("darkMode", "Dark Mode", FALSE),
          checkboxInput("notifications", "Enable Notifications", TRUE)
        )
      ),

      # Current Settings Card
      card(
        card_header("Current Settings"),
        card_body(
          verbatimTextOutput("currentSettings")
        )
      )
    )
  )
)

# Define server logic
server <- function(input, output, session) {
  # Sales Plot - reactive to months and region
  output$salesPlot <- renderPlot({
    # Generate cumulative sales data based on inputs
    months <- seq_len(input$months)
    set.seed(42) # For reproducibility
    sales <- cumsum(runif(input$months, min = 50, max = 150))

    # Create line plot
    plot(
      months,
      sales,
      type = "l",
      lwd = 2,
      col = "#2563eb",
      main = paste("Sales Trend -", input$region),
      xlab = "Month",
      ylab = "Cumulative Sales ($1000s)",
      las = 1
    )

    # Add points
    points(months, sales, pch = 19, col = "#2563eb", cex = 1.2)

    # Add grid
    grid(col = "#e5e7eb", lty = 1)
  })

  # Data Table - showing mtcars data
  output$dataTable <- renderTable(
    {
      head(mtcars[, 1:5], 10)
    },
    rownames = TRUE
  )

  # Refresh Counter - reactive value for button clicks
  refreshCount <- reactiveVal(0)

  observeEvent(input$refresh, {
    refreshCount(refreshCount() + 1)
  })

  output$refreshCount <- renderText({
    paste("Data refreshed", refreshCount(), "times")
  })

  # Current Settings Display
  output$currentSettings <- renderPrint({
    list(
      username = if (nchar(input$username) > 0) input$username else "(not set)",
      darkMode = input$darkMode,
      notifications = input$notifications
    )
  })

  observeEvent(input$darkMode, {
    toggle_dark_mode(if (input$darkMode) "dark" else "light")
  })
}

# Run the application
shinyApp(ui = ui, server = server)
