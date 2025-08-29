from shiny import App, Inputs, Outputs, Session, ui, render
from shinyreact import page_bare, render_object
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

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
        # This produces a JSON object in column-major format, as in:
        # {
        #   "mpg": [21, 21, 22.8, ...],
        #   "cyl": [6, 6, 4, ...],
        #   "disp": [160, 160, 108, ...],
        #   ...
        # }
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

    @render.plot()
    def plot1():
        num_rows = input.table_rows()
        mtcars_subset = mtcars.head(num_rows)

        # Create a scatter plot of mpg vs wt
        fig, ax = plt.subplots(figsize=(8, 6))
        ax.scatter(
            mtcars_subset["wt"],
            mtcars_subset["mpg"],
            color="steelblue",
            alpha=0.7,
            s=60,
        )

        # Add a trend line
        z = np.polyfit(mtcars_subset["wt"], mtcars_subset["mpg"], 1)
        p = np.poly1d(z)
        ax.plot(
            mtcars_subset["wt"], p(mtcars_subset["wt"]), "r--", alpha=0.8, linewidth=2
        )

        ax.set_xlabel("Weight (1000 lbs)")
        ax.set_ylabel("Miles per Gallon")
        ax.set_title(f"MPG vs Weight - {len(mtcars_subset)} cars")
        ax.grid(True, alpha=0.3)

        return fig


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"), debug=True)
