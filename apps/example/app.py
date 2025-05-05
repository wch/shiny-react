from __future__ import annotations

from shiny import App, Inputs, Outputs, Session, ui, render
from shiny.html_dependencies import shiny_deps
from pathlib import PurePath

from htmltools import HTMLDependency

www_path = PurePath(__file__).parent.parent.parent / "dist" / "example"


def page_dep() -> HTMLDependency:
    return HTMLDependency(
        name="shinyreact-example",
        version="1.0.0",
        source={"subdir": str(www_path)},
        script={"src": "main.js", "type": "module"},
        stylesheet={"href": "main.css"},
    )


app_ui = ui.tags.html(
    ui.tags.head(ui.tags.title("Example")),
    ui.tags.body(shiny_deps(False), page_dep(), ui.div(id="root")),
    lang="en",
)


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        # Reverse the input string
        return input.txtin()[::-1]


app = App(app_ui, server, debug=True)
