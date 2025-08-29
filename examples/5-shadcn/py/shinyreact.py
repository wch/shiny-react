from shiny import ui
from shiny.html_dependencies import shiny_deps
from shiny.types import Jsonifiable
from shiny.render.renderer import Renderer
from typing import Optional, Any

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
    
    def __init__(self, _fn: Optional = None) -> None:
        super().__init__(_fn)
    
    async def transform(self, value: Any) -> Jsonifiable:
        return value