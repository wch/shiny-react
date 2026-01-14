library(shiny)
library(bslib)
source("shinyreact.R", local = TRUE)

#' Counter Widget UI
#'
#' Creates a React-powered counter widget card that can be used in a standard
#' Shiny app. The counter maintains its state independently using Shiny modules.
#'
#' @param id Module ID for namespacing
#' @param title Title to display on the card
#'
#' @return A bslib card containing the counter widget
counter_ui <- function(id, title = "Counter") {
  ns <- NS(id)

  card(
    card_header(title),
    # Custom element for the React component
    # The counter-widget element is automatically initialized by the custom element
    # The id attribute provides the module namespace
    tag(
      "counter-widget",
      list(
        id = id,
        class = "counter-widget-container"
      )
    ),
    # Load the React widget bundle
    tags$head(
      tags$script(src = "widget.js", type = "module"),
      tags$link(href = "widget.css", rel = "stylesheet")
    )
  )
}

#' Counter Widget Server
#'
#' Server logic for the counter widget. Handles the reactive communication
#' between the React component and Shiny server.
#'
#' @param id Module ID (must match the ID used in counter_ui)
#'
#' @return A reactive value containing the current count
counter_server <- function(id) {
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

    # Return a reactive containing the current count
    reactive({
      input$count
    })
  })
}

# UI
ui <- page_fluid(
  theme = bs_theme(version = 5, preset = "shiny"),

  # Header
  div(
    class = "container mt-4",
    h1("Shiny React Counter Widgets"),
    p(
      class = "lead",
      "React-powered counter components in a traditional Shiny app using bslib."
    ),
    hr()
  ),

  # Static counter widgets in a grid layout
  layout_columns(
    col_widths = c(4, 4, 4),
    counter_ui("counter1", "Counter A"),
    counter_ui("counter2", "Counter B"),
    counter_ui("counter3", "Counter C")
  ),

  # Dynamic widget management section
  div(
    class = "container mt-4",
    card(
      card_header("Dynamic Widget Management"),
      card_body(
        p("Test dynamic rendering by adding and removing counter widgets:"),
        div(
          class = "d-flex gap-2 mb-3",
          actionButton("add_widget", "Add Counter", class = "btn-primary"),
          actionButton(
            "remove_widget",
            "Remove Last Counter",
            class = "btn-secondary"
          )
        ),
        div(
          id = "dynamic_widgets_container",
          style = css(
            display = "grid",
            grid_template_columns = "repeat(auto-fit, minmax(200px, 1fr))",
            gap = "1rem"
          )
        )
      )
    )
  ),

  # Summary section showing the reactive values
  div(
    class = "container mt-4",
    card(
      card_header("Current Counts (from server)"),
      card_body(
        p("These values are returned by the counter_server() function:"),
        verbatimTextOutput("counts_summary")
      )
    )
  ),

  # Info section
  div(
    class = "container mt-4 mb-4",
    card(
      card_header("How It Works"),
      card_body(
        tags$ul(
          tags$li(
            tags$strong("counter_ui()"),
            " creates a bslib card with a mount point for the React widget"
          ),
          tags$li(
            tags$strong("counter_server()"),
            " sets up the Shiny module logic and returns a reactive"
          ),
          tags$li(
            "Each widget operates independently thanks to Shiny module namespacing"
          ),
          tags$li(
            "The React components use ",
            tags$code("ShinyModuleProvider"),
            " to automatically namespace all hooks"
          )
        )
      )
    )
  )
)

# Server
server <- function(input, output, session) {
  # Initialize counter servers and capture their reactive return values
  count1 <- counter_server("counter1")
  count2 <- counter_server("counter2")
  count3 <- counter_server("counter3")

  # Track dynamically added widgets
  dynamic_widget_ids <- reactiveVal(character(0))
  next_widget_num <- reactiveVal(1)

  # Add a new dynamic widget
  observeEvent(input$add_widget, {
    widget_num <- next_widget_num()
    widget_id <- paste0("dynamic", widget_num)

    # Insert the widget UI
    insertUI(
      selector = "#dynamic_widgets_container",
      where = "beforeEnd",
      ui = div(
        id = paste0("widget_wrapper_", widget_id),
        class = "mb-3",
        counter_ui(widget_id, paste("Dynamic Counter", widget_num))
      )
    )

    # Initialize the server for this widget
    counter_server(widget_id)

    # Track the widget ID
    ids <- dynamic_widget_ids()
    dynamic_widget_ids(c(ids, widget_id))

    # Increment counter for next widget
    next_widget_num(widget_num + 1)
  })

  # Remove the last dynamic widget
  observeEvent(input$remove_widget, {
    ids <- dynamic_widget_ids()

    if (length(ids) > 0) {
      # Get the last widget ID
      last_id <- ids[length(ids)]

      # Remove the UI
      removeUI(
        selector = paste0("#widget_wrapper_", last_id),
        immediate = TRUE
      )

      # Remove from tracking
      dynamic_widget_ids(ids[-length(ids)])
    }
  })

  # Display the current counts
  output$counts_summary <- renderText({
    paste0(
      "Counter A: ",
      count1() %||% 0,
      "\n",
      "Counter B: ",
      count2() %||% 0,
      "\n",
      "Counter C: ",
      count3() %||% 0
    )
  })
}

shinyApp(ui, server)
