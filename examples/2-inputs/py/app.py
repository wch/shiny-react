from shiny import App, Inputs, Outputs, Session, ui, render
from shinyreact import page_bare
from pathlib import Path

app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="Hello Shiny React",
)


def server(input: Inputs, output: Outputs, session: Session):
    @render.text()
    def txtout():
        return input.txtin().upper()

    @render.text()
    def numberout():
        return str(input.numberin())

    @render.text()
    def checkboxout():
        return str(input.checkboxin())

    @render.text()
    def radioout():
        return str(input.radioin())

    @render.text()
    def selectout():
        return str(input.selectin())

    @render.text()
    def sliderout():
        return str(input.sliderin())

    @render.text()
    def dateout():
        return str(input.datein())

    # Track number of button clicks
    num_button_clicks = 0

    @render.text()
    def buttonout():
        if input.buttonin() is None:
            return None
        nonlocal num_button_clicks
        num_button_clicks += 1
        return str(num_button_clicks)

    @render.text()
    def batchout():
        import json
        import datetime

        data = input.batchdata()
        if data is None:
            return "No data submitted yet."

        data["receivedAt"] = datetime.datetime.now().isoformat()

        return json.dumps(data, indent=2)


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))
