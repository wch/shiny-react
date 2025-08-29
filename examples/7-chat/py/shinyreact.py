import os
from pathlib import Path
from typing import Any
from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer
from typing import Optional, Callable, Any


# Bare page without default Shiny styling
def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )


# Custom renderer for arbitrary JSON data
class render_object(Renderer[Jsonifiable]):
    """Reactively render arbitrary JSON object."""

    def __init__(self, _fn: Optional[Callable[[], Any]] = None) -> None:
        super().__init__(_fn)

    async def transform(self, value: Any) -> Jsonifiable:
        return value


app_dir = Path(__file__).parent
env_file = app_dir / ".env"


def load_dotenv(dotenv_path: os.PathLike[str] = env_file, **kwargs: Any) -> None:
    """Load environment variables from .env file."""
    try:
        import dotenv

        dotenv.load_dotenv(dotenv_path=dotenv_path, **kwargs)
    except ImportError:
        import warnings

        warnings.warn(
            "Could not import `dotenv`. If you want to use `.env` files to "
            "load environment variables, please install it using "
            "`pip install python-dotenv`.",
            stacklevel=2,
        )
