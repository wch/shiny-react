from shiny import App, Inputs, Outputs, Session, ui, reactive
from shinyreact import page_bare
from pathlib import Path
import random

app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="Hello Shiny React",
)


def server(input: Inputs, output: Outputs, session: Session):
    # Simulate log events
    log_messages = [
        {"message": "User logged in", "type": "info"},
        {"message": "File saved successfully", "type": "success"},
        {"message": "Low disk space warning", "type": "warning"},
        {"message": "Connection failed", "type": "error"},
        {"message": "Backup completed", "type": "success"},
        {"message": "Processing data...", "type": "info"},
        {"message": "Invalid input detected", "type": "error"},
        {"message": "Cache cleared", "type": "info"},
    ]

    @reactive.effect
    async def _():
        # Timer that triggers every 2 seconds
        reactive.invalidate_later(2)
        log_event = random.choice(log_messages)
        await session.send_custom_message("logEvent", log_event)


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))
