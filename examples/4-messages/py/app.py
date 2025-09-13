from shiny import App, Inputs, Outputs, Session, reactive
from shinyreact import page_react, post_message
from pathlib import Path
import random


def server(input: Inputs, output: Outputs, session: Session):
    # Simulate log events
    log_messages = [
        {"text": "User logged in", "category": "info"},
        {"text": "File saved successfully", "category": "success"},
        {"text": "Low disk space warning", "category": "warning"},
        {"text": "Backup completed", "category": "success"},
        {"text": "Processing data...", "category": "info"},
        {"text": "Cache cleared", "category": "info"},
    ]

    @reactive.effect
    async def _():
        # Timer that triggers every 2 seconds
        reactive.invalidate_later(2)
        log_event = random.choice(log_messages)
        await post_message(session, "logEvent", log_event)


app = App(
    page_react(title="Server-to-client messages - Shiny React"),
    server,
    static_assets=str(Path(__file__).parent / "www"),
)
