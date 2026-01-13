import type { WorkflowData, WorkflowNode, WorkflowEdge } from '@/types/workflow.types';

export interface ValidationError {
  type: 'error' | 'warning';
  message: string;
  nodeId?: string;
  edgeId?: string;
}

export function validateWorkflow(workflow: WorkflowData): ValidationError[] {
  const errors: ValidationError[] = [];

  // Check for START node
  const startNodes = workflow.nodes.filter(n => n.type === 'start');
  if (startNodes.length === 0) {
    errors.push({
      type: 'error',
      message: 'Workflow must have a START node',
    });
  } else if (startNodes.length > 1) {
    errors.push({
      type: 'error',
      message: 'Workflow can only have one START node',
    });
  }

  // Check for disconnected nodes
  const connectedNodeIds = new Set<string>();
  workflow.edges.forEach(edge => {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  });

  workflow.nodes.forEach(node => {
    if (node.type !== 'start' && node.type !== 'output' && !connectedNodeIds.has(node.id)) {
      errors.push({
        type: 'warning',
        message: `Node "${node.name}" is not connected`,
        nodeId: node.id,
      });
    }
  });

  // Check for nodes with empty names
  workflow.nodes.forEach(node => {
    if (!node.name || node.name.trim() === '') {
      errors.push({
        type: 'warning',
        message: `Node has no name`,
        nodeId: node.id,
      });
    }
  });

  // Check for valid tool references in handoff edges
  workflow.edges.forEach(edge => {
    if (edge.data?.isHandoff && edge.data?.toolId) {
      const sourceNode = workflow.nodes.find(n => n.id === edge.source);
      if (sourceNode && 'tools' in sourceNode.config) {
        const tool = sourceNode.config.tools?.find((t: any) => t._id === edge.data?.toolId);
        if (!tool) {
          errors.push({
            type: 'error',
            message: `Handoff edge references non-existent tool`,
            edgeId: edge.id,
          });
        }
      }
    }
  });

  return errors;
}

export function validateWorkflowData(data: any): data is WorkflowData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.agenticWorkflowId === 'string' &&
    typeof data.name === 'string' &&
    Array.isArray(data.nodes) &&
    Array.isArray(data.edges)
  );
}
