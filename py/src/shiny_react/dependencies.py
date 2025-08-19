"""
HTML dependencies for shiny-react
"""

from pathlib import Path
from typing import List

from htmltools import HTMLDependency, div
from shiny import ui


def shiny_react_dependency() -> HTMLDependency:
    """
    Create the HTML dependency for the shiny-react JavaScript library.
    
    Returns:
        HTMLDependency: The shiny-react HTML dependency
    """
    www_path = Path(__file__).parent / "www"
    
    return HTMLDependency(
        name="shiny-react",
        version="1.0.0",
        source={"subdir": str(www_path)},
        script={"src": "shiny-react.js", "type": "module"},
    )


def react_component(id: str = "react-root", **kwargs) -> ui.TagList:
    """
    Create a div element with the shiny-react dependency for mounting React components.
    
    Args:
        id: The element ID for the React root
        **kwargs: Additional attributes to pass to the div
        
    Returns:
        TagList: HTML elements with the shiny-react dependency and div
    """
    return ui.TagList(
        shiny_react_dependency(),
        div(id=id, **kwargs)
    )