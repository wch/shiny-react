from pathlib import Path

import dotenv
from chatlas import ChatOpenAI, content_image_url
from shiny import App, Inputs, Outputs, Session, reactive

from shinyreact import page_react

# Load .env file in this directory for OPENAI_API_KEY
app_dir = Path(__file__).parent
env_file = app_dir / ".env"
print(env_file)
dotenv.load_dotenv(env_file)

# Initialize chat with OpenAI GPT-4o-mini by default
chat = ChatOpenAI(
    model="gpt-4o-mini",
    system_prompt="You are a helpful AI assistant. Be concise but informative in your responses.",
)


def server(input: Inputs, output: Outputs, session: Session):

    @reactive.effect
    @reactive.event(input.chat_input)
    async def handle_chat_input():
        message_data = input.chat_input()
        if not message_data or not message_data["text"]:
            return

        try:
            # Parse structured input (dict with text and attachments)
            # Handle both string (backwards compatibility) and structured input
            if isinstance(message_data, str):
                user_text = message_data.strip()
                attachments = []
            elif isinstance(message_data, dict):
                user_text = message_data.get("text", "").strip()
                attachments = message_data.get("attachments", [])
            else:
                user_text = ""
                attachments = []

            # Build chat arguments
            chat_args = []

            # Add user text if present
            if user_text:
                chat_args.append(user_text)

            # Add image attachments as content_image_url objects
            if attachments:
                for attachment in attachments:
                    if attachment.get("content") and attachment.get("type"):
                        # Create data URL from base64 content
                        data_url = (
                            f"data:{attachment['type']};base64,{attachment['content']}"
                        )
                        # Add image content to chat arguments
                        chat_args.append(content_image_url(data_url))

            # Ensure we have at least some content to send
            if not chat_args:
                chat_args = ["Please provide some content to analyze."]

            # Create async streaming with all arguments
            stream = await chat.stream_async(*chat_args)
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


app = App(
    page_react(title="AI Chat - Shiny React"),
    server,
    static_assets=str(Path(__file__).parent / "www"),
)
