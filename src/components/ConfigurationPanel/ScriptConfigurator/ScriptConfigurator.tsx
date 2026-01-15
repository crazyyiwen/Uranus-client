import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useWorkflowStore } from '@/store/workflowStore';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import type { WorkflowNode } from '@/types/workflow.types';

interface ScriptConfiguratorProps {
  node: WorkflowNode;
}

export function ScriptConfigurator({ node }: ScriptConfiguratorProps) {
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

      {/* Language */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Language</Label>
        <Select
          value={config.language || 'javascript'}
          onValueChange={(value) =>
            updateNodeConfig(node.id, { ...config, language: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="python">Python</SelectItem>
            <SelectItem value="typescript">TypeScript</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Code Editor */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Code</Label>
        <div className="border rounded-lg bg-gray-50">
          <div className="flex items-center gap-2 px-3 py-2 border-b bg-gray-100">
            <span className="text-xs text-gray-500 font-mono">1</span>
            <span className="text-xs text-gray-500 font-mono">2</span>
          </div>
          <Textarea
            value={config.code || '// Your code here\nreturn { result: "hello world" };'}
            onChange={(e) =>
              updateNodeConfig(node.id, { ...config, code: e.target.value })
            }
            className="min-h-[200px] font-mono text-sm border-0 bg-transparent resize-none"
            placeholder="// Your code here"
          />
        </div>
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Timeout (ms)</Label>
        <Input
          type="number"
          value={config.timeout || 30000}
          onChange={(e) =>
            updateNodeConfig(node.id, {
              ...config,
              timeout: parseInt(e.target.value) || 30000,
            })
          }
          placeholder="30000"
        />
        <p className="text-xs text-gray-500">
          Script execution timeout in milliseconds
        </p>
      </div>

      {/* Available Variables */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-semibold mb-2">Available Variables:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            <strong>input</strong> - Data from previous nodes
          </li>
          <li>
            <strong>context</strong> - Workflow context and variables
          </li>
          <li>
            <strong>node</strong> - Current node information
          </li>
        </ul>
        <p className="text-sm text-gray-700 mt-2">
          <strong>Return:</strong> Your script should return an object with the
          results.
        </p>
      </div>

      {/* Output Variables */}
      <CollapsibleSection title="OUTPUT VARIABLES" count={0}>
        <p className="text-sm text-gray-500">
          No variables yet. Click Add to create one.
        </p>
      </CollapsibleSection>

      {/* State Update */}
      <CollapsibleSection title="STATE UPDATE" count={0}>
        <p className="text-sm text-gray-500">No state updates configured.</p>
      </CollapsibleSection>
    </div>
  );
}
