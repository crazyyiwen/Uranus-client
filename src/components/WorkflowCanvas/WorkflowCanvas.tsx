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
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);
  const [contextMenu, setContextMenu] = useState<{ nodeId: string; x: number; y: number } | null>(null);
  const isProcessingDrop = useRef(false);

  const { nodes: storeNodes, edges: storeEdges, addEdge: addStoreEdge, updateNode } = useWorkflowStore();
  const { openConfigPanel } = useUIStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Debug: Track component lifecycle
  React.useEffect(() => {
    console.log('[WorkflowCanvas] Component mounted');
    return () => {
      console.log('[WorkflowCanvas] Component unmounted');
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
    const reactFlowNodes = storeNodes.map(node => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: node, // Pass the entire node as data
      draggable: node.deletable !== false,
    }));
    setNodes(reactFlowNodes as Node[]);
  }, [storeNodes, setNodes]);

  React.useEffect(() => {
    setEdges(storeEdges as Edge[]);
  }, [storeEdges, setEdges]);

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
      console.log('[onDrop] Event triggered, isProcessing:', isProcessingDrop.current);

      // Prevent multiple simultaneous drops
      if (isProcessingDrop.current) {
        console.log('[onDrop] Already processing, ignoring');
        event.preventDefault();
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (!reactFlowWrapper.current || !rfInstance) {
        console.log('[onDrop] Missing wrapper or instance');
        return;
      }

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) {
        console.log('[onDrop] No type data');
        return;
      }

      // Set processing flag
      isProcessingDrop.current = true;
      console.log('[onDrop] Set isProcessing to true');

      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      console.log('[onDrop] Adding node:', type, position);
      // Get addNode directly from store to avoid stale closure
      useWorkflowStore.getState().addNode(type, position);

      // Clear the drag data to prevent multiple drops
      event.dataTransfer.clearData();

      // Reset processing flag after a short delay
      setTimeout(() => {
        isProcessingDrop.current = false;
        console.log('[onDrop] Reset isProcessing to false');
      }, 100);
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
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
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
