// Core workflow data structure
export interface WorkflowData {
  agenticWorkflowId: string;
  bpc?: string;
  name: string;
  displayName: string;
  description: string;
  fromModuleVersion: string | null;
  lastModifiedVersion: string | null;
  rebasedFromVersion: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: {
    flow: Variable[];
    system: Variable[];
  };
  interface: WorkflowInterface;
  security?: SecurityConfig;
  isDisabled: boolean;
  publishChannels?: PublishChannel[];
  createdBy?: string;
  createdOn: string;
  updatedBy?: string;
  updatedOn: string;
  environment?: string;
  appId?: string;
  moduleId?: string;
  version?: string;
  status: 'draft' | 'published';
}

// Node types
export type NodeType =
  | 'start'
  | 'agent'
  | 'llm'
  | 'httpRequest'
  | 'guardrail'
  | 'rule'
  | 'workflow'
  | 'output'
  | 'variable'
  | 'script';

// Workflow node
export interface WorkflowNode {
  id: string;
  type: NodeType;
  name: string;
  description: string;
  position: { x: number; y: number };
  deletable: boolean;
  selected?: boolean;
  dragging?: boolean;
  properties: NodeProperties;
  config: NodeConfig;
  data?: any;
  variableUpdates: VariableUpdate[];
  width?: number;
  height?: number;
  positionAbsolute?: { x: number; y: number };
}

// Node properties
export interface NodeProperties {
  retryOnFailure: boolean;
  maxRetries: number;
  retryInterval: number;
  errorHandling: 'none' | 'continue' | 'custom';
  errorObject: {
    body: string;
    status_code: number;
    headers: Record<string, string>;
  };
}

// Base node config
export interface NodeConfig {
  label?: string;
  nodeType?: string;
  [key: string]: any;
}

// Workflow edge
export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: 'default' | 'handoff';
  sourceHandle?: string | null;
  targetHandle?: string | null;
  deletable?: boolean;
  style?: EdgeStyle;
  data?: EdgeData;
}

export interface EdgeStyle {
  strokeWidth?: number;
  stroke?: string;
  strokeDasharray?: string;
}

export interface EdgeData {
  toolId?: string;
  isHandoff?: boolean;
  sourceType?: NodeType;
  targetType?: NodeType;
}

// Variable update
export interface VariableUpdate {
  fieldName: string;
  operation: 'set' | 'append' | 'extend';
  value: string;
  role?: 'user' | 'assistant';
}

// Variable
export interface Variable {
  name: string;
  type: string;
  defaultValue?: any;
  description?: string;
}

// Workflow interface
export interface WorkflowInterface {
  inputs: Record<string, InterfaceField>;
  outputs: Record<string, InterfaceField>;
}

export interface InterfaceField {
  type: string;
  description: string;
  required?: boolean;
  value?: string;
}

// Security configuration
export interface SecurityConfig {
  activities: Activity[];
}

export interface Activity {
  refId: string;
  code: string;
  name: string;
}

// Publish channel
export interface PublishChannel {
  refId: string;
  code: string;
  name: string;
  description: string;
}

// JSON Schema
export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
  condition?: string;
  description?: string;
}
