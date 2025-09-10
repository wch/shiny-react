from __future__ import annotations

from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer, ValueFn
from typing import Any, Optional
import os
from pathlib import Path


def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )


def page_react(
    *args: ui.TagChild,
    title: str | None = None,
    js_file: str | None = "main.js",
    css_file: str | None = "main.css",
    lang: str = "en",
) -> ui.Tag:

    head_items: list[ui.TagChild] = []

    if js_file:
        head_items.append(ui.tags.script(src=js_file, type="module"))
    if css_file:
        head_items.append(ui.tags.link(href=css_file, rel="stylesheet"))

    return page_bare(
        ui.head_content(*head_items),
        ui.div(id="root"),
        *args,
        title=title,
        lang=lang,
    )


class render_json(Renderer[Jsonifiable]):
    """
    Reactively render arbitrary JSON object.

    This is a generic renderer that can be used to render any Jsonifiable data.
    It sends the data to the client-side and let the client-side code handle the
    rendering.

    Returns
    -------
    :
        A decorator for a function that returns a Jsonifiable object.

    """

    def __init__(
        self,
        _fn: Optional[ValueFn[Any]] = None,
    ) -> None:
        super().__init__(_fn)

    async def transform(self, value: Jsonifiable) -> Jsonifiable:
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
