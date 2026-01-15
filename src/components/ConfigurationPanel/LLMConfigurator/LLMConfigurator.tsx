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
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/store/workflowStore';
import { CollapsibleSection } from '../shared/CollapsibleSection';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { WorkflowNode } from '@/types/workflow.types';
import type { PromptMessage } from '@/types/node.types';

interface LLMConfiguratorProps {
  node: WorkflowNode;
}

export function LLMConfigurator({ node }: LLMConfiguratorProps) {
  const updateNodeConfig = useWorkflowStore((state) => state.updateNodeConfig);
  const updateNode = useWorkflowStore((state) => state.updateNode);

  const config = node.config as any;
  const promptTemplate = config.promptTemplate || [];

  const handleModelChange = (modelCode: string) => {
    const modelName = modelCode; // In real app, map code to full name
    updateNodeConfig(node.id, {
      ...config,
      model: { code: modelCode, name: modelName },
    });
  };

  const addMessage = () => {
    const newMessage: PromptMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: '',
    };
    updateNodeConfig(node.id, {
      ...config,
      promptTemplate: [...promptTemplate, newMessage],
    });
  };

  const removeMessage = (messageId: string) => {
    const newPromptTemplate = promptTemplate.filter(
      (msg: PromptMessage) => msg.id !== messageId
    );
    updateNodeConfig(node.id, { ...config, promptTemplate: newPromptTemplate });
  };

  const updateMessage = (messageId: string, updates: Partial<PromptMessage>) => {
    const newPromptTemplate = promptTemplate.map((msg: PromptMessage) =>
      msg.id === messageId ? { ...msg, ...updates } : msg
    );
    updateNodeConfig(node.id, { ...config, promptTemplate: newPromptTemplate });
  };

  const countWordsAndChars = (text: string) => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const chars = text.length;
    return { words, chars };
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

      {/* Model Selection */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Model</Label>
        <div className="flex gap-2">
          <Select
            value={config.model?.code || ''}
            onValueChange={handleModelChange}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select model" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gpt-4-turbo">OpenAI GPT-4 Turbo</SelectItem>
              <SelectItem value="gpt-4">OpenAI GPT-4</SelectItem>
              <SelectItem value="gpt-3.5-turbo">OpenAI GPT-3.5 Turbo</SelectItem>
              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prompt Templates */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Prompt Templates</Label>
        <div className="space-y-3">
          {promptTemplate.map((message: PromptMessage, index: number) => {
            const { words, chars } = countWordsAndChars(message.text);
            return (
              <div
                key={message.id}
                className="border rounded-lg p-3 space-y-2 bg-white"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-4 h-4 text-gray-400" />
                    <Select
                      value={message.role}
                      onValueChange={(role) =>
                        updateMessage(message.id, { role: role as any })
                      }
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">system</SelectItem>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="assistant">assistant</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="secondary" className="text-xs">
                      {chars} chars • {words} words
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMessage(message.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={message.text}
                  onChange={(e) =>
                    updateMessage(message.id, { text: e.target.value })
                  }
                  placeholder={`Enter ${message.role} message...`}
                  className="min-h-[80px] font-mono text-sm"
                />
              </div>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addMessage}
          className="w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Message
        </Button>
      </div>

      {/* Structured Output */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Structured Output</Label>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={config.structuredOutput?.enable || false}
            onChange={(e) =>
              updateNodeConfig(node.id, {
                ...config,
                structuredOutput: {
                  ...config.structuredOutput,
                  enable: e.target.checked,
                },
              })
            }
            className="w-4 h-4"
          />
          <span className="text-sm">Enable structured output</span>
        </div>
      </div>

      {/* Output Variables */}
      <CollapsibleSection title="OUTPUT VARIABLES" count={3}>
        <p className="text-sm text-gray-500">Output variables configuration</p>
      </CollapsibleSection>

      {/* State Update */}
      <CollapsibleSection title="STATE UPDATE" count={1}>
        <p className="text-sm text-gray-500">State update configuration</p>
      </CollapsibleSection>
    </div>
  );
}
