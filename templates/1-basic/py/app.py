from shiny import App, Inputs, Outputs, Session, render
from shinyreact import page_react
from pathlib import Path


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        return input.txtin().upper()


app = App(
    page_react(title="Hello Shiny React"),
    server,
    static_assets=str(Path(__file__).parent / "www"),
)
