from pathlib import Path

from shiny import App, ui, render, reactive
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from shinyreact import react_sidebar_layout, react_nav_panel
import faicons as fa

# Create mtcars equivalent dataset
mtcars = pd.DataFrame({
    'mpg': [21.0, 21.0, 22.8, 21.4, 18.7, 18.1, 14.3, 24.4, 22.8, 19.2],
    'cyl': [6, 6, 4, 6, 8, 6, 8, 4, 4, 6],
    'disp': [160.0, 160.0, 108.0, 258.0, 360.0, 225.0, 360.0, 146.7, 140.8, 167.6],
    'hp': [110, 110, 93, 110, 175, 105, 245, 62, 95, 123],
    'drat': [3.90, 3.90, 3.85, 3.08, 3.15, 2.76, 3.21, 3.69, 3.92, 3.92]
})
mtcars.index = ['Mazda RX4', 'Mazda RX4 Wag', 'Datsun 710', 'Hornet 4 Drive',
                'Hornet Sportabout', 'Valiant', 'Duster 360', 'Merc 240D',
                'Merc 230', 'Merc 280']

# Define UI
app_ui = ui.page_fillable(
    ui.tags.head(
        ui.tags.link(
            href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
            rel="stylesheet"
        )
    ),

    # React sidebar layout with three panels
    react_sidebar_layout(
        # Panel 1: Dashboard
        react_nav_panel(
            "Dashboard",

            # Sales Overview Card
            ui.card(
                ui.card_header("Sales Overview"),
                ui.card_body(
                    ui.output_plot("salesPlot", height="300px")
                )
            ),

            # Controls Card
            ui.card(
                ui.card_header("Controls"),
                ui.card_body(
                    ui.input_slider("months", "Months:", min=1, max=12, value=6),
                    ui.input_select(
                        "region",
                        "Region:",
                        choices=["North", "South", "East", "West"]
                    )
                )
            ),

            icon=fa.icon_svg("chart-bar"),
            value="dashboard",
        ),

        # Panel 2: Data
        react_nav_panel(
            "Data",

            # Data Table Card
            ui.card(
                ui.card_header("Data Table"),
                ui.card_body(
                    ui.output_table("dataTable")
                )
            ),

            # Refresh Controls
            ui.input_action_button("refresh", "Refresh Data", class_="btn-primary mt-3"),
            ui.output_text_verbatim("refreshCount"),

            icon=fa.icon_svg("table"),
            value="data",
        ),

        # Panel 3: Settings
        react_nav_panel(
            "Settings",

            # Preferences Card
            ui.card(
                ui.card_header("Preferences"),
                ui.card_body(
                    ui.input_text("username", "Username:"),
                    ui.input_checkbox("darkMode", "Dark Mode", False),
                    ui.input_checkbox("notifications", "Enable Notifications", True)
                )
            ),

            # Current Settings Card
            ui.card(
                ui.card_header("Current Settings"),
                ui.card_body(
                    ui.output_text_verbatim("currentSettings")
                )
            ),

            icon=fa.icon_svg("gear"),
            value="settings",
        ),

        title="Blended Demo",
    ),
    padding=0,
)


# Define server logic
def server(input, output, session):
    # Sales Plot - reactive to months and region
    @render.plot
    def salesPlot():
        # Generate cumulative sales data based on inputs
        months = np.arange(1, input.months() + 1)
        np.random.seed(42)  # For reproducibility
        sales = np.cumsum(np.random.uniform(50, 150, input.months()))

        # Create line plot
        fig, ax = plt.subplots(figsize=(8, 4))
        ax.plot(months, sales, linewidth=2, color='#2563eb', marker='o',
                markersize=8, markerfacecolor='#2563eb')
        ax.set_title(f'Sales Trend - {input.region()}', fontsize=14, fontweight='bold')
        ax.set_xlabel('Month', fontsize=11)
        ax.set_ylabel('Cumulative Sales ($1000s)', fontsize=11)
        ax.grid(True, color='#e5e7eb', linestyle='-', linewidth=0.5)
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)

        return fig

    # Data Table - showing mtcars data
    @render.table
    def dataTable():
        return mtcars.head(10)

    # Refresh Counter - reactive value for button clicks
    refresh_count = reactive.value(0)

    @reactive.effect
    @reactive.event(input.refresh)
    def _():
        refresh_count.set(refresh_count() + 1)

    @render.text
    def refreshCount():
        return f"Data refreshed {refresh_count()} times"

    # Current Settings Display
    @render.text
    def currentSettings():
        username = input.username() if len(input.username()) > 0 else "(not set)"
        return f"""username: {username}
darkMode: {input.darkMode()}
notifications: {input.notifications()}"""

    # Dark Mode Toggle
    @reactive.effect
    @reactive.event(input.darkMode)
    def _():
        # Note: toggle_dark_mode function would need to be implemented
        # in shinyreact.py or as a custom message handler
        pass


# Run the application
app = App(app_ui, server, static_assets=Path(__file__).parent / "www")
