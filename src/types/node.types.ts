import { JSONSchema } from './workflow.types';

// Agent node configuration
export interface AgentNodeConfig {
  agentStrategy: 'react' | 'plan-and-execute' | 'custom';
  model: ModelConfig;
  promptTemplate: PromptMessage[];
  tools: Tool[];
  maxIterations: number;
  includeThoughts: boolean;
  structuredOutput: StructuredOutput;
}

export interface ModelConfig {
  code: string;
  name: string;
}

export interface PromptMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  text: string;
}

export interface Tool {
  _id: string;
  name: string;
  description: string;
  type: 'tool';
  config: ToolConfig;
}

export interface ToolConfig {
  enabled: boolean;
  toolId: string;
  type: 'handoff' | 'mcp' | 'http' | 'function';
  schema: JSONSchema;
  settings: Record<string, any>;
  returnDirect: boolean;
  _meta?: ToolMeta;
}

export interface ToolMeta {
  uiView?: string;
  type?: string;
  source?: string;
  moduleId?: string;
  toolId?: string;
  serverName?: string;
  functionId?: string;
  executor?: {
    module: string;
    function: string;
    wrapper: string;
  };
}

export interface StructuredOutput {
  enable: boolean;
  name: string;
  description: string;
  schema: JSONSchema;
}

// LLM node configuration
export interface LLMNodeConfig {
  model: ModelConfig;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
}

// HTTP Request node configuration
export interface HTTPRequestNodeConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers: Record<string, string>;
  body?: string;
  queryParams?: Record<string, string>;
  authentication?: {
    type: 'none' | 'bearer' | 'basic' | 'api-key';
    credentials?: Record<string, string>;
  };
}

// Guardrail node configuration
export interface GuardrailNodeConfig {
  rules: GuardrailRule[];
  action: 'block' | 'warn' | 'log';
}

export interface GuardrailRule {
  id: string;
  type: 'content-filter' | 'input-validation' | 'output-validation' | 'custom';
  condition: string;
  message: string;
}

// Rule node configuration
export interface RuleNodeConfig {
  condition: string;
  trueNode?: string;
  falseNode?: string;
  operator: 'equals' | 'contains' | 'matches' | 'custom';
}

// Workflow node configuration
export interface WorkflowNodeConfig {
  workflowId: string;
  workflowName: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
}

// Output node configuration
export interface OutputNodeConfig {
  outputMapping: Record<string, OutputMapping>;
}

export interface OutputMapping {
  type: string;
  value: string;
}

// Variable node configuration
export interface VariableNodeConfig {
  operation: 'get' | 'set';
  variableName: string;
  variableValue?: string;
}

// Script node configuration
export interface ScriptNodeConfig {
  language: 'javascript' | 'python';
  code: string;
  inputs: Record<string, string>;
  outputs: Record<string, string>;
}

// Start node configuration
export interface StartNodeConfig {
  label: string;
  nodeType: 'start';
}
