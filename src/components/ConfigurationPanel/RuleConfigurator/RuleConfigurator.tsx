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
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/store/workflowStore';
import { Plus } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

interface RuleConfiguratorProps {
  node: WorkflowNode;
}

export function RuleConfigurator({ node }: RuleConfiguratorProps) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const config = node.config as any;
  const rules = config.rules || [{ enabled: true, conditions: [] }];

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

      {/* Rule Blocks */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">Rule Blocks</Label>

        {/* IF Block */}
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">IF</span>
              <span className="text-xs text-gray-500">CASE 1</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Select defaultValue="equals">
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select field" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="field1">field1</SelectItem>
                  <SelectItem value="field2">field2</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="equals">
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equals">Equals</SelectItem>
                  <SelectItem value="not-equals">Not Equals</SelectItem>
                  <SelectItem value="contains">Contains</SelectItem>
                  <SelectItem value="greater">Greater Than</SelectItem>
                  <SelectItem value="less">Less Than</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="Enter value" />
          </div>

          <Button variant="ghost" size="sm" className="text-blue-600">
            <Plus className="w-4 h-4 mr-1" />
            Add Condition
          </Button>
        </div>

        {/* ELSE IF */}
        <Button variant="outline" size="sm" className="text-blue-600">
          <Plus className="w-4 h-4 mr-1" />
          ELSE IF
        </Button>

        {/* ELSE Block */}
        <div className="border rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">ELSE</span>
              <span className="text-xs text-gray-500">DEFAULT</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={false}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <p className="text-sm text-gray-500">
            This block will execute when no other conditions are met.
          </p>
        </div>
      </div>

      {/* Rule Node Info */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold mb-2">Rule Node:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>
            <strong>IF Blocks:</strong> First rule block (always required)
          </li>
          <li>
            <strong>ELSE IF Blocks:</strong> Additional rule blocks for complex
            logic
          </li>
          <li>
            <strong>ELSE Block:</strong> Default fallback when no conditions are
            met (optional)
          </li>
          <li>
            Use {`{{flow.fieldName}}`} to reference data from previous nodes
          </li>
          <li>Each rule block creates a new output handle on the node</li>
          <li>
            ELSE block always appears last and executes when no other rules match
          </li>
          <li>
            Removing a rule block will remove its handle and connected edges
          </li>
        </ul>
      </div>
    </div>
  );
}
