import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Bot,
  Zap,
  Database,
  FileOutput,
  GitMerge,
  GitBranch,
  FileCode,
  Workflow,
  Variable,
  Shield,
  Play,
} from 'lucide-react';
import type { WorkflowNode, NodeType } from '@/types/workflow.types';

const nodeConfig: Record<NodeType, { icon: any; color: string; bgColor: string; label: string }> = {
  start: { icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'Start' },
  agent: { icon: Bot, color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'Agent' },
  llm: { icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-500', label: 'LLM' },
  httpRequest: { icon: Database, color: 'text-orange-600', bgColor: 'bg-orange-500', label: 'API' },
  output: { icon: FileOutput, color: 'text-gray-600', bgColor: 'bg-gray-500', label: 'Output' },
  parallel: { icon: GitMerge, color: 'text-purple-600', bgColor: 'bg-purple-500', label: 'Parallel' },
  guardrail: { icon: Shield, color: 'text-yellow-600', bgColor: 'bg-yellow-500', label: 'Guardrail' },
  rule: { icon: GitBranch, color: 'text-red-600', bgColor: 'bg-red-500', label: 'Rule' },
  workflow: { icon: Workflow, color: 'text-blue-600', bgColor: 'bg-blue-500', label: 'Workflow' },
  variable: { icon: Variable, color: 'text-green-600', bgColor: 'bg-green-500', label: 'Variable' },
  script: { icon: FileCode, color: 'text-orange-600', bgColor: 'bg-orange-500', label: 'Script' },
};

export const GenericNode = memo(({ data, selected }: NodeProps<WorkflowNode>) => {
  const config = nodeConfig[data.type] || nodeConfig.agent;
  const Icon = config.icon;

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[200px] ${
      selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-300'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-md ${config.bgColor} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{data.name}</div>
            <div className="text-xs text-gray-500">{config.label}</div>
          </div>
        </div>
      </div>

      {data.description && (
        <div className="text-xs text-gray-500 mt-2 line-clamp-2">
          {data.description}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-gray-400"
      />
    </div>
  );
});

GenericNode.displayName = 'GenericNode';
