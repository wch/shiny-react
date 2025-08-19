#!/bin/bash

# Build script for shiny-react packages
set -e

echo "🔨 Building shiny-react packages..."

# Build JavaScript package
echo "📦 Building JavaScript package..."
cd js
npm install
npm run build-prod
cd ..

# Copy JS build output to R and Python packages
echo "📋 Copying JS bundle to R package..."
cp js/dist/index.js r/inst/www/shiny-react.js
cp js/dist/index.js.map r/inst/www/shiny-react.js.map

echo "📋 Copying JS bundle to Python package..."
cp js/dist/index.js py/src/shiny_react/www/shiny-react.js
cp js/dist/index.js.map py/src/shiny_react/www/shiny-react.js.map

# Build R package
echo "📦 Building R package..."
cd r
if command -v R &> /dev/null; then
    echo "Running R CMD build..."
    R CMD build .
else
    echo "⚠️  R not found, skipping R package build"
fi
cd ..

# Build Python package
echo "📦 Building Python package..."
cd py
if command -v python &> /dev/null; then
    python -m pip install build
    python -m build
else
    echo "⚠️  Python not found, skipping Python package build"
fi
cd ..

echo "✅ Build complete!"
echo ""
echo "Outputs:"
echo "  JavaScript: js/dist/"
echo "  R package: r/*.tar.gz"
echo "  Python package: py/dist/"