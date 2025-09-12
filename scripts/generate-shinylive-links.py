#!/usr/bin/env python3
"""
Generate shinylive links for all example apps and create individual redirect HTML pages.
"""

import os
import subprocess
import json
import re
import shutil
from pathlib import Path
from typing import TypedDict


def get_example_apps() -> list[str]:
    """Get list of example app directories."""
    examples_dir = Path("examples")
    if not examples_dir.exists():
        return []

    apps: list[str] = []
    for item in examples_dir.iterdir():
        if item.is_dir() and re.match(r"^\d+-", item.name):
            apps.append(item.name)

    return sorted(apps)


class AppMetadata(TypedDict):
    title: str
    description: str
    deployToShinylive: bool
    comment: str


class AppData(TypedDict):
    id: str
    title: str
    description: str
    r_url: str
    python_url: str
    deployToShinylive: bool
    comment: str


def get_app_metadata(app_dir: str) -> AppMetadata:
    """Extract metadata from app's package.json file."""
    package_json_path = Path("examples") / app_dir / "package.json"

    default_metadata: AppMetadata = {
        "title": app_dir.replace("-", " ").title(),
        "description": "Shiny React example application",
        "deployToShinylive": True,
        "comment": "",
    }

    if not package_json_path.exists():
        return default_metadata

    try:
        with open(package_json_path, "r", encoding="utf-8") as f:
            package_data = json.load(f)

        # Get exampleMetadata section, fall back to defaults
        metadata = package_data.get("exampleMetadata", {})

        # Merge with defaults to ensure all keys exist
        result = default_metadata.copy()
        result.update(metadata)

        return result

    except (json.JSONDecodeError, FileNotFoundError) as e:
        print(f"Warning: Could not read metadata for {app_dir}: {e}")
        return default_metadata


def get_app_files(backend_path: str, backend_type: str) -> list[str]:
    """Get all files needed for a shinylive app."""
    if not os.path.exists(backend_path):
        return []

    files: list[str] = []
    backend_path_obj = Path(backend_path)

    # Get all files recursively, excluding certain patterns
    for file_path in backend_path_obj.rglob("*"):
        if file_path.is_file():
            # Skip cache files, DS_Store, etc.
            if any(
                pattern in str(file_path)
                for pattern in ["__pycache__", ".DS_Store", ".pyc", ".git", ".env"]
            ):
                continue
            files.append(str(file_path))

    return sorted(files)


def generate_shinylive_url(app_path: str, backend_type: str) -> str:
    """Generate a shinylive URL for the given app and backend type."""
    backend_path = os.path.join(app_path, backend_type)

    if not os.path.exists(backend_path):
        return ""

    # Get all files in the backend directory
    files: list[str] = get_app_files(backend_path, backend_type)
    if not files:
        print(f"No files found in {backend_path}")
        return ""

    # Use shinylive url encode with individual files
    cmd = ["shinylive", "url", "encode"] + files

    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            check=True,
        )
        return result.stdout.strip()
    except FileNotFoundError:
        print(
            f"shinylive command not found. Please install with: pip install shinylive"
        )
        return ""
    except subprocess.CalledProcessError as e:
        print(f"Error generating shinylive URL for {backend_path}: {e}")
        print(f"Command: {' '.join(cmd)}")
        print(f"Files: {files}")
        return ""


def generate_redirect_html(
    title: str, url: str, app_name: str, backend_type: str
) -> str:
    """Generate a redirect HTML page for a specific app/backend combination."""
    backend_display = "R" if backend_type == "r" else "Python"

    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="refresh" content=0.5;url={url}">
    <title>Redirecting to {title} ({backend_display}) - Shinylive</title>
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f8fafc;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
        }}

        .container {{
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
            padding: 3rem;
            border: 1px solid #e2e8f0;
            max-width: 500px;
        }}

        .spinner {{
            width: 40px;
            height: 40px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1.5rem;
        }}

        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}

        h1 {{
            color: #1e293b;
            margin-bottom: 1rem;
            font-size: 1.5rem;
        }}

        .description {{
            color: #64748b;
            margin-bottom: 2rem;
            line-height: 1.6;
        }}

        .manual-link {{
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
            margin-top: 1rem;
        }}

        .manual-link:hover {{
            background-color: #2563eb;
            color: white;
        }}

        .backend-badge {{
            display: inline-block;
            background-color: {"#3b82f6" if backend_type == "r" else "#059669"};
            color: white;
            padding: 0.25rem 0.75rem;
            border-radius: 12px;
            font-size: 0.875rem;
            font-weight: 500;
            margin-bottom: 1rem;
        }}

        .footer {{
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 0.875rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="spinner"></div>
        <div class="backend-badge">{backend_display}</div>
        <h1>{title}</h1>
        <div class="description">
            Redirecting you to the interactive {backend_display} version running on Shinylive...
            <br>You'll be redirected automatically in 2 seconds.
        </div>
        <a href="{url}" class="manual-link">Click here if redirect doesn't work</a>
        <div class="footer">
            Powered by <a href="https://shinylive.io/" target="_blank" style="color: #3b82f6;">Shinylive</a>
        </div>
    </div>

    <script>
        // Fallback redirect in case meta refresh doesn't work
        setTimeout(function() {{
            window.location.href = "{url}";
        }}, 2000);

        // Immediate redirect on click anywhere
        document.addEventListener('click', function() {{
            window.location.href = "{url}";
        }});
    </script>
</body>
</html>"""

    return html


def generate_index_html(app_data: list[AppData]) -> str:
    """Generate index HTML page with links to redirect pages."""
    html = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shiny React Examples - Shinylive Links</title>
    <style>
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
    background-color: #f8fafc;
}

h1 {
    color: #1e293b;
    text-align: center;
    margin-bottom: 2rem;
}

.description {
    text-align: center;
    color: #64748b;
    margin-bottom: 3rem;
    font-size: 1.1rem;
}

.apps-grid {
    display: grid;
    grid-template-columns: minmax(460px, 500px);
    gap: 0.5rem;
    justify-content: center;
}

@media (max-width: 500px) {
    .apps-grid {
        grid-template-columns: 1fr;
    }
}

.app-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    padding: 1.5rem;
    border: 1px solid #e2e8f0;
}

.app-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.app-description {
    color: #64748b;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.app-comment {
    background-color: #e2e8f0;
    color: #64748b;
    margin-bottom: 1rem;
    font-size: 0.85rem;
    padding: 0.5rem;
    border-radius: 4px;
}

.links {
    display: flex;
    gap: 0.75rem;
    flex-direction: row;
}

.link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    font-size: 0.875rem;
    transition: all 0.2s;
    flex: 1;
    text-align: center;
    white-space: nowrap;
}

.link-r {
    background-color: #3b82f6;
    color: white;
}

.link-r:hover {
    background-color: #2563eb;
    color: white;
}

.link-py {
    background-color: #f59e0b;
    color: white;
}

.link-py:hover {
    background-color: #d97706;
    color: white;
}

.link-source {
    background-color: #64748b;
    color: white;
}

.link-source:hover {
    background-color: #475569;
    color: white;
}

.link-disabled {
    background-color: #e2e8f0;
    color: #64748b;
    cursor: not-allowed;
}

.footer {
    text-align: center;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 1px solid #e2e8f0;
    color: #64748b;
}

/* Indicator for external links that will open in a new window. */
a[target="_blank"]::after {
    content: url('data:image/svg+xml,<%3Fxml version="1.0" encoding="utf-8"%3F><svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Interface / External_Link"><path id="Vector" d="M10.0002 5H8.2002C7.08009 5 6.51962 5 6.0918 5.21799C5.71547 5.40973 5.40973 5.71547 5.21799 6.0918C5 6.51962 5 7.08009 5 8.2002V15.8002C5 16.9203 5 17.4801 5.21799 17.9079C5.40973 18.2842 5.71547 18.5905 6.0918 18.7822C6.5192 19 7.07899 19 8.19691 19H15.8031C16.921 19 17.48 19 17.9074 18.7822C18.2837 18.5905 18.5905 18.2839 18.7822 17.9076C19 17.4802 19 16.921 19 15.8031V14M20 9V4M20 4H15M20 4L13 11"  stroke="%23ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g></svg>');
    display: inline-block;
    height: 1.2em;
    padding-left: 0.3em;
    aspect-ratio: 1;
    line-height: 1;
    vertical-align: 0.125em;
    color: inherit;

    @media (prefers-color-scheme: dark) {
        filter: invert(100%);
    }
}
    </style>
</head>
<body>
    <h1>Shiny React Examples</h1>
    <div class="description">
        Interactive examples of React components integrated with Shiny applications,
        running live in your browser via Shinylive.
    </div>

    <div class="apps-grid">
"""

    for app in app_data:
        app_id = app["id"]
        title = app["title"]
        description = app["description"]
        r_url = app["r_url"]
        python_url = app["python_url"]
        deploy_to_shinylive = app.get("deployToShinylive", True)
        comment = app.get("comment", "")

        # Extract number from app_id (e.g., "1-hello-world" -> "1")
        number_match = re.match(r"^(\d+)-", app_id)
        display_title = f"{number_match.group(1)}. {title}" if number_match else title

        html += f"""
        <div class="app-card">
            <div class="app-title">{display_title}</div>
            <div class="app-description">{description}</div>"""

        # Show comment if app is not deployed to shinylive
        if not deploy_to_shinylive and comment:
            html += f"""
            <div class="app-comment">
                <em>Note: {comment}</em>
            </div>"""

        html += """
            <div class="links">
"""
        # Add GitHub source code link for all apps
        github_url = f"https://github.com/wch/shiny-react/tree/main/examples/{app_id}"
        html += f'                <a href="{github_url}" class="link link-source" target="_blank">Source Code</a>\n'

        if deploy_to_shinylive and r_url:
            html += f'                <a href="{app_id}-r.html" class="link link-r" target="_blank">R Version</a>\n'
        # else:
        #     disabled_reason = (
        #         f" ({comment})"
        #         if not deploy_to_shinylive and comment
        #         else " (Not Available)"
        #     )
        #     html += f'                <span class="link link-disabled">R Version{disabled_reason}</span>\n'

        if deploy_to_shinylive and python_url:
            html += f'                <a href="{app_id}-python.html" class="link link-py" target="_blank">Python Version</a>\n'
        # else:
        #     disabled_reason = (
        #         f" ({comment})"
        #         if not deploy_to_shinylive and comment
        #         else " (Not Available)"
        #     )
        #     html += f'                <span class="link link-disabled">Python Version{disabled_reason}</span>\n'

        html += """            </div>
        </div>
"""

    html += """    </div>

    <div class="footer">
        <p>
            Built with <a href="https://github.com/posit-dev/shiny-react" target="_blank">shiny-react</a> •
            Apps powered by <a href="https://shiny.posit.co/">Shiny for R</a>, <a href="https://shiny.posit.co/py/">Shiny for Python</a>, and <a href="https://shinylive.io/" target="_blank">Shinylive</a>
        </p>
    </div>
</body>
</html>"""

    return html


def main():
    """Main function to generate all shinylive links and create individual redirect pages."""
    apps = get_example_apps()
    if not apps:
        print("No example apps found in examples/ directory")
        return

    print(f"Found {len(apps)} example apps: {', '.join(apps)}")

    # Create output directory
    output_dir = Path("shinylive-pages")
    if output_dir.exists():
        shutil.rmtree(output_dir)
    output_dir.mkdir(exist_ok=True)

    app_data: list[AppData] = []

    for app_dir in apps:
        print(f"\nProcessing {app_dir}...")

        # Get metadata from package.json
        metadata = get_app_metadata(app_dir)
        app_title = metadata["title"]

        # Skip apps that shouldn't be deployed to shinylive
        if not metadata["deployToShinylive"]:
            print(f"  Skipping shinylive deployment: {metadata['comment']}")
            app_data.append(
                {
                    "id": app_dir,
                    "title": app_title,
                    "description": metadata["description"],
                    "r_url": "",
                    "python_url": "",
                    "deployToShinylive": False,
                    "comment": metadata["comment"],
                }
            )
            continue

        app_path = os.path.join("examples", app_dir)

        # Generate R and Python URLs
        r_url = generate_shinylive_url(app_path, "r")
        python_url = generate_shinylive_url(app_path, "py")

        if r_url:
            print(f"  R URL length: {len(r_url)}")
            # Create R redirect page
            r_html = generate_redirect_html(app_title, r_url, app_dir, "r")
            r_file = output_dir / f"{app_dir}-r.html"
            with open(r_file, "w", encoding="utf-8") as f:
                f.write(r_html)
        else:
            print(f"  R URL: Not available")

        if python_url:
            print(f"  Python URL length: {len(python_url)}")
            # Create Python redirect page
            python_html = generate_redirect_html(
                app_title, python_url, app_dir, "python"
            )
            python_file = output_dir / f"{app_dir}-python.html"
            with open(python_file, "w", encoding="utf-8") as f:
                f.write(python_html)
        else:
            print(f"  Python URL: Not available")

        app_data.append(
            {
                "id": app_dir,
                "title": app_title,
                "description": metadata["description"],
                "r_url": r_url,
                "python_url": python_url,
                "deployToShinylive": True,
                "comment": metadata["comment"],
            }
        )

    # Generate index HTML page
    index_html = generate_index_html(app_data)

    # Write index HTML file
    index_file = output_dir / "index.html"
    with open(index_file, "w", encoding="utf-8") as f:
        f.write(index_html)

    print(f"\nGenerated index.html with {len(app_data)} apps")

    # Also save JSON data for potential API use
    json_file = output_dir / "shinylive-links.json"
    with open(json_file, "w", encoding="utf-8") as f:
        json.dump(app_data, f, indent=2)

    print("Generated shinylive-links.json with structured data")

    # List generated files
    generated_files = list(output_dir.glob("*.html"))
    print(f"\nGenerated {len(generated_files)} HTML files:")
    for file in sorted(generated_files):
        print(f"  {file.name}")


if __name__ == "__main__":
    main()
