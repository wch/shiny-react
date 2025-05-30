library(shiny)
library(htmltools)


empty_named_list <- list(a = 1)[0]

shinyReactDependency <- function() {
  htmlDependency(
    name = "shinyreact-fancy",
    version = "1.0.0",
    src = c(file = "../../dist/fancy"),
    script = list(src = "main.js", type = "module"),
    stylesheet = list(href = "main.css")
  )
}

barePage <- function(..., title = NULL, lang = NULL) {
  ui <- list(
    shiny:::jqueryDependency(),
    if (!is.null(title)) tags$head(tags$title(title)),
    ...
  )
  attr(ui, "lang") <- lang
  ui
}


ui <- barePage(
  title = "Example with shadcn/ui",
  shinyReactDependency(),
  tags$div(id = "root")
)

server <- function(input, output, session) {
  lapply(1:4, function(i) {
    output[[paste0("out", i)]] <- renderText({
      paste0(
        "Shiny sees input.value",
        i,
        ": ",
        input[[paste0("value", i)]],
        ", ",
        typeof(input[[paste0("value", i)]])
      )
    })
  })

  output$out5 <- renderText({
    req(input$value5)
    if (input$value5 >= 200) {
      return("error")
    } else {
      return("ok")
    }
  })

  output$out6 <- renderText({
    req(input$value6)
    if (input$value6 >= 400) {
      return("fatal")
    } else if (input$value6 >= 300) {
      return("error")
    } else if (input$value6 >= 200) {
      return("warning")
    } else {
      return("ok")
    }
  })

  output$out7 <- renderText({
    paste0(
      "Shiny sees input.value7(): ",
      jsonlite::toJSON(input$value7, auto_unbox = TRUE, pretty = TRUE)
    )
  })

  saved_state <- reactiveVal(empty_named_list)

  output$saved_state_text <- renderText({
    paste0(jsonlite::toJSON(saved_state(), auto_unbox = TRUE, pretty = TRUE))
  })

  observeEvent(input$save_state, {
    isolate({
      keys <- names(input)
      # Drop keys with leading "."
      keys <- keys[substring(keys, 1, 1) != "."]
      filtered_inputs <- empty_named_list
      for (key in keys) {
        filtered_inputs[[key]] <- input[[key]]
      }
      print(jsonlite::toJSON(filtered_inputs, auto_unbox = TRUE, pretty = TRUE))
      saved_state(filtered_inputs)
    })
  })

  observeEvent(input$restore_state, {
    session$sendCustomMessage("shinyReactSetInputs", saved_state())
  })
}

shinyApp(ui = ui, server = server)
