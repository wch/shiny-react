from shiny import App, Inputs, Outputs, Session, ui, render, reactive
from utils import page_bare, render_object
from pathlib import Path
from utils import load_dotenv
from chatlas import ChatOpenAI

load_dotenv()

# Initialize chat with OpenAI GPT-4o-mini by default
chat = ChatOpenAI(
    model="gpt-4o-mini",
    system_prompt="You are a helpful AI assistant. Be concise but informative in your responses.",
)

app_ui = page_bare(
    ui.head_content(
        ui.tags.script(src="main.js", type="module"),
        ui.tags.link(href="main.css", rel="stylesheet"),
    ),
    ui.div(id="root"),
    title="AI Chat - Shiny React",
)


def server(input: Inputs, output: Outputs, session: Session):

    @reactive.effect
    @reactive.event(input.chat_input)
    async def handle_chat_input():
        if not input.chat_input() or not input.chat_input().strip():
            return

        user_message = input.chat_input().strip()

        try:
            stream = await chat.stream_async(user_message)
            async for chunk in stream:
                await send_chunk(chunk)

            await send_chunk("", done=True)

        except Exception as e:
            print(f"Error getting AI response: {e}")
            await send_chunk(
                "Sorry, I encountered an error processing your request. Please try again.",
                done=True,
            )

    # Send a chunk of text to the front end
    async def send_chunk(chunk: str, done: bool = False):
        await session.send_custom_message("chat_stream", {"chunk": chunk, "done": done})


app = App(app_ui, server, static_assets=str(Path(__file__).parent / "www"))
