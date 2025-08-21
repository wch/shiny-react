# pyright: strict
from __future__ import annotations

from shiny import App, Inputs, Outputs, Session, ui, render
from shiny.html_dependencies import shiny_deps

from pathlib import PurePath

from htmltools import HTMLDependency

# In the future, this would be: from shiny_react import shiny_react_dependency
# For now, we'll use the local dependency function until the package is built
www_path = PurePath(__file__).parent.parent / "dist"


def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )


def shiny_react_dependency() -> list[HTMLDependency]:
    return [
        HTMLDependency(
            name="shiny-react-hello-world",
            version="1.0.0",
            source={"subdir": str(www_path)},
            script={"src": "main.js", "type": "module"},
        ),
    ]


app_ui = page_bare(
    shiny_react_dependency(), ui.div(id="root"), title="Hello Shiny React"
)


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        return f"Value of input.txtin(): {input.txtin()}"


app = App(app_ui, server, debug=True)
