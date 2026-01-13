import { v4 as uuidv4 } from 'uuid';
import type { WorkflowData, WorkflowNode, NodeType, NodeProperties } from '@/types/workflow.types';
import type {
  AgentNodeConfig,
  StartNodeConfig,
  OutputNodeConfig,
  LLMNodeConfig,
  HTTPRequestNodeConfig,
  GuardrailNodeConfig,
  RuleNodeConfig,
  WorkflowNodeConfig,
  VariableNodeConfig,
  ScriptNodeConfig,
} from '@/types/node.types';

// Default node properties
const defaultNodeProperties: NodeProperties = {
  retryOnFailure: false,
  maxRetries: 6,
  retryInterval: 541,
  errorHandling: 'none',
  errorObject: {
    body: '',
    status_code: 500,
    headers: {},
  },
};

// Create an empty workflow
export function createEmptyWorkflow(): WorkflowData {
  const now = new Date().toISOString();
  const startNode = createStartNode({ x: 100, y: 100 });

  return {
    agenticWorkflowId: uuidv4(),
    name: 'New Workflow',
    displayName: 'New Workflow',
    description: '',
    fromModuleVersion: null,
    lastModifiedVersion: null,
    rebasedFromVersion: null,
    nodes: [startNode],
    edges: [],
    variables: {
      flow: [],
      system: [],
    },
    interface: {
      inputs: {},
      outputs: {},
    },
    isDisabled: false,
    createdOn: now,
    updatedOn: now,
    status: 'draft',
  };
}

// Create a START node
function createStartNode(position: { x: number; y: number }): WorkflowNode {
  const config: StartNodeConfig = {
    label: 'start',
    nodeType: 'start',
  };

  return {
    id: 'start',
    type: 'start',
    name: 'start',
    description: 'Starting point of the workflow',
    position,
    deletable: false,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [
      {
        fieldName: 'thread.messages',
        operation: 'append',
        value: '{{nodeOutput.interface.inputs.message}}',
        role: 'user',
      },
      {
        fieldName: 'system.userQuery',
        operation: 'set',
        value: '{{nodeOutput.interface.inputs.message}}',
      },
    ],
    width: 250,
    height: 95,
  };
}

// Create an Agent node
function createAgentNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: AgentNodeConfig = {
    agentStrategy: 'react',
    model: {
      code: 'gpt-4.1',
      name: 'OpenAI GPT-4.1',
    },
    promptTemplate: [
      {
        id: uuidv4(),
        role: 'system',
        text: 'You are a helpful AI assistant with access to tools. Use the available tools to help answer questions and complete tasks.',
      },
      {
        id: uuidv4(),
        role: 'user',
        text: 'User Query: {{system.userQuery}}',
      },
    ],
    tools: [],
    maxIterations: 5,
    includeThoughts: true,
    structuredOutput: {
      enable: false,
      name: '',
      description: '',
      schema: {
        type: 'object',
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  };

  return {
    id,
    type: 'agent',
    name: `agent_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [
      {
        fieldName: 'thread.messages',
        operation: 'append',
        value: '{{nodeOutput.text}}',
        role: 'assistant',
      },
    ],
    width: 324,
    height: 156,
  };
}

// Create an Output node
function createOutputNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: OutputNodeConfig = {
    outputMapping: {
      messages: {
        type: 'string',
        value: '{{thread.messages}}',
      },
    },
  };

  return {
    id,
    type: 'output',
    name: 'output',
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 150,
    height: 71,
  };
}

// Create an LLM node
function createLLMNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: LLMNodeConfig = {
    model: {
      code: 'gpt-4.1',
      name: 'OpenAI GPT-4.1',
    },
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: 'You are a helpful assistant.',
  };

  return {
    id,
    type: 'llm',
    name: `llm_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create an HTTP Request node
function createHTTPRequestNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: HTTPRequestNodeConfig = {
    method: 'GET',
    url: '',
    headers: {},
    queryParams: {},
    authentication: {
      type: 'none',
    },
  };

  return {
    id,
    type: 'httpRequest',
    name: `http_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create a Guardrail node
function createGuardrailNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: GuardrailNodeConfig = {
    rules: [],
    action: 'block',
  };

  return {
    id,
    type: 'guardrail',
    name: `guardrail_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create a Rule node
function createRuleNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: RuleNodeConfig = {
    condition: '',
    operator: 'equals',
  };

  return {
    id,
    type: 'rule',
    name: `rule_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create a Workflow node
function createWorkflowNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: WorkflowNodeConfig = {
    workflowId: '',
    workflowName: '',
    inputMapping: {},
    outputMapping: {},
  };

  return {
    id,
    type: 'workflow',
    name: `workflow_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create a Variable node
function createVariableNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: VariableNodeConfig = {
    operation: 'get',
    variableName: '',
  };

  return {
    id,
    type: 'variable',
    name: `variable_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Create a Script node
function createScriptNode(position: { x: number; y: number }): WorkflowNode {
  const id = uuidv4().substring(0, 7);
  const config: ScriptNodeConfig = {
    language: 'javascript',
    code: '// Enter your code here\n',
    inputs: {},
    outputs: {},
  };

  return {
    id,
    type: 'script',
    name: `script_${id}`,
    description: '',
    position,
    deletable: true,
    properties: defaultNodeProperties,
    config,
    variableUpdates: [],
    width: 250,
    height: 100,
  };
}

// Factory function to create nodes by type
export function createNodeByType(type: NodeType, position: { x: number; y: number }): WorkflowNode {
  switch (type) {
    case 'start':
      return createStartNode(position);
    case 'agent':
      return createAgentNode(position);
    case 'output':
      return createOutputNode(position);
    case 'llm':
      return createLLMNode(position);
    case 'httpRequest':
      return createHTTPRequestNode(position);
    case 'guardrail':
      return createGuardrailNode(position);
    case 'rule':
      return createRuleNode(position);
    case 'workflow':
      return createWorkflowNode(position);
    case 'variable':
      return createVariableNode(position);
    case 'script':
      return createScriptNode(position);
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}
