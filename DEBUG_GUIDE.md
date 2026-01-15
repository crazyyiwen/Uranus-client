# Local Debugging Guide

## VSCode Debugging Setup

The project is now configured for debugging in VSCode with the following features:

### 🔧 Configurations Available

1. **Debug in Chrome** - Launch Chrome and debug the app
2. **Debug in Edge** - Launch Edge and debug the app
3. **Attach to Chrome** - Attach to an already running Chrome instance

### 🚀 How to Debug

#### Method 1: Debug in Chrome (Recommended)

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **In VSCode**:
   - Press `F5` or go to Run & Debug panel (Ctrl+Shift+D)
   - Select "Debug in Chrome" from dropdown
   - Click the green play button
   - Chrome will open automatically at http://localhost:5174

3. **Set breakpoints**:
   - Click in the gutter (left of line numbers) in any `.ts` or `.tsx` file
   - Red dots indicate breakpoints
   - Code execution will pause when breakpoint is hit

4. **Debug features available**:
   - Step over (F10)
   - Step into (F11)
   - Step out (Shift+F11)
   - Continue (F5)
   - View variables, call stack, watch expressions

#### Method 2: Debug in Edge

Same as Chrome, but select "Debug in Edge" configuration.

#### Method 3: Attach to Running Browser

1. **Start Chrome with remote debugging**:
   ```bash
   # Windows
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="C:\temp\chrome-debug" http://localhost:5174

   # Mac
   /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug http://localhost:5174

   # Linux
   google-chrome --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-debug http://localhost:5174
   ```

2. **In VSCode**:
   - Select "Attach to Chrome"
   - Press F5

### 🛠️ VSCode Tasks

Access tasks via Terminal → Run Task... or `Ctrl+Shift+P` → "Tasks: Run Task":

- **Start Dev Server** - Start Vite dev server
- **Build** - Build for production
- **Type Check** - Run TypeScript type checking
- **Lint** - Run ESLint

### 📝 Debugging Tips

#### React Component Debugging

```tsx
// Set breakpoint in component
function MyComponent() {
  debugger; // Or click in gutter to set breakpoint
  const [state, setState] = useState(0);

  useEffect(() => {
    debugger; // Debug effects
    console.log('Effect running');
  }, [state]);

  return <div>...</div>;
}
```

#### Zustand Store Debugging

```typescript
// In store file
export const useWorkflowStore = create<WorkflowState>()(
  immer((set) => ({
    addNode: (type, position) => set((state) => {
      debugger; // Set breakpoint here
      const newNode = createNodeByType(type, position);
      state.nodes.push(newNode);
    }),
  }))
);
```

#### API Request Debugging

```typescript
// In authStore.ts
login: async (username: string, password: string) => {
  try {
    debugger; // Set breakpoint before fetch
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    debugger; // Set breakpoint after fetch
    const data = await response.json();
    return data;
  } catch (error) {
    debugger; // Set breakpoint in catch
    console.error('Login error:', error);
  }
}
```

### 🔍 Console Debugging

#### Inspect Store State

Add to browser console:
```javascript
// Get current workflow state
window.workflowState = () => {
  return JSON.parse(localStorage.getItem('workflow_draft'));
}

// Get auth state
window.authState = () => {
  return JSON.parse(localStorage.getItem('auth-storage'));
}

// Clear all data
window.clearAll = () => {
  localStorage.clear();
  location.reload();
}
```

#### React DevTools

1. Install React DevTools extension for Chrome/Edge
2. Open DevTools (F12)
3. Click "Components" tab
4. Inspect component props, state, hooks

### 🧪 Network Debugging

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by:
   - **XHR** - See API calls
   - **JS** - See JavaScript files
   - **All** - See everything

4. Click on request to see:
   - Headers
   - Payload
   - Response
   - Timing

### 📊 Common Debug Scenarios

#### Scenario 1: Node not appearing on canvas

1. Set breakpoint in `WorkflowCanvas.tsx` in `onDrop` function
2. Drag node to canvas
3. Inspect `position` and `type` variables
4. Step through `addNode` function
5. Check if node is added to store

#### Scenario 2: Authentication failing

1. Set breakpoint in `authStore.ts` in `login` function
2. Try logging in
3. Inspect request payload
4. Check response status and data
5. View browser Network tab for actual request

#### Scenario 3: Config panel not opening

1. Set breakpoint in `WorkflowCanvas.tsx` in `onNodeDoubleClick`
2. Double-click node
3. Check if `openConfigPanel` is called with correct nodeId
4. Set breakpoint in `ConfigPanel.tsx`
5. Check `selectedNode` value

### ⚙️ VSCode Extensions (Recommended)

The following extensions are recommended (see `.vscode/extensions.json`):

- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **Path Intellisense** - File path autocomplete
- **Error Lens** - Inline error display
- **Pretty TypeScript Errors** - Better TS error messages

Install all recommended extensions:
1. Open VSCode
2. Press `Ctrl+Shift+P`
3. Type "Extensions: Show Recommended Extensions"
4. Click "Install All"

### 🎨 Prettier Configuration

Code formatting is configured in `.prettierrc`:
- Format on save enabled
- Single quotes
- 100 character line width
- 2 space indentation

To format code:
- **On save** - Automatic
- **Manual** - Press `Shift+Alt+F`
- **Whole file** - Right-click → Format Document

### 🔧 TypeScript Configuration

TypeScript strict mode is enabled. To check types:

```bash
# Command line
npm run build  # Also runs type check

# Or just type check
npx tsc --noEmit
```

In VSCode:
- Hover over variables to see types
- `Ctrl+Space` for autocomplete
- `F12` to go to definition
- `Shift+F12` to find all references

### 🐛 Debugging Hot Module Replacement (HMR)

If changes aren't appearing:

1. Check Vite terminal for errors
2. Check browser console for errors
3. Try hard refresh: `Ctrl+Shift+R`
4. Restart dev server: `Ctrl+C` then `npm run dev`

### 📱 Debug on Mobile

1. Start dev server with `--host`:
   ```bash
   npm run dev -- --host
   ```

2. Find your local IP (shown in terminal)

3. On mobile browser, visit: `http://YOUR_IP:5174`

4. Use Chrome Remote Debugging:
   - Connect phone via USB
   - Open `chrome://inspect` on desktop
   - Click "Inspect" next to your device

### 🎯 Performance Debugging

Use React DevTools Profiler:
1. Open React DevTools
2. Click "Profiler" tab
3. Click record button
4. Perform actions
5. Stop recording
6. Analyze component render times

### 📚 Additional Resources

- [VSCode Debugging Guide](https://code.visualstudio.com/docs/editor/debugging)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Chrome DevTools](https://developer.chrome.com/docs/devtools/)
- [Vite Debugging](https://vitejs.dev/guide/troubleshooting.html)
