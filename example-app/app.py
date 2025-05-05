# pyright: basic

from shiny_react import (
    input_shiny_react,
    output_shiny_react,
    render_shiny_react,
)

from shiny import App, ui

app_ui = ui.page_fluid(
    ui.h2("Color picker"),
    input_shiny_react("color"),
    ui.br(),
    ui.h2("Output color"),
    output_shiny_react("value"),
)


def server(input, output, session):
    @render_shiny_react
    def value():
        print("Calculating value")
        return input.color()


app = App(app_ui, server, debug=True)
