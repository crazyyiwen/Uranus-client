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
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Plus, X } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

interface WorkflowConfiguratorProps {
  node: WorkflowNode;
}

export function WorkflowConfigurator({ node }: WorkflowConfiguratorProps) {
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

      {/* Agentic Workflow ID */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Agentic Workflow ID</Label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={config.loadDynamically || false}
              onChange={(e) =>
                updateNodeConfig(node.id, {
                  ...config,
                  loadDynamically: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <span className="text-gray-600">Load dynamically</span>
          </label>
        </div>
        <Select
          value={config.workflowId || ''}
          onValueChange={(value) =>
            updateNodeConfig(node.id, { ...config, workflowId: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select an agent..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="workflow-1">Customer Support Workflow</SelectItem>
            <SelectItem value="workflow-2">Data Processing Workflow</SelectItem>
            <SelectItem value="workflow-3">Approval Workflow</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Inputs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Inputs</Label>
          <Button variant="ghost" size="sm" className="text-blue-600">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value="message" className="flex-1 font-mono text-sm" />
            <div className="flex-1 bg-blue-50 border border-blue-200 rounded px-3 py-2 font-mono text-sm">
              {`{{system.userQuery}}`}
            </div>
            <Button variant="ghost" size="sm">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Map data from previous nodes to the selected agent's input parameters
        </p>
      </div>

      {/* Agentic Workflow Node Info */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-semibold mb-2">Agentic Workflow Node:</h4>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Execute another workflow as a modular component</li>
          <li>Map input data using variable references</li>
          <li>
            Use {`{{flow.variable}}`} syntax to reference state variables
          </li>
          <li>
            Use {`{{system.sessionId}}`} for system variables
          </li>
          <li>
            The selected workflow will execute completely and return its results
          </li>
        </ul>
      </div>

      {/* Output Variables */}
      <CollapsibleSection title="OUTPUT VARIABLES" count={1}>
        <p className="text-sm text-gray-500">Output variables configuration</p>
      </CollapsibleSection>

      {/* State Update */}
      <CollapsibleSection title="STATE UPDATE" count={1}>
        <p className="text-sm text-gray-500">State update configuration</p>
      </CollapsibleSection>
    </div>
  );
}
