import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useWorkflowStore } from '@/store/workflowStore';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Plus, X } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';

interface APIConfiguratorProps {
  node: WorkflowNode;
}

export function APIConfigurator({ node }: APIConfiguratorProps) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const config = node.config as any;
  const headers = config.headers || [];

  const handleMethodChange = (method: string) => {
    updateNodeConfig(node.id, { ...config, method });
  };

  const handleUrlChange = (url: string) => {
    updateNodeConfig(node.id, { ...config, url });
  };

  const handleTimeoutChange = (timeout: string) => {
    updateNodeConfig(node.id, { ...config, timeout: parseInt(timeout) || 30000 });
  };

  const addHeader = () => {
    const newHeaders = [...headers, { key: '', value: '' }];
    updateNodeConfig(node.id, { ...config, headers: newHeaders });
  };

  const removeHeader = (index: number) => {
    const newHeaders = headers.filter((_: any, i: number) => i !== index);
    updateNodeConfig(node.id, { ...config, headers: newHeaders });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...headers];
    newHeaders[index] = { ...newHeaders[index], [field]: value };
    updateNodeConfig(node.id, { ...config, headers: newHeaders });
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

      {/* API Section */}
      <div className="space-y-4">
        <Label className="text-sm font-semibold">API</Label>
        <div className="flex gap-2">
          <Select value={config.method || 'GET'} onValueChange={handleMethodChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
            </SelectContent>
          </Select>
          <Input
            value={config.url || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="Enter URL or {{variable}}"
            className="flex-1"
          />
        </div>
      </div>

      {/* Headers */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Headers</Label>
          <Button
            variant="ghost"
            size="sm"
            onClick={addHeader}
            className="text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        {headers.length === 0 ? (
          <p className="text-sm text-gray-500">
            No headers yet. Click Add to create one.
          </p>
        ) : (
          <div className="space-y-2">
            {headers.map((header: any, index: number) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={header.key}
                  onChange={(e) => updateHeader(index, 'key', e.target.value)}
                  placeholder="Header name"
                  className="flex-1"
                />
                <Input
                  value={header.value}
                  onChange={(e) => updateHeader(index, 'value', e.target.value)}
                  placeholder="Header value"
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeHeader(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timeout */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Timeout</Label>
        <Input
          type="number"
          value={config.timeout || 30000}
          onChange={(e) => handleTimeoutChange(e.target.value)}
          placeholder="30000"
        />
        <p className="text-xs text-gray-500">
          Request timeout in milliseconds (1000-30000)
        </p>
      </div>

      {/* Output Variables */}
      <CollapsibleSection title="OUTPUT VARIABLES" count={0}>
        <p className="text-sm text-gray-500">
          No output variables yet. Click Add to create one.
        </p>
      </CollapsibleSection>

      {/* State Update */}
      <CollapsibleSection title="STATE UPDATE" count={0}>
        <p className="text-sm text-gray-500">
          No state updates configured.
        </p>
      </CollapsibleSection>
    </div>
  );
}
