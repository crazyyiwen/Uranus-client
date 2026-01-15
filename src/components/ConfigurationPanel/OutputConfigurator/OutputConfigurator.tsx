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
import { Plus, X, Pencil } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

interface OutputConfiguratorProps {
  node: WorkflowNode;
}

export function OutputConfigurator({ node }: OutputConfiguratorProps) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const config = node.config as any;
  const outputMapping = config.outputMapping || [];

  const addOutputMapping = () => {
    const newMapping = { name: '', type: 'string', value: '' };
    updateNodeConfig(node.id, {
      ...config,
      outputMapping: [...(config.outputMapping || []), newMapping],
    });
  };

  const removeOutputMapping = (index: number) => {
    const newMappings = config.outputMapping?.filter(
      (_: any, i: number) => i !== index
    );
    updateNodeConfig(node.id, { ...config, outputMapping: newMappings });
  };

  const updateOutputMapping = (
    index: number,
    field: string,
    value: string
  ) => {
    const newMapping = [...(config.outputMapping || [])];
    newMapping[index] = { ...newMapping[index], [field]: value };
    updateNodeConfig(node.id, { ...config, outputMapping: newMapping });
  };

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

      {/* Output Mapping */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">
            OUTPUT MAPPING{' '}
            <span className="text-gray-500 font-normal">(1)</span>
          </Label>
          <Button variant="ghost" size="sm" className="text-blue-600">
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <Input
              value="messages"
              placeholder="Field name"
              className="font-mono text-sm"
            />
            <div className="flex gap-2">
              <Input
                value="{{thread.messages}}"
                readOnly
                className="flex-1 bg-blue-50 border-blue-200 font-mono text-sm"
              />
              <Select value="string">
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">string</SelectItem>
                  <SelectItem value="number">number</SelectItem>
                  <SelectItem value="boolean">boolean</SelectItem>
                  <SelectItem value="object">object</SelectItem>
                  <SelectItem value="array">array</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
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
