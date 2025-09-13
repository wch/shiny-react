#!/bin/bash

# Get list of example directories
EXAMPLE_DIRS=$(find examples -maxdepth 1 -type d -name "*-*" | sort)

if [ -z "$EXAMPLE_DIRS" ]; then
  echo "No example directories found under ./examples."
  echo "Are you running this from the top level of the shiny-react repository?"
  echo "Expected to find directories like examples/1-hello-world/"
  echo "If not, cd to the project root (so that ./examples/ exists) and re-run: scripts/build-all-examples.sh"
  exit 1
fi

echo "Found example directories: $EXAMPLE_DIRS"

START_DIR="$(pwd)"

# Build shiny-react package first, because it's a dependency for all examples
echo "Building shiny-react package..."
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run build

# Build all examples
for dir in $EXAMPLE_DIRS; do
  echo "Building $dir..."
  cd "$dir"

  # Install dependencies with npm ci for faster, reliable builds
  if [ -f package-lock.json ]; then
    npm ci
  else
    npm install
  fi

  # Build for both R and Python
  if command -v jq >/dev/null 2>&1 && jq -e '.scripts["build-prod"]' package.json >/dev/null 2>&1; then
    echo "Found build-prod script; running production build"
    npm run build-prod
  else
    echo "No build-prod script; running default build"
    npm run build
  fi

  # Verify build outputs exist
  echo "Checking build outputs for $dir:"
  ls -la r/www/ || echo "No R www directory found"
  ls -la py/www/ || echo "No Python www directory found"

  cd "$START_DIR"
done
