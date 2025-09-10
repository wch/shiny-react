import datetime
from pathlib import Path
from shiny import App, Inputs, Outputs, Session
from shinyreact import page_react, render_json


def server(input: Inputs, output: Outputs, session: Session):
    @render_json
    def txtout():
        return input.txtin().upper()

    @render_json
    def numberout():
        return str(input.numberin())

    @render_json
    def checkboxout():
        return str(input.checkboxin())

    @render_json
    def radioout():
        return str(input.radioin())

    @render_json
    def selectout():
        return str(input.selectin())

    @render_json
    def sliderout():
        return str(input.sliderin())

    @render_json
    def dateout():
        return str(input.datein())

    # Track number of button clicks
    num_button_clicks = 0

    @render_json
    def buttonout():
        if input.buttonin() is None:
            return None
        nonlocal num_button_clicks
        num_button_clicks += 1
        return str(num_button_clicks)

    @render_json
    def fileout():
        return input.filein()

    @render_json
    def batchout():
        data = input.batchdata()
        if data is None:
            return "No data submitted yet."

        data["receivedAt"] = datetime.datetime.now().isoformat()

        return data


app = App(
    page_react(title="Inputs - Shiny React"),
    server,
    static_assets=str(Path(__file__).parent / "www"),
)
