# CLAUDE.md

This file provides comprehensive guidance for Claude Code and other LLM coding agents when working with this AI Chat Shiny-React application.

## Project Overview

This is an AI Chat application built with Shiny-React, demonstrating modern web development practices:

- **Frontend**: React with TypeScript using shadcn/ui components and Tailwind CSS
- **Backend**: Dual Shiny servers (R with `ellmer`, Python with `chatlas`) for LLM integration
- **Communication**: Real-time bidirectional data flow via shiny-react library
- **Build System**: Custom ESBuild with Tailwind CSS processing and hot reload

**Key Concept**: This application bridges React's frontend reactivity with Shiny's backend reactivity, while integrating with Large Language Model APIs for AI-powered chat functionality.

## Directory Structure

```
examples/7-chat/
├── package.json              # Dependencies including shadcn/ui and build scripts
├── tsconfig.json            # TypeScript configuration with path aliases
├── build.ts                 # Custom ESBuild configuration with Tailwind CSS
├── components.json          # shadcn/ui CLI configuration
├── srcts/                   # React TypeScript source code
│   ├── main.tsx            # React app entry point
│   ├── globals.css         # Tailwind CSS with theme variables and chat styles
│   ├── components/
│   │   └── ChatInterface.tsx   # Main chat component using shiny-react hooks
│   ├── components/ui/      # shadcn/ui base components
│   │   ├── button.tsx      # Button component variants
│   │   ├── card.tsx        # Card layout component
│   │   ├── input.tsx       # Text input component
│   │   ├── scroll-area.tsx # Scrollable area component
│   │   └── avatar.tsx      # Avatar component for user/AI icons
│   └── lib/
│       └── utils.ts        # Utility functions (cn helper for class merging)
├── r/                      # R Shiny backend
│   ├── app.R              # Main R Shiny application with ellmer integration
│   ├── utils.R            # R utility functions (barePage, renderObject)
│   └── www/               # Built JavaScript/CSS output (auto-generated)
├── py/                     # Python Shiny backend
│   ├── app.py             # Main Python Shiny application with chatlas integration
│   ├── utils.py           # Python utility functions (page_bare, render_object)
│   └── www/               # Built JavaScript/CSS output (auto-generated)
├── README.md               # User-facing setup and usage instructions
└── CLAUDE.md              # This file - comprehensive technical documentation
```

## Key Features Implementation

### Modern Chat Interface
- **Message Bubbles**: User and assistant messages with distinct styling
- **Avatars**: User and Bot icons using shadcn/ui Avatar component
- **Auto-scroll**: Automatic scrolling to latest messages
- **Loading States**: Typing indicator animation while AI processes requests
- **Responsive Design**: Mobile-friendly layout using Tailwind CSS

### Real-time Communication
- **useShinyInput**: Sends user messages to backend (chat_input)
- **useShinyOutput**: Receives AI responses from backend (chat_response)  
- **Custom Messages**: Prepared for streaming responses (chat_stream handler)
- **Message History**: Frontend state management for conversation persistence

### AI Integration
- **R Backend**: Uses `ellmer` library for multiple LLM providers
- **Python Backend**: Uses `chatlas` library for LLM interactions
- **Error Handling**: Graceful fallbacks when API keys aren't configured
- **Demo Mode**: Functional demo responses for development/testing

## Build Commands and Workflow

### Development Setup
```bash
# Install all dependencies
npm install

# Development with hot reload (builds and watches)
npm run watch

# One-time build for production
npm run build

# Clean build artifacts
npm run clean
```

### Backend Server Commands
```bash
# R Backend
R -e "options(shiny.autoreload = TRUE); shiny::runApp('r/app.R', port=8000)"

# Python Backend  
shiny run py/app.py --port 8000
```

### Development Workflow
1. **Start watcher**: `npm run watch` (rebuilds on file changes)
2. **Start backend**: Choose R or Python backend server
3. **Open browser**: Navigate to `http://localhost:8000`
4. **Develop**: Edit React components - they rebuild automatically
5. **Backend changes**: Auto-reload enabled by Shiny

## Technical Architecture

### Frontend (React + shadcn/ui)

#### Main Component Structure
```typescript
// srcts/components/ChatInterface.tsx
function ChatInterface() {
  // Shiny-React hooks for communication
  const [currentMessage, setCurrentMessage] = useShinyInput<string>("chat_input", "");
  const [chatResponse] = useShinyOutput<string>("chat_response", "");
  
  // Local state for UI management
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
}
```

#### Message Data Structure
```typescript
interface Message {
  id: string;                    // Unique identifier
  role: "user" | "assistant";    // Message sender type
  content: string;               // Message text content
  timestamp: Date;               // When message was sent
}
```

#### shadcn/ui Components Usage
- **Card**: Main chat container with header and content areas
- **ScrollArea**: Message history with custom scrollbar styling
- **Input**: Message input field with placeholder and disabled states
- **Button**: Send button with icon and loading states
- **Avatar**: User and assistant avatars with fallback icons

### Backend Architecture

#### R Backend (ellmer integration)
```r
# Initialize AI chat client
chat <- chat_openai(
  "You are a helpful AI assistant. Be concise but informative in your responses.",
  model = "gpt-4o-mini"
)

# Handle incoming messages
observeEvent(input$chat_input, {
  user_message <- trimws(input$chat_input)
  ai_response <- chat$chat(user_message)
  output$chat_response <- renderText({ ai_response })
})
```

#### Python Backend (chatlas integration)  
```python
# Initialize AI chat client
chat = ChatOpenAI(
    model="gpt-4o-mini",
    system_prompt="You are a helpful AI assistant. Be concise but informative in your responses.",
)

# Handle incoming messages
@reactive.effect
@reactive.event(input.chat_input)
def handle_chat_input():
    user_message = input.chat_input().strip()
    ai_response = chat.chat(user_message)
    return ai_response
```

### Communication Protocol

#### Input/Output Mapping
- **Frontend → Backend**: `chat_input` (user message string)
- **Backend → Frontend**: `chat_response` (AI response string)
- **Additional**: `chat_history` (conversation history JSON)
- **Future**: `chat_stream` (streaming response chunks)

#### Data Flow Sequence
1. User types message in Input component
2. User clicks Send button or presses Enter
3. Message added to local messages state
4. `setCurrentMessage()` sends to Shiny backend
5. Backend processes with AI service (ellmer/chatlas)
6. Response triggers `useShinyOutput` update
7. New message added to conversation history
8. UI auto-scrolls to show latest message

## Styling and Theming

### CSS Architecture
- **Tailwind CSS**: Utility-first styling framework
- **CSS Variables**: Theme tokens for light/dark mode support  
- **Custom Classes**: Chat-specific animations and layouts
- **shadcn/ui**: Consistent component styling system

### Theme Variables (globals.css)
```css
:root {
  --background: oklch(1 0 0);           /* Light theme background */
  --foreground: oklch(0.145 0 0);       /* Light theme text */
  --primary: oklch(0.205 0 0);          /* Primary brand color */
  --muted: oklch(0.97 0 0);             /* Muted backgrounds */
  /* ... more theme variables */
}

.dark {
  --background: oklch(0.145 0 0);       /* Dark theme background */  
  --foreground: oklch(0.985 0 0);       /* Dark theme text */
  /* ... dark theme overrides */
}
```

### Chat-Specific Styles
- **Message Bubbles**: Max-width constraints, word wrapping
- **Typing Animation**: CSS keyframe animation for loading indicator
- **Auto-scroll**: Smooth scrolling to message bottom
- **Responsive Layout**: Mobile-friendly sizing and spacing

## LLM Integration Patterns

### Error Handling Strategy
Both backends implement graceful error handling:

1. **API Key Missing**: Demo responses for development
2. **Network Errors**: User-friendly error messages
3. **Rate Limiting**: Retry logic and user notification
4. **Service Unavailable**: Fallback responses

### Conversation Management
- **Session-based**: Each user session maintains independent conversation
- **History Tracking**: Complete conversation context sent to AI
- **Memory Management**: Potential for conversation length limits

### Multi-Provider Support
- **R (ellmer)**: OpenAI, Anthropic, Google, Ollama
- **Python (chatlas)**: OpenAI (with plans for other providers)
- **Configuration**: Environment variables for API keys

## Development Best Practices

### Adding New Features

#### Adding Streaming Support
1. **Frontend**: Implement `chat_stream` message handler
2. **Backend**: Use streaming APIs from ellmer/chatlas  
3. **UI**: Update loading states for chunk-by-chunk updates

#### Adding Message Persistence
1. **Backend**: Store messages in database/file system
2. **Frontend**: Load conversation history on app start
3. **Sync**: Maintain consistency between sessions

#### Adding New LLM Providers
1. **R**: Use ellmer's multi-provider support
2. **Python**: Extend chatlas integration or implement directly
3. **Configuration**: Add new environment variables

### Code Modification Guidelines

#### React Component Changes
- **File Location**: `srcts/components/ChatInterface.tsx`
- **State Management**: Use React hooks for local state
- **Shiny Communication**: Only use useShinyInput/Output for server communication
- **Styling**: Use shadcn/ui components and Tailwind classes

#### Backend Logic Changes
- **R**: Modify `r/app.R` for server logic
- **Python**: Modify `py/app.py` for server logic
- **Utilities**: Add reusable functions to respective utils files
- **Dependencies**: Update package installations as needed

#### Adding shadcn/ui Components
```bash
# Install new component
npx shadcn@latest add <component-name>

# Components are automatically added to srcts/components/ui/
# Import and use in React components
```

## Troubleshooting Guide

### Build Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json  
npm install

# Clear build cache
npm run clean
npm run build
```

### TypeScript Errors
- **Path Aliases**: Ensure `@/` imports work with tsconfig.json baseUrl
- **Component Imports**: Use correct shadcn/ui component imports
- **Type Definitions**: Add explicit types for shiny-react hooks

### Shiny Connection Issues
- **API Keys**: Verify environment variables are set
- **Port Conflicts**: Use different port if 8000 is in use
- **Console Logs**: Check browser DevTools and server logs

### LLM Integration Issues
- **R**: Ensure ellmer package is installed: `install.packages("ellmer")`
- **Python**: Ensure chatlas is installed: `pip install chatlas`
- **API Keys**: Set appropriate environment variables
- **Rate Limits**: Implement proper error handling for API quotas

## Extension Points

### Custom Message Types
- Add support for images, files, or structured data
- Extend Message interface with new properties
- Update UI components for rich content display

### Advanced AI Features
- **Function Calling**: Integrate with ellmer/chatlas tool support
- **RAG**: Add document retrieval and context injection
- **Multi-modal**: Support for image inputs and outputs

### Enhanced UI Features
- **Message Editing**: Allow users to edit sent messages
- **Conversation Export**: Save chat history to file
- **Theme Switching**: Runtime light/dark mode toggle
- **Accessibility**: Enhanced screen reader and keyboard support

## Performance Considerations

### Frontend Optimization
- **Virtual Scrolling**: For very long conversations
- **Message Chunking**: Load conversation history incrementally
- **Debounced Input**: Prevent excessive API calls during typing

### Backend Optimization
- **Connection Pooling**: Reuse HTTP connections for API calls
- **Response Caching**: Cache similar queries (with care for privacy)
- **Queue Management**: Handle multiple concurrent users

### Build Optimization
- **Bundle Splitting**: Separate vendor and app code
- **Tree Shaking**: Remove unused shadcn/ui components
- **Asset Optimization**: Compress CSS and minimize JavaScript

---

This application demonstrates modern full-stack development with React, Shiny, and AI integration. The combination of shadcn/ui for beautiful components, shiny-react for seamless communication, and ellmer/chatlas for AI capabilities creates a robust foundation for chat applications.