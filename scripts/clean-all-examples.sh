#!/bin/bash

# Get list of example directories
EXAMPLE_DIRS=$(find examples -maxdepth 1 -type d -name "*-*" | sort)

START_DIR="$(pwd)"

if [ -z "$EXAMPLE_DIRS" ]; then
  echo "No example directories found under ./examples."
  echo "Are you running this from the top level of the shiny-react repository?"
  echo "Expected to find directories like examples/1-hello-world/"
  echo "If not, cd to the project root (so that ./examples/ exists) and re-run: scripts/build-all-examples.sh"
  exit 1
fi

echo "Found example directories: $EXAMPLE_DIRS"

for dir in $EXAMPLE_DIRS; do
  echo "Cleaning $dir..."
  cd "$dir"

  npm run clean

  cd "$START_DIR"
done
