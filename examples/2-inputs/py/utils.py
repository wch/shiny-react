from __future__ import annotations

from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer


def page_bare(*args: ui.TagChild, title: str | None = None, lang: str = "en") -> ui.Tag:
    return ui.tags.html(
        ui.tags.head(ui.tags.title(title)),
        ui.tags.body(shiny_deps(False), *args),
        lang=lang,
    )


class render_object(Renderer[Jsonifiable]):
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
        _fn: Optional[ValueFn[str]] = None,
    ) -> None:
        super().__init__(_fn)

    async def transform(self, value: str) -> Jsonifiable:
        return value
