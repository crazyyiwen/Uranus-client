import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

export const StartNode = memo(({ data }: NodeProps<WorkflowNode>) => {
  return (
    <div className="px-4 py-3 shadow-lg rounded-lg bg-white border-2 border-blue-500 min-w-[200px]">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-blue-500 text-white">
          <Play className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">START</div>
          <div className="text-xs text-gray-500">start</div>
        </div>
      </div>
      <div className="text-xs text-gray-600 mt-2">
        Starting point of the workflow
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-blue-500"
      />
    </div>
  );
});

StartNode.displayName = 'StartNode';
