# shinyreact

R package providing React component bindings for Shiny applications.

## Installation

```r
# Install from GitHub
devtools::install_github("wch/shiny-react", subdir = "r")
```

## Usage

```r
library(shiny)
library(shinyreact)

ui <- fluidPage(
  shinyReactDependency(),
  div(id = "react-root")
)

server <- function(input, output, session) {
  # Your Shiny server logic here
}

shinyApp(ui = ui, server = server)
```

## Features

- `shinyReactDependency()`: HTML dependency for the shiny-react JavaScript library
- `reactComponent()`: Helper function to create React component containers
- Seamless integration with Shiny's reactive system