#!/bin/bash

# Development script for shiny-react packages
set -e

echo "🚀 Starting development mode for shiny-react..."

# Install dependencies
echo "📦 Installing JavaScript dependencies..."
cd js
npm install
cd ..

echo "📦 Installing R dependencies..."
cd r
if command -v R &> /dev/null; then
    R -e "if (!require(devtools)) install.packages('devtools'); devtools::install_deps()"
else
    echo "⚠️  R not found, skipping R dependencies"
fi
cd ..

echo "📦 Installing Python dependencies..."
cd py
if command -v python &> /dev/null; then
    python -m pip install -e ".[dev]"
else
    echo "⚠️  Python not found, skipping Python dependencies"
fi
cd ..

# Initial build
echo "🔨 Running initial build..."
./scripts/build.sh

echo "✅ Development setup complete!"
echo ""
echo "To start development:"
echo "  cd js && npm run watch    # Watch JS changes"
echo "  cd apps/hello-world && R app.R   # Test R app"
echo "  cd apps/hello-world && python app.py   # Test Python app"