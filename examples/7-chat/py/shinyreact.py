from __future__ import annotations

from typing import Any, Mapping, Optional, Sequence, Union

from shiny import Session, ui
from shiny.html_dependencies import shiny_deps
from shiny.render.renderer import Renderer, ValueFn
from shiny.types import Jsonifiable


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


# This is like Jsonifiable, but where Jsonifiable uses Dict, List, and Tuple,
# this replaces those with Mapping and Sequence. Because Dict and List are
# invariant, it can cause problems when a parameter is specified as Jsonifiable;
# the replacements are covariant, which solves these problems.
JsonifiableIn = Union[
    str,
    int,
    float,
    bool,
    None,
    Sequence["JsonifiableIn"],
    "JsonifiableMapping",
]

JsonifiableMapping = Mapping[str, JsonifiableIn]


async def post_message(session: Session, type: str, data: JsonifiableIn):
    """
    Send a custom message to the client.

    A convenience function for sending custom messages from the Shiny server to
    React components using useShinyMessageHandler() hook. This wraps messages in
    a standard format and sends them via the "shinyReactMessage" channel.

    Parameters
    ----------
    session
        The Shiny session object
    type
        The message type (should match the messageType in
        useShinyMessageHandler)
    data
        The data to send to the client
    """
    await session.send_custom_message("shinyReactMessage", {"type": type, "data": data})
