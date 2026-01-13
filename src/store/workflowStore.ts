import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { v4 as uuidv4 } from 'uuid';
import type { WorkflowData, WorkflowNode, WorkflowEdge, NodeType, Variable, Tool } from '@/types/workflow.types';
import { createEmptyWorkflow, createNodeByType } from '@/utils/nodeDefaults';

interface WorkflowState {
  workflow: WorkflowData;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNodes: string[];
  selectedEdges: string[];

  // Actions
  setWorkflow: (workflow: WorkflowData) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  updateNode: (id: string, updates: Partial<WorkflowNode>) => void;
  deleteNode: (id: string) => void;
  deleteNodes: (ids: string[]) => void;

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

  reset: () => void;
}

export const useWorkflowStore = create<WorkflowState>()(
  immer((set, get) => ({
    workflow: createEmptyWorkflow(),
    nodes: [],
    edges: [],
    selectedNodes: [],
    selectedEdges: [],

    setWorkflow: (workflow) => set((state) => {
      state.workflow = workflow;
      state.nodes = workflow.nodes;
      state.edges = workflow.edges;
    }),

    addNode: (type, position) => set((state) => {
      const newNode = createNodeByType(type, position);
      state.nodes.push(newNode);
      state.workflow.nodes = state.nodes;
      state.workflow.updatedOn = new Date().toISOString();
    }),

    updateNode: (id, updates) => set((state) => {
      const index = state.nodes.findIndex(n => n.id === id);
      if (index !== -1) {
        state.nodes[index] = { ...state.nodes[index], ...updates };
        state.workflow.nodes = state.nodes;
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    deleteNode: (id) => set((state) => {
      const node = state.nodes.find(n => n.id === id);
      if (node && !node.deletable) {
        console.warn('Cannot delete non-deletable node:', id);
        return;
      }
      state.nodes = state.nodes.filter(n => n.id !== id);
      state.edges = state.edges.filter(e => e.source !== id && e.target !== id);
      state.workflow.nodes = state.nodes;
      state.workflow.edges = state.edges;
      state.workflow.updatedOn = new Date().toISOString();
    }),

    deleteNodes: (ids) => set((state) => {
      const deletableIds = ids.filter(id => {
        const node = state.nodes.find(n => n.id === id);
        return node?.deletable !== false;
      });
      state.nodes = state.nodes.filter(n => !deletableIds.includes(n.id));
      state.edges = state.edges.filter(e =>
        !deletableIds.includes(e.source) && !deletableIds.includes(e.target)
      );
      state.workflow.nodes = state.nodes;
      state.workflow.edges = state.edges;
      state.workflow.updatedOn = new Date().toISOString();
    }),

    addEdge: (edge) => set((state) => {
      // Check if edge already exists
      const exists = state.edges.some(e =>
        e.source === edge.source && e.target === edge.target
      );
      if (!exists) {
        state.edges.push(edge);
        state.workflow.edges = state.edges;
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateEdge: (id, updates) => set((state) => {
      const index = state.edges.findIndex(e => e.id === id);
      if (index !== -1) {
        state.edges[index] = { ...state.edges[index], ...updates };
        state.workflow.edges = state.edges;
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    deleteEdge: (id) => set((state) => {
      state.edges = state.edges.filter(e => e.id !== id);
      state.workflow.edges = state.edges;
      state.workflow.updatedOn = new Date().toISOString();
    }),

    deleteEdges: (ids) => set((state) => {
      state.edges = state.edges.filter(e => !ids.includes(e.id));
      state.workflow.edges = state.edges;
      state.workflow.updatedOn = new Date().toISOString();
    }),

    updateNodeConfig: (id, config) => set((state) => {
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        node.config = { ...node.config, ...config };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateNodeProperties: (id, properties) => set((state) => {
      const node = state.nodes.find(n => n.id === id);
      if (node) {
        node.properties = { ...node.properties, ...properties };
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    addToolToNode: (nodeId, tool) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
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
          state.edges.push(edge);
          state.workflow.edges = state.edges;
        }
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    removeToolFromNode: (nodeId, toolId) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
      if (node && 'tools' in node.config) {
        node.config.tools = node.config.tools?.filter((t: Tool) => t._id !== toolId) || [];

        // Remove associated handoff edge if exists
        state.edges = state.edges.filter(e => e.data?.toolId !== toolId);
        state.workflow.edges = state.edges;
        state.workflow.updatedOn = new Date().toISOString();
      }
    }),

    updateToolInNode: (nodeId, toolId, updates) => set((state) => {
      const node = state.nodes.find(n => n.id === nodeId);
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

    reset: () => set((state) => {
      const empty = createEmptyWorkflow();
      state.workflow = empty;
      state.nodes = empty.nodes;
      state.edges = empty.edges;
      state.selectedNodes = [];
      state.selectedEdges = [];
    }),
  }))
);
