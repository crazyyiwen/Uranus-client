import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useWorkflowStore } from '@/store/workflowStore';
import type { AgentNodeConfig } from '@/types/node.types';
import { PromptTemplateEditor } from './PromptTemplateEditor';
import { ToolsManager } from './ToolsManager';

interface AgentConfiguratorProps {
  nodeId: string;
}

export function AgentConfigurator({ nodeId }: AgentConfiguratorProps) {
  const { nodes, updateNode, updateNodeConfig } = useWorkflowStore();
  const node = nodes.find(n => n.id === nodeId);

  if (!node || node.type !== 'agent') return null;

  const config = node.config as AgentNodeConfig;

  const handleNameChange = (value: string) => {
    updateNode(nodeId, { name: value });
  };

  const handleDescriptionChange = (value: string) => {
    updateNode(nodeId, { description: value });
  };

  const handleStrategyChange = (value: string) => {
    updateNodeConfig(nodeId, { agentStrategy: value });
  };

  const handleModelChange = (value: string) => {
    const modelMap: Record<string, { code: string; name: string }> = {
      'gpt-4.1': { code: 'gpt-4.1', name: 'OpenAI GPT-4.1' },
      'gpt-4': { code: 'gpt-4', name: 'OpenAI GPT-4' },
      'claude-3-opus': { code: 'claude-3-opus', name: 'Claude 3 Opus' },
      'claude-3-sonnet': { code: 'claude-3-sonnet', name: 'Claude 3 Sonnet' },
    };
    updateNodeConfig(nodeId, { model: modelMap[value] });
  };

  return (
    <div className="space-y-6">
      {/* Name and Description */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={node.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Enter agent name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={node.description}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            placeholder="Add description..."
            rows={2}
          />
        </div>
      </div>

      <Separator />

      {/* Agent Strategy */}
      <div className="space-y-2">
        <Label>Agent Strategy</Label>
        <Select value={config.agentStrategy} onValueChange={handleStrategyChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="react">ReAct</SelectItem>
            <SelectItem value="plan-and-execute">Plan and Execute</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label>Model</Label>
        <Select value={config.model?.code || 'gpt-4.1'} onValueChange={handleModelChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gpt-4.1">OpenAI GPT-4.1</SelectItem>
            <SelectItem value="gpt-4">OpenAI GPT-4</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Prompt Templates */}
      <PromptTemplateEditor nodeId={nodeId} />

      <Separator />

      {/* Tools */}
      <ToolsManager nodeId={nodeId} />
    </div>
  );
}
