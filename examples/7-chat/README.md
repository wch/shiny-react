# AI Chat Example

A modern AI chat application built with Shiny-React, featuring:

- **Frontend**: React with shadcn/ui components and Tailwind CSS
- **R Backend**: Shiny server with `ellmer` for LLM integration  
- **Python Backend**: Shiny server with `chatlas` for LLM integration
- **Modern UI**: Professional chat interface with message bubbles, avatars, and smooth scrolling

## Features

- 💬 Real-time bidirectional chat communication
- 🎨 Modern UI with shadcn/ui components
- 🔄 Message history and conversation state
- ⚡ Fast response handling with loading states
- 🎯 TypeScript for type safety
- 🎭 Responsive design with light/dark theme support

## Prerequisites

### For R Backend
```r
# Install required packages
install.packages(c("shiny", "ellmer"))
```

### For Python Backend  
```bash
# Install required packages
pip install shiny chatlas
```

### API Keys
Set up your OpenAI API key:
```bash
export OPENAI_API_KEY="your-api-key-here"
```

Or create a `.env` file:
```
OPENAI_API_KEY=your-api-key-here
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Build the Application
```bash
# Development build with watch mode
npm run watch

# Or one-time build
npm run build
```

### 3. Run Shiny Server

**For R Backend:**
```bash
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"
```

**For Python Backend:**
```bash  
shiny run py/app.py --port 8000
```

### 4. Open Browser
Navigate to `http://localhost:8000`

## Development Workflow

1. **Start file watcher** (rebuilds on changes):
   ```bash
   npm run watch
   ```

2. **Run Shiny server** (choose R or Python):
   ```bash
   # R
   R -e "shiny::runApp('r/app.R', port=8000)"
   
   # Python
   shiny run py/app.py --port 8000
   ```

3. **Make changes** to React components in `srcts/` - they will rebuild automatically

4. **Backend changes** are auto-reloaded by Shiny

## Project Structure

```
examples/7-chat/
├── package.json              # Node.js dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── build.ts                 # Custom build script with Tailwind CSS
├── components.json          # shadcn/ui configuration
├── srcts/                   # React TypeScript source
│   ├── main.tsx            # App entry point
│   ├── globals.css         # Tailwind + CSS variables
│   ├── components/
│   │   └── ChatInterface.tsx   # Main chat component
│   ├── components/ui/      # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   └── avatar.tsx
│   └── lib/
│       └── utils.ts        # Utility functions
├── r/                      # R Shiny backend
│   ├── app.R              # Main R application with ellmer
│   └── utils.R            # R utility functions
├── py/                     # Python Shiny backend
│   ├── app.py             # Main Python application with chatlas
│   └── utils.py           # Python utility functions
└── README.md              # This file
```

## Customization

### Changing AI Models

**R (ellmer):**
```r
# In r/app.R, modify the chat initialization:
chat <- chat_openai("Your system prompt", model = "gpt-4")

# Or use other providers:
chat <- chat_claude("Your system prompt")
chat <- chat_gemini("Your system prompt")
```

**Python (chatlas):**
```python
# In py/app.py, modify the chat initialization:
chat = ChatOpenAI(
    model="gpt-4",
    system_prompt="Your system prompt"
)

# Or use other providers (when available in chatlas)
```

### Customizing the UI

- **Modify components**: Edit `srcts/components/ChatInterface.tsx`
- **Change styling**: Update `srcts/globals.css` or component-specific styles
- **Add new shadcn components**: Run `npx shadcn@latest add <component-name>`

### Environment Variables

Both backends support these environment variables:

- `OPENAI_API_KEY`: OpenAI API key
- `ANTHROPIC_API_KEY`: Anthropic Claude API key (for ellmer)
- `GOOGLE_API_KEY`: Google Gemini API key (for ellmer)

## Troubleshooting

### API Key Issues
- Ensure your API key is set as an environment variable
- Check the console/terminal for error messages
- Verify the key has proper permissions

### Build Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clean and rebuild
npm run clean
npm run build
```

### Port Conflicts
Change the port if 8000 is in use:
```bash
# R
R -e "shiny::runApp('r/app.R', port=8001)"

# Python  
shiny run py/app.py --port 8001
```

## License

MIT License - see the main shiny-react repository for details.