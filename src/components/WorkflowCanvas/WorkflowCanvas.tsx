import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { NodeContextMenu } from './NodeContextMenu';
import { StartNode } from './CustomNodes/StartNode';
import { AgentNode } from './CustomNodes/AgentNode';
import { OutputNode } from './CustomNodes/OutputNode';
import { GenericNode } from './CustomNodes/GenericNode';
import type { NodeType } from '@/types/workflow.types';
import React from 'react';

// GLOBAL drop lock to prevent duplicate drops across all instances
let globalDropInProgress = false;
let globalDropTimer: NodeJS.Timeout | null = null;
let lastProcessedDragId: string | null = null;

const nodeTypes = {
  start: StartNode,
  agent: AgentNode,
  output: OutputNode,
  llm: GenericNode,
  httpRequest: GenericNode,
  parallel: GenericNode,
  guardrail: GenericNode,
  rule: GenericNode,
  workflow: GenericNode,
  variable: GenericNode,
  script: GenericNode,
};

function WorkflowCanvasInner() {
  const componentId = useRef(`canvas-${Math.random().toString(36).substr(2, 9)}`);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);

  const workflow = useWorkflowStore((state) => state.workflow);
  const updateNode = useWorkflowStore((state) => state.updateNode);
  const addStoreEdge = useWorkflowStore((state) => state.addEdge);
  const setSelectedNodes = useWorkflowStore((state) => state.setSelectedNodes);
  const setSelectedEdges = useWorkflowStore((state) => state.setSelectedEdges);

  const storeNodes = workflow?.nodes || [];
  const storeEdges = workflow?.edges || [];
  const { openConfigPanel } = useUIStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Track selection state separately to prevent React Flow from clearing it
  const selectionRef = useRef<{
    nodeIds: string[];
    edgeIds: string[];
    lastSetTime: number;
  }>({
    nodeIds: [],
    edgeIds: [],
    lastSetTime: 0
  });

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Debug: Track component lifecycle
  React.useEffect(() => {
    console.log(`[WorkflowCanvas ${componentId.current}] Component mounted`);
    return () => {
      console.log(`[WorkflowCanvas ${componentId.current}] Component unmounted`);
    };
  }, []);

  // Handle node changes and sync back to store
  const handleNodesChange = useCallback((changes: any[]) => {
    onNodesChange(changes);

    // Sync position changes back to store
    changes.forEach((change) => {
      if (change.type === 'position' && change.position && change.dragging === false) {
        updateNode(change.id, { position: change.position });
      }
    });
  }, [onNodesChange, updateNode]);

  // Sync store changes to React Flow - convert WorkflowNode to React Flow Node
  React.useEffect(() => {
    console.log('========================================');
    console.log('[WorkflowCanvas SYNC] Triggered');
    console.log('[WorkflowCanvas SYNC] storeNodes count:', storeNodes.length);
    console.log('[WorkflowCanvas SYNC] storeNodes IDs:', storeNodes.map(n => `${n.type}:${n.id}`).join(', '));
    console.log('[WorkflowCanvas SYNC] Current selection from ref:', selectionRef.current.nodeIds);

    // Preserve selection by applying it to the new nodes
    const reactFlowNodes = storeNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node, // Pass the entire node as data
      draggable: node.deletable !== false,
      selected: selectionRef.current.nodeIds.includes(node.id), // Preserve selection
    }));

    console.log('[WorkflowCanvas SYNC] ReactFlow nodes count:', reactFlowNodes.length);
    console.log('[WorkflowCanvas SYNC] ReactFlow node IDs:', reactFlowNodes.map(n => `${n.type}:${n.id}`).join(', '));
    console.log('[WorkflowCanvas SYNC] Nodes with selection:', reactFlowNodes.filter(n => n.selected).map(n => n.id));
    console.log('[WorkflowCanvas SYNC] Calling setNodes...');
    setNodes(reactFlowNodes as Node[]);
    console.log('[WorkflowCanvas SYNC] setNodes complete');
    console.log('========================================');
  }, [storeNodes]);

  React.useEffect(() => {
    // DON'T set selected on edges - let React Flow manage its own selection state
    setEdges(storeEdges as Edge[]);
  }, [storeEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const edge = {
        id: `${connection.source}-${connection.target}`,
        source: connection.source!,
        target: connection.target!,
        type: 'default',
        style: { strokeWidth: 3 },
      };
      addStoreEdge(edge);
    },
    [addStoreEdge]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      // CRITICAL: Prevent default and stop propagation FIRST
      event.preventDefault();
      event.stopPropagation();

      const canvasId = componentId.current;
      console.log(`[onDrop ${canvasId}] Event triggered, globalDropInProgress:`, globalDropInProgress);

      // GLOBAL lock - prevent ANY drop from processing if one is in progress
      if (globalDropInProgress) {
        console.log(`[onDrop ${canvasId}] BLOCKED by global lock`);
        return;
      }

      if (!reactFlowWrapper.current || !rfInstance) {
        console.log(`[onDrop ${canvasId}] Missing wrapper or instance`);
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      const dragId = event.dataTransfer.getData('application/reactflow-dragid');

      console.log(`[onDrop ${canvasId}] Type:`, type, 'DragId:', dragId);

      if (!type) {
        console.log(`[onDrop ${canvasId}] No type data`);
        return;
      }

      // Check if we've already processed this exact drag operation
      if (dragId && dragId === lastProcessedDragId) {
        console.log(`[onDrop ${canvasId}] BLOCKED - Already processed dragId:`, dragId);
        return;
      }

      // Set GLOBAL processing flag
      globalDropInProgress = true;
      lastProcessedDragId = dragId;
      console.log(`[onDrop ${canvasId}] GLOBAL LOCK ACTIVATED, dragId:`, dragId);

      // Clear any existing timer
      if (globalDropTimer) {
        clearTimeout(globalDropTimer);
      }

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      console.log(`[onDrop ${canvasId}] Adding node:`, type, 'at position:', position);

      // Get addNode directly from store to avoid stale closure
      useWorkflowStore.getState().addNode(type, position);

      // Clear the drag data to prevent multiple drops
      try {
        event.dataTransfer.clearData();
      } catch (e) {
        // clearData might throw in some browsers after drop
      }

      // Reset GLOBAL flag after delay to allow next drop
      globalDropTimer = setTimeout(() => {
        globalDropInProgress = false;
        lastProcessedDragId = null;
        globalDropTimer = null;
        console.log(`[onDrop ${canvasId}] GLOBAL LOCK RELEASED, ready for next drag`);
      }, 500);
    },
    [rfInstance]
  );

  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      console.log('Double-clicked node:', node.id);
      openConfigPanel(node.id);
    },
    [openConfigPanel]
  );

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault();
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    },
    []
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node[]; edges: Edge[] }) => {
      const selectedNodeIds = nodes.map(n => n.id);
      const selectedEdgeIds = edges.map(e => e.id);
      const now = Date.now();

      console.log('[WorkflowCanvas] onSelectionChange called - nodes:', selectedNodeIds, 'edges:', selectedEdgeIds);

      // Get current selection from store
      const currentSelectedNodes = useWorkflowStore.getState().selectedNodes;
      const currentSelectedEdges = useWorkflowStore.getState().selectedEdges;

      // Detect if this is a spurious "clear" event that happens immediately after setting selection
      const isSpuriousClear =
        selectedNodeIds.length === 0 &&
        currentSelectedNodes.length > 0 &&
        now - selectionRef.current.lastSetTime < 100; // Within 100ms

      if (isSpuriousClear) {
        console.log('[WorkflowCanvas] IGNORING spurious selection clear (happened', now - selectionRef.current.lastSetTime, 'ms after set)');
        // Don't update the store, keep the previous selection
        return;
      }

      // Update ref
      selectionRef.current.nodeIds = selectedNodeIds;
      selectionRef.current.edgeIds = selectedEdgeIds;
      if (selectedNodeIds.length > 0 || selectedEdgeIds.length > 0) {
        selectionRef.current.lastSetTime = now;
      }

      // Only update if selection actually changed
      const nodesChanged =
        selectedNodeIds.length !== currentSelectedNodes.length ||
        selectedNodeIds.some((id, i) => id !== currentSelectedNodes[i]);
      const edgesChanged =
        selectedEdgeIds.length !== currentSelectedEdges.length ||
        selectedEdgeIds.some((id, i) => id !== currentSelectedEdges[i]);

      if (nodesChanged || edgesChanged) {
        console.log('[WorkflowCanvas] Updating store selection - nodes:', selectedNodeIds, 'edges:', selectedEdgeIds);
        console.log('[WorkflowCanvas] Previous - nodes:', currentSelectedNodes, 'edges:', currentSelectedEdges);
        setSelectedNodes(selectedNodeIds);
        setSelectedEdges(selectedEdgeIds);
      }
    },
    [setSelectedNodes, setSelectedEdges]
  );

  return (
    <div ref={reactFlowWrapper} className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setRfInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onSelectionChange={onSelectionChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        elementsSelectable={true}
        nodesConnectable={true}
        nodesFocusable={true}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {/* Context Menu */}
      {contextMenu && (
        <NodeContextMenu
          nodeId={contextMenu.nodeId}
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}

export function WorkflowCanvas() {
  return (
    <ReactFlowProvider>
      <WorkflowCanvasInner />
    </ReactFlowProvider>
  );
}
