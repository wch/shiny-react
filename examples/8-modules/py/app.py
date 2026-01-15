from shiny import App, module, reactive, ui
import shinyreact


# Module server function
@module.server
def counter_module_server(input, output, session):
    @output(id="serverCount")
    @shinyreact.render_json
    def _():
        """Double the count value and send to client"""
        if input.count() is not None:
            return input.count() * 2
        return 0

    @reactive.effect
    def _():
        """Send notification message every 5 counts"""
        count = input.count()
        if count is not None and count > 0 and count % 5 == 0:
            shinyreact.post_message(
                session,
                "notification",
                {"message": f"Milestone reached: {count}"},
            )


def server(input, output, session):
    # Initialize three independent module servers
    counter_module_server("counter1")
    counter_module_server("counter2")
    counter_module_server("counter3")


app = App(
    shinyreact.page_react(
        title="Modules - Shiny React",
        js_file="app.js",
        css_file="app.css",
    ),
    server,
)
