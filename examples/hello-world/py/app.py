# pyright: strict
from __future__ import annotations

from shiny import App, Inputs, Outputs, Session, ui, render
from utils import page_bare, shiny_react_dependency

app_ui = page_bare(
    shiny_react_dependency(), ui.div(id="root"), title="Hello Shiny React"
)


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        return f"Value of input.txtin(): {input.txtin()}"


app = App(app_ui, server)
