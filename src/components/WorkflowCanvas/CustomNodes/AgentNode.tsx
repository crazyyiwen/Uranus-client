import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Bot } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WorkflowNode } from '@/types/workflow.types';
import type { AgentNodeConfig } from '@/types/node.types';

export const AgentNode = memo(({ data, selected }: NodeProps<WorkflowNode>) => {
  const config = data.config as AgentNodeConfig;
  const tools = config?.tools || [];
  const model = config?.model;

  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[280px] ${
      selected ? 'border-blue-600 ring-2 ring-blue-300' : 'border-blue-500'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-blue-500"
      />

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-md bg-blue-500 text-white">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">{data.name.toUpperCase()}</div>
            <div className="text-xs text-gray-500">agent</div>
          </div>
        </div>
      </div>

      {model && (
        <div className="text-xs text-gray-600 mt-2 flex items-center gap-1">
          <span className="font-medium">🤖</span>
          <span>{model.name}</span>
        </div>
      )}

      {tools.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {tools.slice(0, 3).map((tool) => (
            <Badge key={tool._id} variant="secondary" className="text-xs">
              {tool.name}
            </Badge>
          ))}
          {tools.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tools.length - 3} more
            </Badge>
          )}
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="handoff"
        className="!w-3 !h-3 !bg-purple-500"
      />
    </div>
  );
});

AgentNode.displayName = 'AgentNode';
