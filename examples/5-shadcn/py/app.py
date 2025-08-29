from shiny import App, Inputs, Outputs, Session, ui, render, reactive
from utils import page_bare, render_object
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime

# Generate sample data
sample_data = pd.DataFrame(
    {
        "id": range(1, 9),
        "name": ["Alice", "Bob", "Charlie", "Diana", "Eve", "Frank", "Grace", "Henry"],
        "age": [25, 30, 35, 28, 32, 27, 29, 33],
        "score": [85.5, 92.1, 88.3, 88.7, 95.2, 81.9, 87.4, 90.6],
        "category": ["A", "B", "A", "C", "B", "A", "C", "B"],
    }
)

app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="Shiny + shadcn/ui Example",
)


def server(input: Inputs, output: Outputs, session: Session):

    @render.text
    def processed_text():
        text = input.user_text() if input.user_text() is not None else ""
        if text == "":
            return ""
        # Simple text processing - uppercase and reverse
        return "".join(reversed(text.upper()))

    @render.text
    def text_length():
        text = input.user_text() if input.user_text() is not None else ""
        return len(text)

    # Button event handling
    @reactive.effect
    @reactive.event(input.button_trigger)
    def handle_button():
        current_time = datetime.now()
        print(f"Button clicked at: {current_time}")

    @render.text
    @reactive.event(input.button_trigger)
    def button_response():
        # React to button trigger
        return f"Event received at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"

    # Table data output
    @render_object()
    def table_data():
        # Convert DataFrame to dict format for JSON
        return sample_data.to_dict(orient="list")

    # Plot output
    @render.plot()
    def plot1():
        fig, ax = plt.subplots()

        ax.scatter(sample_data["age"], sample_data["score"], s=30, alpha=0.7)

        # Add trend line
        z = np.polyfit(sample_data["age"], sample_data["score"], 1)
        p = np.poly1d(z)
        # Create sorted x values for smooth trend line
        x_trend = np.linspace(sample_data["age"].min(), sample_data["age"].max(), 100)
        ax.plot(x_trend, p(x_trend), "r--", linewidth=2, alpha=0.8)

        ax.set_xlabel("Age")
        ax.set_ylabel("Score")
        ax.set_title("Age vs Score")
        ax.grid(True, alpha=0.3)

        return fig


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))
