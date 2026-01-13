# Uranus Agent Workflow Builder

A React-based graphical workflow builder for creating AI agent workflows with drag-and-drop functionality.

## Features Implemented

### ✅ Core Features
- **Drag-and-Drop Canvas**: Build workflows by dragging nodes from the sidebar
- **React Flow Integration**: Professional node-based workflow canvas with zoom, pan, and minimap
- **Multiple Node Types**: START, Agent, Output, LLM, HTTP Request, Guardrail, Rule, Workflow, Variable, Script
- **Configuration Panel**: Double-click nodes to open a detailed configuration slider
- **Agent Configuration**:
  - Agent strategy selection (ReAct, Plan-and-Execute, Custom)
  - Model selection (GPT-4.1, GPT-4, Claude 3 Opus/Sonnet)
  - Prompt template editor with system/user/assistant messages
  - Tools management with handoff support
- **Auto-Save**: Automatic saving to localStorage every 3 seconds
- **Draft/Publish Workflow**: Save drafts and publish workflows
- **State Management**: Zustand stores for workflow, UI, and storage state
- **Type-Safe**: Full TypeScript support with comprehensive type definitions

### 🎨 UI Components
- Modern UI using shadcn/ui and Tailwind CSS
- Top navigation with tabs (Properties, JSON, Interface, Variables)
- Left sidebar with Nodes/Tools tabs
- Draggable node cards with icons and descriptions
- Configuration slider panel for node settings
- Badge system for tools and status indicators

### 💾 Data Persistence
- localStorage-based draft storage
- Publish functionality for finalizing workflows
- Export/Import workflow JSON
- Auto-save with timestamp display

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **React Flow** - Node-based workflow canvas
- **Zustand** - State management
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

## Usage

### Creating a Workflow

1. **Drag Nodes**: Drag node types from the left sidebar onto the canvas
2. **Connect Nodes**: Click and drag from one node's handle to another to create connections
3. **Configure Nodes**: Double-click any node to open the configuration panel
4. **Save**: Click the "Save" button in the top navigation (or wait for auto-save)
5. **Publish**: Click "Publish" to promote your draft to published status

### Agent Configuration

When you double-click an Agent node, you can configure:

- **Name & Description**: Basic node information
- **Agent Strategy**: Choose how the agent reasons (ReAct, Plan-and-Execute, Custom)
- **Model**: Select the AI model to use
- **Prompt Templates**: Add system, user, and assistant messages
- **Tools**: Add tools that the agent can use
  - **Handoff Tools**: Create connections to other nodes
  - **MCP Tools**: External tools
  - **HTTP Tools**: API calls
  - **Function Tools**: Custom functions

### Handoff System

When you add a "Handoff" tool to an agent:
1. Select the target node
2. A dashed edge will automatically be created
3. The agent can pass control to the target node during execution

## Project Structure

```
src/
├── components/
│   ├── WorkflowCanvas/       # React Flow canvas and custom nodes
│   ├── Sidebar/              # Node and tool palettes
│   ├── TopNavigation/        # Top nav bar with tabs
│   ├── ConfigurationPanel/   # Node configuration slider
│   └── ui/                   # shadcn/ui components
├── store/
│   ├── workflowStore.ts      # Workflow state management
│   ├── uiStore.ts            # UI state management
│   └── storageStore.ts       # localStorage management
├── types/
│   ├── workflow.types.ts     # Workflow type definitions
│   └── node.types.ts         # Node-specific types
├── hooks/
│   └── useAutoSave.ts        # Auto-save hook
├── utils/
│   ├── nodeDefaults.ts       # Default node configurations
│   ├── validation.ts         # Workflow validation
│   └── dateUtils.ts          # Date formatting utilities
└── App.tsx                   # Main application component
```

## Data Format

Workflows are stored in JSON format matching the `agentic_workflow.json` structure:

```json
{
  "agenticWorkflowId": "uuid",
  "name": "Workflow Name",
  "displayName": "Display Name",
  "description": "Description",
  "nodes": [...],
  "edges": [...],
  "variables": {
    "flow": [],
    "system": []
  },
  "interface": {
    "inputs": {},
    "outputs": {}
  },
  "status": "draft" | "published"
}
```

## Upcoming Features

- JSON view with Monaco editor
- Interface view for inputs/outputs
- Variables view for flow/system variables
- Additional node types (LLM, HTTP, Guardrail, etc.) with full configuration
- Workflow validation and error highlighting
- Keyboard shortcuts (Delete, Copy/Paste, Undo/Redo)
- Export/Import workflow files
- Workflow execution (requires backend)

## Backend Integration

This is currently a frontend-only application. To integrate with a backend:

1. Replace `localStorage` operations in `storageStore.ts` with API calls
2. Add API endpoints for:
   - `POST /api/workflows/draft` - Save draft
   - `POST /api/workflows/publish` - Publish workflow
   - `GET /api/workflows/:id` - Load workflow
   - `GET /api/workflows` - List workflows
3. Update MongoDB schema to match `WorkflowData` type

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
