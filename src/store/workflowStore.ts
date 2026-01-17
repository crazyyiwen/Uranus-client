import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { WorkflowData, WorkflowNode, WorkflowEdge, NodeType, Variable, Tool } from '@/types/workflow.types';
import type { ChatSession, ChatMessage, ValidationResult } from '@/types/chat.types';
import { createEmptyWorkflow, createNodeByType } from '@/utils/nodeDefaults';

interface HistoryState {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

interface WorkflowState {
  workflow: WorkflowData;
  selectedNodes: string[];
  selectedEdges: string[];

  // Execution state
  isExecuting: boolean;
  executingNodes: Set<string>;
  completedNodes: Set<string>;

  // Chat sessions (persist across panel toggles)
  chatSessions: ChatSession[];

  // History for undo/redo
  history: {
    past: HistoryState[];
    future: HistoryState[];
  };

  // PP-Detail panel (property panel detail overlay)
  isPPDetailOpen: boolean;
  ppDetailContent: React.ReactNode | null;

  // Hover state
  hoveredNodeId: string | null;

  // Validation
  validationResult: ValidationResult | null;

  // Actions - Node/Edge operations
  setWorkflow: (workflow: WorkflowData) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;
  duplicateNode: (id: string) => void;

  addEdge: (edge: WorkflowEdge) => void;
  updateEdge: (id: string, updates: Partial<WorkflowEdge>) => void;
  deleteEdge: (id: string) => void;
  deleteEdges: (ids: string[]) => void;

  updateNodeConfig: (id: string, config: any) => void;
  updateNodeProperties: (id: string, properties: Partial<WorkflowNode['properties']>) => void;

  addToolToNode: (nodeId: string, tool: Tool) => void;
  removeToolFromNode: (nodeId: string, toolId: string) => void;
  updateToolInNode: (nodeId: string, toolId: string, updates: Partial<Tool>) => void;

  updateWorkflowMetadata: (updates: Partial<WorkflowData>) => void;
  addVariable: (scope: 'flow' | 'system', variable: Variable) => void;
  removeVariable: (scope: 'flow' | 'system', variableName: string) => void;

  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;

  // History actions
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // Execution actions
  startNodeExecution: (nodeId: string) => void;
  finishNodeExecution: (nodeId: string) => void;
  resetExecution: () => void;
  setExecuting: (isExecuting: boolean) => void;

  // Chat session actions
  addChatSession: (session: ChatSession) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  updateChatSession: (sessionId: string, updates: Partial<ChatSession>) => void;
  clearChatSessions: () => void;

  // PP-Detail panel actions
  openPPDetail: (content: React.ReactNode) => void;
  closePPDetail: () => void;

  // Hover actions
  setHoveredNodeId: (nodeId: string | null) => void;

  // Validation actions
  setValidationResult: (result: ValidationResult | null) => void;

  reset: () => void;
}

// Deep clone helper
const deepClone = <T,>(obj: T): T => {
  try {
    return structuredClone(obj);
  } catch {
    return JSON.parse(JSON.stringify(obj));
  }
};

const initialWorkflow = createEmptyWorkflow();

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    workflow: initialWorkflow,
    selectedNodes: [],
    selectedEdges: [],

    // Execution state
    isExecuting: false,
    executingNodes: new Set<string>(),
    completedNodes: new Set<string>(),

    // Chat sessions
    chatSessions: [],

    // History
    history: {
      past: [],
      future: [],
    },

    // PP-Detail panel
    isPPDetailOpen: false,
    ppDetailContent: null,

    // Hover state
    hoveredNodeId: null,

    // Validation
    validationResult: null,

    setWorkflow: (workflow) => set((state) => {
      // Deduplicate nodes by ID
      const uniqueNodes = Array.from(
        new Map(workflow.nodes.map(node => [node.id, node])).values()
      );

      if (uniqueNodes.length !== workflow.nodes.length) {
        console.warn(
          `[setWorkflow] Found ${workflow.nodes.length - uniqueNodes.length} duplicate nodes. Removed duplicates.`
        );
      }

      workflow.nodes = uniqueNodes;
      state.workflow = workflow;
    }),

    addNode: (type, position) => set((state) => {
      console.log('[addNode] Called with type:', type, 'position:', position);
      console.log('[addNode] BEFORE - workflow.nodes.length:', state.workflow.nodes.length);
      console.log('[addNode] BEFORE - workflow.nodes IDs:', state.workflow.nodes.map(n => `${n.type}:${n.id}`).join(', '));

      get().pushToHistory();
      const newNode = createNodeByType(type, position);
      console.log('[addNode] Created new node:', newNode.id, newNode.type);

      // Update workflow.nodes directly (ONLY source of truth)
      state.workflow.nodes.push(newNode);
      state.workflow.updatedOn = new Date().toISOString();

      console.log('[addNode] AFTER - workflow.nodes.length:', state.workflow.nodes.length);
      console.log('[addNode] AFTER - workflow.nodes IDs:', state.workflow.nodes.map(n => `${n.type}:${n.id}`).join(', '));
    }),

    updateNode: (id, updates) => set((state) => {
      const index = state.workflow.nodes.findIndex(n => n.id === id);
      if (index !== -1) {
        state.workflow.nodes[index] = { ...state.workflow.nodes[index], ...updates };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    deleteNode: (id) => set((state) => {
      console.log('[deleteNode] Called with id:', id);
      console.log('[deleteNode] BEFORE - workflow.nodes.length:', state.workflow.nodes.length);
      const node = state.workflow.nodes.find(n => n.id === id);
      if (node && !node.deletable) {
        console.warn('Cannot delete non-deletable node:', id);
        return;
      }
      // Update workflow.nodes and workflow.edges directly (ONLY source of truth)
      state.workflow.nodes = state.workflow.nodes.filter(n => n.id !== id);
      state.workflow.edges = state.workflow.edges.filter(e => e.source !== id && e.target !== id);
      state.workflow.updatedOn = new Date().toISOString();
      console.log('[deleteNode] AFTER - workflow.nodes.length:', state.workflow.nodes.length);
      console.log('[deleteNode] AFTER - workflow.nodes IDs:', state.workflow.nodes.map(n => `${n.type}:${n.id}`).join(', '));
    }),

    deleteNodes: (ids) => set((state) => {
      console.log('[deleteNodes] Called with ids:', ids);
      console.log('[deleteNodes] BEFORE - workflow.nodes.length:', state.workflow.nodes.length);
      console.log('[deleteNodes] BEFORE - workflow.nodes IDs:', state.workflow.nodes.map(n => `${n.type}:${n.id}`).join(', '));

      const deletableIds = ids.filter(id => {
        const node = state.workflow.nodes.find(n => n.id === id);
        return node?.deletable !== false;
      });

      console.log('[deleteNodes] Deletable IDs after filter:', deletableIds);

      state.workflow.nodes = state.workflow.nodes.filter(n => !deletableIds.includes(n.id));
      state.workflow.edges = state.workflow.edges.filter(e =>
        !deletableIds.includes(e.source) && !deletableIds.includes(e.target)
      );
      state.workflow.updatedOn = new Date().toISOString();

      console.log('[deleteNodes] AFTER - workflow.nodes.length:', state.workflow.nodes.length);
      console.log('[deleteNodes] AFTER - workflow.nodes IDs:', state.workflow.nodes.map(n => `${n.type}:${n.id}`).join(', '));
    }),

    addEdge: (edge) => set((state) => {
      // Check if edge already exists
      const exists = state.workflow.edges.some(e =>
        e.source === edge.source && e.target === edge.target
      );
      if (!exists) {
        state.workflow.edges.push(edge);
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateEdge: (id, updates) => set((state) => {
      const index = state.workflow.edges.findIndex(e => e.id === id);
      if (index !== -1) {
        state.workflow.edges[index] = { ...state.workflow.edges[index], ...updates };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    deleteEdge: (id) => set((state) => {
      state.workflow.edges = state.workflow.edges.filter(e => e.id !== id);
      state.workflow.updatedOn = new Date().toISOString();
    }),

    deleteEdges: (ids) => set((state) => {
      state.workflow.edges = state.workflow.edges.filter(e => !ids.includes(e.id));
      state.workflow.updatedOn = new Date().toISOString();
    }),

    updateNodeConfig: (id, config) => set((state) => {
      const node = state.workflow.nodes.find(n => n.id === id);
      if (node) {
        node.config = { ...node.config, ...config };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateNodeProperties: (id, properties) => set((state) => {
      const node = state.workflow.nodes.find(n => n.id === id);
      if (node) {
        node.properties = { ...node.properties, ...properties };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    addToolToNode: (nodeId, tool) => set((state) => {
      const node = state.workflow.nodes.find(n => n.id === nodeId);
      if (node && 'tools' in node.config) {
        if (!node.config.tools) {
          node.config.tools = [];
        }
        node.config.tools.push(tool);

        // If it's a handoff tool, create an edge
        if (tool.config.type === 'handoff' && tool.config.settings?.nodeId) {
          const edge: WorkflowEdge = {
            id: `${nodeId}-handoff-${tool._id}`,
            source: nodeId,
            target: tool.config.settings.nodeId,
            type: 'handoff',
            sourceHandle: 'handoff',
            targetHandle: null,
            deletable: false,
            data: {
              toolId: tool._id,
              isHandoff: true,
              sourceType: node.type,
            },
          };
          state.workflow.edges.push(edge);
        }
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    removeToolFromNode: (nodeId, toolId) => set((state) => {
      const node = state.workflow.nodes.find(n => n.id === nodeId);
      if (node && 'tools' in node.config) {
        node.config.tools = node.config.tools?.filter((t: Tool) => t._id !== toolId) || [];

        // Remove associated handoff edge if exists
        state.workflow.edges = state.workflow.edges.filter(e => e.data?.toolId !== toolId);
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateToolInNode: (nodeId, toolId, updates) => set((state) => {
      const node = state.workflow.nodes.find(n => n.id === nodeId);
      if (node && 'tools' in node.config) {
        const tool = node.config.tools?.find((t: Tool) => t._id === toolId);
        if (tool) {
          Object.assign(tool, updates);
          state.workflow.updatedOn = new Date().toISOString();
        }
      }
    }),

    updateWorkflowMetadata: (updates) => set((state) => {
      Object.assign(state.workflow, updates);
      state.workflow.updatedOn = new Date().toISOString();
    }),

    addVariable: (scope, variable) => set((state) => {
      state.workflow.variables[scope].push(variable);
      state.workflow.updatedOn = new Date().toISOString();
    }),

    removeVariable: (scope, variableName) => set((state) => {
      state.workflow.variables[scope] = state.workflow.variables[scope].filter(
        v => v.name !== variableName
      );
      state.workflow.updatedOn = new Date().toISOString();
    }),

    setSelectedNodes: (ids) => set((state) => {
      state.selectedNodes = ids;
    }),

    setSelectedEdges: (ids) => set((state) => {
      state.selectedEdges = ids;
    }),

    clearSelection: () => set((state) => {
      state.selectedNodes = [];
      state.selectedEdges = [];
    }),

    // Duplicate node
    duplicateNode: (id) => set((state) => {
      get().pushToHistory();
      const node = state.workflow.nodes.find(n => n.id === id);
      if (node) {
        const newNode = deepClone(node);
        newNode.id = uuidv4();
        newNode.name = `${node.name}_copy`;
        newNode.position = {
          x: node.position.x + 50,
          y: node.position.y + 50,
        };
        state.workflow.nodes.push(newNode);
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    // History management
    pushToHistory: () => {
      const workflow = get().workflow;
      const historyState: HistoryState = {
        nodes: deepClone(workflow.nodes),
        edges: deepClone(workflow.edges),
      };

      set((state) => {
        state.history.past.push(historyState);
        // Keep only last 10 states
        if (state.history.past.length > 10) {
          state.history.past = state.history.past.slice(-10);
        }
        // Clear future when new action is taken
        state.history.future = [];
      });
    },

    undo: () => set((state) => {
      if (state.history.past.length === 0) return;

      const current: HistoryState = {
        nodes: deepClone(state.workflow.nodes),
        edges: deepClone(state.workflow.edges),
      };

      const previous = state.history.past.pop()!;
      state.history.future.push(current);

      state.workflow.nodes = previous.nodes;
      state.workflow.edges = previous.edges;
    }),

    redo: () => set((state) => {
      if (state.history.future.length === 0) return;

      const current: HistoryState = {
        nodes: deepClone(state.workflow.nodes),
        edges: deepClone(state.workflow.edges),
      };

      const next = state.history.future.pop()!;
      state.history.past.push(current);

      state.workflow.nodes = next.nodes;
      state.workflow.edges = next.edges;
    }),

    canUndo: () => get().history.past.length > 0,
    canRedo: () => get().history.future.length > 0,

    // Execution state management
    startNodeExecution: (nodeId) => set((state) => {
      state.executingNodes.add(nodeId);
    }),

    finishNodeExecution: (nodeId) => set((state) => {
      state.executingNodes.delete(nodeId);
      state.completedNodes.add(nodeId);
    }),

    resetExecution: () => set((state) => {
      state.isExecuting = false;
      state.executingNodes.clear();
      state.completedNodes.clear();
    }),

    setExecuting: (isExecuting) => set((state) => {
      state.isExecuting = isExecuting;
      if (!isExecuting) {
        state.executingNodes.clear();
        state.completedNodes.clear();
      }
    }),

    // Chat session management
    addChatSession: (session) => set((state) => {
      state.chatSessions.push(session);
    }),

    addMessageToSession: (sessionId, message) => set((state) => {
      const session = state.chatSessions.find(s => s.sessionId === sessionId);
      if (session) {
        session.messages.push(message);
        session.lastUpdated = new Date();
      }
    }),

    updateChatSession: (sessionId, updates) => set((state) => {
      const session = state.chatSessions.find(s => s.sessionId === sessionId);
      if (session) {
        Object.assign(session, updates);
      }
    }),

    clearChatSessions: () => set((state) => {
      state.chatSessions = [];
    }),

    // PP-Detail panel management
    openPPDetail: (content) => set((state) => {
      state.isPPDetailOpen = true;
      state.ppDetailContent = content;
    }),

    closePPDetail: () => set((state) => {
      state.isPPDetailOpen = false;
      state.ppDetailContent = null;
    }),

    // Hover state
    setHoveredNodeId: (nodeId) => set((state) => {
      state.hoveredNodeId = nodeId;
    }),

    // Validation
    setValidationResult: (result) => set((state) => {
      state.validationResult = result;
    }),

    reset: () => set((state) => {
      const empty = createEmptyWorkflow();
      state.workflow = empty;
      state.selectedNodes = [];
      state.selectedEdges = [];
      state.isExecuting = false;
      state.executingNodes = new Set();
      state.completedNodes = new Set();
      state.chatSessions = [];
      state.history = { past: [], future: [] };
      state.isPPDetailOpen = false;
      state.ppDetailContent = null;
      state.hoveredNodeId = null;
      state.validationResult = null;
    }),
  }))
);
