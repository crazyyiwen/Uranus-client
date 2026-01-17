import { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { FileOutput } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

export const OutputNode = memo(({ data, selected }: NodeProps<WorkflowNode>) => {
  return (
    <div className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[150px] ${
      selected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-400'
    }`}>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-gray-400"
      />

      <div className="flex items-center gap-2">
        <div className="p-2 rounded-md bg-gray-400 text-white">
          <FileOutput className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">OUTPUT</div>
          <div className="text-xs text-gray-500">output</div>
        </div>
      </div>
    </div>
  );
});

OutputNode.displayName = 'OutputNode';
