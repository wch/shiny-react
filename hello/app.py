from __future__ import annotations

from shiny import App, Inputs, Outputs, Session, ui, render

from pathlib import PurePath

from htmltools import HTMLDependency

www_path = PurePath(__file__).parent.parent / "shiny_react" / "distjs"


def page_dep() -> list[HTMLDependency]:
    return [
        HTMLDependency(
            name="shinyreact",
            version="1.0.0",
            source={"subdir": str(www_path)},
            script={"src": "index.js", "type": "module"},
        ),
    ]


app_ui = ui.page_bootstrap(
    *page_dep(),
    ui.div(id="root"),
)


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        return f"Value of input.txtin(): {input.txtin()}"


app = App(app_ui, server, debug=True)
