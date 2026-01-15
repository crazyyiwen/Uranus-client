import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/store/workflowStore';
import type { WorkflowNode } from '@/types/workflow.types';

interface ParallelConfiguratorProps {
  node: WorkflowNode;
}

export function ParallelConfigurator({ node }: ParallelConfiguratorProps) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const config = node.config as any;

  return (
    <div className="space-y-6">
      {/* Name and Description */}
      <div className="space-y-2">
        <Input
          value={node.name}
          onChange={(e) => updateNode(node.id, { name: e.target.value })}
          className="font-medium"
          placeholder="Node name"
        />
        <Textarea
          value={node.description}
          onChange={(e) => updateNode(node.id, { description: e.target.value })}
          placeholder="Add description..."
          className="min-h-[60px] resize-none"
        />
      </div>

      {/* Wait for All Branches */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-semibold">Wait for All Branches</Label>
            <p className="text-xs text-gray-500 mt-1">
              Wait for all parallel branches to complete before proceeding
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={config.waitForAllBranches !== false}
              onChange={(e) =>
                updateNodeConfig(node.id, {
                  ...config,
                  waitForAllBranches: e.target.checked,
                })
              }
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      {/* Max Concurrency */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Max Concurrency</Label>
        <Input
          type="number"
          value={config.maxConcurrency || 5}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              ...config,
              maxConcurrency: parseInt(e.target.value) || 5,
            })
          }
          placeholder="5"
        />
        <p className="text-xs text-gray-500">
          Maximum number of branches to execute simultaneously
        </p>
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Timeout (ms)</Label>
        <Input
          type="number"
          value={config.timeout || 60000}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              ...config,
              timeout: parseInt(e.target.value) || 60000,
            })
          }
          placeholder="60000"
        />
        <p className="text-xs text-gray-500">
          Maximum time to wait for all branches to complete
        </p>
      </div>

      {/* Parallel Execution Info */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold mb-2">Parallel Execution:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Execute multiple workflow branches simultaneously</li>
          <li>
            <strong>Wait for All:</strong> Continue only after all branches
            complete
          </li>
          <li>
            <strong>Don't Wait:</strong> Continue as soon as the first branch
            completes
          </li>
          <li>Use concurrency limits to control resource usage</li>
          <li>Results from all branches are merged in the output</li>
        </ul>
      </div>
    </div>
  );
}
