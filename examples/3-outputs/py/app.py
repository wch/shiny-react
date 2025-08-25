from shiny import App, Inputs, Outputs, Session, ui, render
from utils import page_bare, render_object
from pathlib import Path
import pandas as pd

mtcars = pd.read_csv(Path(__file__).parent / "mtcars.csv")


app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="Hello Shiny React",
)


def server(input: Inputs, output: Outputs, session: Session):

    @render_object()
    def table_data():
        num_rows = input.table_rows()
        return mtcars.head(num_rows).to_dict(orient="list")

    @render_object()
    def table_stats():
        num_rows = input.table_rows()
        mtcars_subset = mtcars.head(num_rows)

        # Return some summary statistics
        return {
            "colname": "mpg",
            "mean": float(mtcars_subset["mpg"].mean()),
            "median": float(mtcars_subset["mpg"].median()),
            "min": float(mtcars_subset["mpg"].min()),
            "max": float(mtcars_subset["mpg"].max()),
        }

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

    @render.text()
    def buttonout():
        return str(input.buttonin())


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"), debug=True)
