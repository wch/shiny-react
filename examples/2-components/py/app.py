from shiny import App, Inputs, Outputs, Session, ui, render
from utils import page_bare
from pathlib import PurePath

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


app = App(app_ui, server, static_assets=str(PurePath(__file__).parent / "www"))
