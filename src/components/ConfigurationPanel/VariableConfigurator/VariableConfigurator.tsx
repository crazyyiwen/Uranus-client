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

interface VariableConfiguratorProps {
  node: WorkflowNode;
}

export function VariableConfigurator({ node }: VariableConfiguratorProps) {
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

      {/* Operation */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Operation</Label>
        <Select
          value={config.operation || 'set'}
          onValueChange={(value) =>
            updateNodeConfig(node.id, { ...config, operation: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="set">Set Variable</SelectItem>
            <SelectItem value="get">Get Variable</SelectItem>
            <SelectItem value="append">Append</SelectItem>
            <SelectItem value="increment">Increment/Decrement</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Variable Name */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Variable Name</Label>
        <Input
          value={config.variableName || ''}
          onChange={(e) =>
            updateNodeConfig(node.id, { ...config, variableName: e.target.value })
          }
          placeholder="myVariable"
        />
      </div>

      {/* Data Type */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Data Type</Label>
        <Select
          value={config.dataType || 'string'}
          onValueChange={(value) =>
            updateNodeConfig(node.id, { ...config, dataType: value })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="string">String</SelectItem>
            <SelectItem value="number">Number</SelectItem>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="object">Object</SelectItem>
            <SelectItem value="array">Array</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Value */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">
          Value <span className="text-gray-500 font-normal">{config.dataType || 'string'}</span>
        </Label>
        <Input
          value={config.value || ''}
          onChange={(e) =>
            updateNodeConfig(node.id, { ...config, value: e.target.value })
          }
          placeholder="Enter value"
        />
      </div>

      {/* Variable Operations Info */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold mb-2">Variable Operations:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            <strong>Set:</strong> Create or update a variable with a value
          </li>
          <li>
            <strong>Get:</strong> Retrieve the value of an existing variable
          </li>
          <li>
            <strong>Append:</strong> Add content to an existing string/array
            variable
          </li>
          <li>
            <strong>Increment/Decrement:</strong> Modify numeric variables
          </li>
          <li>
            <strong>Delete:</strong> Remove a variable from context
          </li>
        </ul>
      </div>

      {/* State Update */}
      <CollapsibleSection title="STATE UPDATE" count={0}>
        <p className="text-sm text-gray-500">No state updates configured.</p>
      </CollapsibleSection>
    </div>
  );
}
