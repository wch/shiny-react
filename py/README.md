# shiny-react

Python package providing React component bindings for Shiny applications.

## Installation

```bash
pip install shiny-react
```

## Usage

```python
from shiny import App, render, ui
from shiny_react import shiny_react_dependency

app_ui = ui.page_bootstrap(
    shiny_react_dependency(),
    ui.div(id="react-root"),
)

def server(input, output, session):
    @render.text
    def hello():
        return "Hello from Shiny!"

app = App(app_ui, server)
```

## Features

- `shiny_react_dependency()`: HTML dependency for the shiny-react JavaScript library
- `react_component()`: Helper function to create React component containers
- Seamless integration with Shiny for Python's reactive system
- Type hints for better IDE support