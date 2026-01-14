from pathlib import Path

from shiny import App, module, reactive, render, ui
import shinyreact


def counter_ui(id: str, title: str = "Counter"):
    """
    Counter Widget UI

    Creates a React-powered counter widget card that can be used in a standard
    Shiny app. The counter maintains its state independently using Shiny modules.

    Args:
        id: Module ID for namespacing
        title: Title to display on the card

    Returns:
        UI elements for the counter widget
    """
    return ui.card(
        ui.card_header(title),
        # Custom element for the React component
        # The counter-widget element is automatically initialized by the custom element
        # The id attribute provides the module namespace
        ui.HTML(f'<counter-widget id="{id}" class="counter-widget-container"></counter-widget>'),
        # Load the React widget bundle
        ui.head_content(
            ui.include_css(Path(__file__).parent / "www/widget.css"),
            ui.include_js(Path(__file__).parent / "www/widget.js"),
        ),
    )


@module.server
def counter_server(input, output, session):
    """
    Counter Widget Server

    Server logic for the counter widget. Handles the reactive communication
    between the React component and Shiny server.

    Returns:
        A reactive value containing the current count
    """

    @output(id="serverCount")
    @shinyreact.render_json
    def _():
        """Double the count value and send to client"""
        if input.count() is not None:
            return input.count() * 2
        return 0

    @reactive.effect
    async def _():
        """Send notification message every 5 counts"""
        count = input.count()
        if count is not None and count > 0 and count % 5 == 0:
            await shinyreact.post_message(
                session,
                "notification",
                {"message": f"Milestone reached: {count}"},
            )

    # Return a reactive containing the current count
    @reactive.calc
    def count():
        return input.count() if input.count() is not None else 0

    return count


# UI
app_ui = ui.page_fluid(
    # Header
    ui.div(
        {"class": "container mt-4"},
        ui.h1("Shiny React Counter Widgets"),
        ui.p(
            "React-powered counter components in a traditional Shiny app.",
            class_="lead",
        ),
        ui.hr(),
    ),
    # Static counter widgets in a grid layout
    ui.layout_columns(
        counter_ui("counter1", "Counter A"),
        counter_ui("counter2", "Counter B"),
        counter_ui("counter3", "Counter C"),
        col_widths=(4, 4, 4),
    ),
    # Dynamic widget management section
    ui.div(
        {"class": "container mt-4"},
        ui.card(
            ui.card_header("Dynamic Widget Management"),
            ui.card_body(
                ui.p("Test dynamic rendering by adding and removing counter widgets:"),
                ui.div(
                    {"class": "d-flex gap-2 mb-3"},
                    ui.input_action_button("add_widget", "Add Counter", class_="btn-primary"),
                    ui.input_action_button("remove_widget", "Remove Last Counter", class_="btn-secondary"),
                ),
                ui.div(
                    id="dynamic_widgets_container",
                    style="display: grid;"
                      "grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));"
                      "gap: 1rem;",
                ),
            ),
        ),
    ),
    # Summary section showing the reactive values
    ui.div(
        {"class": "container mt-4"},
        ui.card(
            ui.card_header("Current Counts (from server)"),
            ui.card_body(
                ui.p("These values are returned by the counter_server() function:"),
                ui.output_text_verbatim("counts_summary"),
            ),
        ),
    ),
    # Info section
    ui.div(
        {"class": "container mt-4 mb-4"},
        ui.card(
            ui.card_header("How It Works"),
            ui.card_body(
                ui.tags.ul(
                    ui.tags.li(
                        ui.tags.strong("counter_ui()"),
                        " creates a card with a mount point for the React widget",
                    ),
                    ui.tags.li(
                        ui.tags.strong("counter_server()"),
                        " sets up the Shiny module logic and returns a reactive",
                    ),
                    ui.tags.li(
                        "Each widget operates independently thanks to Shiny module namespacing"
                    ),
                    ui.tags.li(
                        "The React components use ",
                        ui.tags.code("ShinyModuleProvider"),
                        " to automatically namespace all hooks",
                    ),
                )
            ),
        ),
    ),
)


# Server
def server(input, output, session):
    # Initialize counter servers and capture their reactive return values
    count1 = counter_server("counter1")
    count2 = counter_server("counter2")
    count3 = counter_server("counter3")

    # Track dynamically added widgets
    dynamic_widget_ids = reactive.value([])
    next_widget_num = reactive.value(1)

    @reactive.effect
    @reactive.event(input.add_widget)
    def _():
        """Add a new dynamic widget"""
        widget_num = next_widget_num()
        widget_id = f"dynamic{widget_num}"

        # Insert the widget UI
        ui.insert_ui(
            ui.div(
                {"id": f"widget_wrapper_{widget_id}", "class": "mb-3"},
                counter_ui(widget_id, f"Dynamic Counter {widget_num}"),
            ),
            selector="#dynamic_widgets_container",
            where="beforeEnd",
        )

        # Initialize the server for this widget
        counter_server(widget_id)

        # Track the widget ID
        ids = dynamic_widget_ids()
        dynamic_widget_ids.set(ids + [widget_id])

        # Increment counter for next widget
        next_widget_num.set(widget_num + 1)

    @reactive.effect
    @reactive.event(input.remove_widget)
    def _():
        """Remove the last dynamic widget"""
        ids = dynamic_widget_ids()

        if len(ids) > 0:
            # Get the last widget ID
            last_id = ids[-1]

            # Remove the UI
            ui.remove_ui(selector=f"#widget_wrapper_{last_id}")

            # Remove from tracking
            dynamic_widget_ids.set(ids[:-1])

    @render.text
    def counts_summary():
        return f"Counter A: {count1()}\nCounter B: {count2()}\nCounter C: {count3()}"


app = App(app_ui, server)
