# Data Model Manager Service

A powerful data management service for React applications with change tracking, immutability, and undo/redo support.

## Features

- ✅ **Register/Deregister** data models by unique ID
- ✅ **Immutable Updates** with deep cloning using lodash
- ✅ **Change Tracking** with full patch history
- ✅ **Path-based Access** using dot notation or arrays (e.g., `"user.profile.name"`)
- ✅ **Subscribe to Changes** with reactive updates
- ✅ **Undo/Redo Support** via patch application
- ✅ **TypeScript** fully typed with interfaces
- ✅ **Zustand** powered state management

## Installation

The service is already included in the project. Dependencies:
- `zustand` - State management
- `lodash` - Deep object operations
- `uuid` - Unique ID generation

## Usage

### Method 1: Using the Hook (Recommended for React Components)

```typescript
import { useDataModelManager } from '@/services/dataModelManager.service';

function MyComponent() {
  const dm = useDataModelManager();

  useEffect(() => {
    // Register a data model
    dm.registerDataModel('user', {
      name: 'John Doe',
      email: 'john@example.com',
      profile: {
        age: 30,
        address: {
          city: 'New York',
          country: 'USA'
        }
      }
    });

    return () => {
      dm.deregisterDataModel('user');
    };
  }, []);

  // Get value
  const userName = dm.getIn('user', 'name');
  const userCity = dm.getIn('user', ['profile', 'address', 'city']);

  // Update value
  const updateName = () => {
    dm.setIn('user', 'name', 'Jane Doe');
  };

  return <div>{userName}</div>;
}
```

### Method 2: Using the Static Class (For Services/Non-React Code)

```typescript
import DataModelManager from '@/services/dataModelManager.service';

// Register
DataModelManager.registerDataModel('config', {
  theme: 'light',
  language: 'en'
});

// Get
const theme = DataModelManager.getIn('config', 'theme');

// Set
DataModelManager.setIn('config', 'theme', 'dark');

// Deregister
DataModelManager.deregisterDataModel('config');
```

## API Reference

### Register Data Model

```typescript
registerDataModel(
  dataModelId: string,
  dataModel: any,
  overwrite?: boolean,
  isMutable?: boolean
): void
```

**Parameters:**
- `dataModelId` - Unique identifier for the data model
- `dataModel` - The data object to store
- `overwrite` - Allow overwriting existing model (default: false)
- `isMutable` - Store as mutable (no cloning) (default: false)

**Example:**
```typescript
dm.registerDataModel('user', { name: 'John', age: 30 });

// Overwrite existing
dm.registerDataModel('user', { name: 'Jane', age: 25 }, true);

// Store mutable reference (not recommended)
dm.registerDataModel('temp', myObject, false, true);
```

### Deregister Data Model

```typescript
deregisterDataModel(dataModelId: string): void
```

Removes a data model and clears its change history.

```typescript
dm.deregisterDataModel('user');
```

### Check Existence

```typescript
// Check if model exists
has(dataModelId: string): boolean

// Check if path exists in model
hasIn(dataModelId: string, path: Segments): boolean
```

**Example:**
```typescript
if (dm.has('user')) {
  console.log('User model exists');
}

if (dm.hasIn('user', 'profile.address.city')) {
  console.log('City path exists');
}
```

### Get Data

```typescript
// Get entire model
getById(dataModelId: string): any

// Get value at path
getIn(dataModelId: string, path: Segments): any
```

**Path formats:**
- String: `"name"`, `"profile.address.city"`
- Array: `["profile", "address", "city"]`

**Example:**
```typescript
// Get entire model
const user = dm.getById('user');

// Get nested values
const name = dm.getIn('user', 'name');
const city = dm.getIn('user', 'profile.address.city');
const country = dm.getIn('user', ['profile', 'address', 'country']);
```

### Set Data

```typescript
setIn(dataModelId: string, path: Segments, value: any): void
```

Updates a value at the specified path. Creates a patch in history.

**Example:**
```typescript
dm.setIn('user', 'name', 'Jane Doe');
dm.setIn('user', 'profile.age', 31);
dm.setIn('user', ['profile', 'address', 'city'], 'Los Angeles');
```

### Extend Data

```typescript
extend(
  storeId: string,
  path: Segments,
  value: any,
  overwrite?: boolean
): void
```

Similar to `setIn` but specifically for extending/merging data.

### Undo/Redo with Patches

```typescript
// Get all patches
getStoreChanges(): IStorePatch[]

// Apply a patch (undo)
applyPatch(patchId: string): void

// Clear history
clearHistory(): void
```

**Example:**
```typescript
// Get change history
const history = dm.getStoreChanges();
console.log(`${history.length} changes recorded`);

// Undo last change
if (history.length > 0) {
  const lastPatch = history[history.length - 1];
  dm.applyPatch(lastPatch.patchId);
}

// Clear all history
dm.clearHistory();
```

## Subscribe to Changes

### Subscribe to All Changes

```typescript
import { subscribeToDataModelChanges } from '@/services/dataModelManager.service';

const unsubscribe = subscribeToDataModelChanges((change) => {
  console.log('Change detected:', change);
  console.log('Store ID:', change.patch.storeId);
  console.log('Operation:', change.patch.operation);
  console.log('Path:', change.patch.patchedPath);
  console.log('New Value:', change.patch.patchedValue);
  console.log('Old Value:', change.patch.previousValue);
});

// Cleanup
unsubscribe();
```

### Subscribe to Specific Model

```typescript
import { subscribeToDataModel } from '@/services/dataModelManager.service';

const unsubscribe = subscribeToDataModel('user', (dataModel, patch) => {
  console.log('User model updated:', dataModel);
  console.log('Changed path:', patch.patchedPath);
});

// Cleanup
unsubscribe();
```

### React Component Example

```typescript
function UserProfile() {
  const dm = useDataModelManager();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Subscribe to user model changes
    const unsubscribe = subscribeToDataModel('user', (dataModel) => {
      setUserData(dataModel);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      {userData && (
        <>
          <h1>{userData.name}</h1>
          <p>{userData.email}</p>
        </>
      )}
    </div>
  );
}
```

## Patch Structure

Each change creates a patch with the following structure:

```typescript
interface IStorePatch {
  patchId: string;              // Unique patch ID
  storeId: string;              // Data model ID
  firstChange: boolean;         // Is this the initial registration?
  timestamp: number;            // When the change occurred
  patchedPath?: string;         // Dot-notation path (e.g., "profile.age")
  patchedSegments?: string[];   // Array path (e.g., ["profile", "age"])
  patchedValue?: any;           // New value
  previousValue?: any;          // Old value (for undo)
  operation: StoreAction;       // register | edit | extend
  innerAction: boolean;         // Internal flag
}
```

## Use Cases

### 1. Form Data Management

```typescript
// Register form data
dm.registerDataModel('contactForm', {
  name: '',
  email: '',
  message: ''
});

// Update as user types
const handleNameChange = (e) => {
  dm.setIn('contactForm', 'name', e.target.value);
};

// Get form data
const formData = dm.getById('contactForm');
```

### 2. Application Settings

```typescript
dm.registerDataModel('settings', {
  theme: 'light',
  language: 'en',
  notifications: {
    email: true,
    push: false
  }
});

// Toggle notification
const currentValue = dm.getIn('settings', 'notifications.email');
dm.setIn('settings', 'notifications.email', !currentValue);
```

### 3. Workflow State Management

```typescript
dm.registerDataModel('workflow', {
  nodes: [],
  edges: [],
  selectedNode: null
});

// Add node
const nodes = dm.getIn('workflow', 'nodes');
dm.setIn('workflow', 'nodes', [...nodes, newNode]);

// Select node
dm.setIn('workflow', 'selectedNode', nodeId);
```

### 4. Undo/Redo Functionality

```typescript
class UndoRedoManager {
  private currentIndex = -1;
  private history: string[] = [];

  recordChange(patchId: string) {
    this.history = this.history.slice(0, this.currentIndex + 1);
    this.history.push(patchId);
    this.currentIndex++;
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      DataModelManager.applyPatch(this.history[this.currentIndex]);
    }
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      DataModelManager.applyPatch(this.history[this.currentIndex]);
    }
  }
}
```

## Best Practices

1. **Always deregister** models in cleanup functions
2. **Use unique IDs** for data models
3. **Subscribe in useEffect** with cleanup
4. **Don't mutate directly** - always use `setIn` or `extend`
5. **Use path arrays** for dynamic paths
6. **Clear history** periodically to avoid memory leaks
7. **Validate data** before registration

## Differences from Angular Version

- Uses **Zustand** instead of RxJS BehaviorSubject
- Uses **hooks** for React integration
- Provides **static class** for non-React usage
- Uses **subscribeWithSelector** middleware
- TypeScript **interfaces** instead of Angular decorators

## Example: See It In Action

Check out the example component:
```
src/examples/DataModelExample.tsx
```

To use it, add to your routes:
```typescript
<Route path="/data-model-example" element={<DataModelExample />} />
```

## Performance Tips

- Register large data models as **mutable** if you don't need change tracking
- **Clear history** regularly if you don't need undo/redo
- Use **path arrays** instead of strings for better performance
- **Unsubscribe** when components unmount
- Consider using **React.memo** for components that subscribe to changes
