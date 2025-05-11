from __future__ import annotations

from shiny import App, Inputs, Outputs, Session, ui, render
from shiny.html_dependencies import shiny_deps
from pathlib import PurePath
import numpy as np
import matplotlib.pyplot as plt
import asyncio
from htmltools import HTMLDependency

www_path = PurePath(__file__).parent.parent.parent / "dist" / "plot"


def page_dep() -> HTMLDependency:
    return HTMLDependency(
        name="shinyreact-plot",
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
    def out1():
        return f"Shiny sees input.value(): {input.value1()}, {type(input.value1())}"

    @render.text()
    def out2():
        return f"Shiny sees input.value2(): {input.value2()}, {type(input.value2())}"

    @render.text()
    def out3():
        return f"Shiny sees input.value3(): {input.value3()}, {type(input.value3())}"

    @render.text()
    def out4():
        return f"Shiny sees input.value4(): {input.value4()}, {type(input.value4())}"

    @render.text()
    def out5():
        if input.value5() >= 200:
            return "error"
        else:
            return "ok"

    @render.text()
    def out6():
        if input.value6() >= 400:
            return "fatal"
        elif input.value6() >= 300:
            return "error"
        elif input.value6() >= 200:
            return "warning"
        else:
            return "ok"

    @render.plot()
    async def plot1():
        # await asyncio.sleep(1)
        # input.slider1()
        # Generate random data for scatter plot
        n_points = 50
        x = np.random.rand(n_points)
        y = np.random.rand(n_points)
        colors = np.random.rand(n_points)
        sizes = 1000 * np.random.rand(n_points)

        # Create the scatter plot
        fig, ax = plt.subplots(figsize=(8, 6))
        scatter = ax.scatter(x, y, c=colors, s=sizes, alpha=0.6, cmap="viridis")

        # Add colorbar and labels
        plt.colorbar(scatter)
        ax.set_xlabel("X-axis")
        ax.set_ylabel("Y-axis")
        ax.set_title("Random Scatter Plot")

        return fig


app = App(app_ui, server, debug=True)
