import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useWorkflowStore } from '@/store/workflowStore';
import type { AgentNodeConfig, PromptMessage } from '@/types/node.types';
import { v4 as uuidv4 } from 'uuid';

interface PromptTemplateEditorProps {
  nodeId: string;
}

export function PromptTemplateEditor({ nodeId }: PromptTemplateEditorProps) {
  const { nodes, updateNodeConfig } = useWorkflowStore();
  const node = nodes.find(n => n.id === nodeId);
  const config = node?.config as AgentNodeConfig;
  const messages = config?.promptTemplate || [];

  const addMessage = () => {
    const newMessage: PromptMessage = {
      id: uuidv4(),
      role: 'user',
      text: '',
    };
    updateNodeConfig(nodeId, {
      promptTemplate: [...messages, newMessage],
    });
  };

  const updateMessage = (id: string, updates: Partial<PromptMessage>) => {
    const updated = messages.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    );
    updateNodeConfig(nodeId, { promptTemplate: updated });
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(msg => msg.id !== id);
    updateNodeConfig(nodeId, { promptTemplate: updated });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'system': return 'default';
      case 'user': return 'secondary';
      case 'assistant': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base">Prompt Templates</Label>
        <Button variant="outline" size="sm" onClick={addMessage}>
          <Plus className="h-4 w-4 mr-2" />
          Add Message
        </Button>
      </div>

      <div className="space-y-3">
        {messages.map((message, index) => (
          <div key={message.id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={getRoleBadgeVariant(message.role)}>
                  {message.role}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {message.text.length} chars • {message.text.split(' ').length} words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={message.role}
                  onValueChange={(value) => updateMessage(message.id, { role: value as any })}
                >
                  <SelectTrigger className="h-8 w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">system</SelectItem>
                    <SelectItem value="user">user</SelectItem>
                    <SelectItem value="assistant">assistant</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => deleteMessage(message.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Textarea
              value={message.text}
              onChange={(e) => updateMessage(message.id, { text: e.target.value })}
              placeholder={`Enter ${message.role} message...`}
              rows={3}
              className="font-mono text-sm"
            />
          </div>
        ))}

        {messages.length === 0 && (
          <div className="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
            No messages. Click "Add Message" to create one.
          </div>
        )}
      </div>
    </div>
  );
}
