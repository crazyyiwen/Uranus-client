import { useState } from 'react';
import { Plus, Wrench, Trash2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkflowStore } from '@/store/workflowStore';
import type { AgentNodeConfig, Tool } from '@/types/node.types';
import { v4 as uuidv4 } from 'uuid';

interface ToolsManagerProps {
  nodeId: string;
}

export function ToolsManager({ nodeId }: ToolsManagerProps) {
  const { nodes, addToolToNode, removeToolFromNode } = useWorkflowStore();
  const node = nodes.find(n => n.id === nodeId);
  const config = node?.config as AgentNodeConfig;
  const tools = config?.tools || [];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newToolData, setNewToolData] = useState({
    name: '',
    description: '',
    type: 'mcp' as 'handoff' | 'mcp' | 'http' | 'function',
    targetNodeId: '',
  });

  const handleAddTool = () => {
    const newTool: Tool = {
      _id: uuidv4(),
      name: newToolData.name,
      description: newToolData.description,
      type: 'tool',
      config: {
        enabled: true,
        toolId: `tool-${newToolData.type}`,
        type: newToolData.type,
        schema: {
          type: 'object',
          properties: {},
          required: [],
          additionalProperties: false,
        },
        settings: newToolData.type === 'handoff' ? { nodeId: newToolData.targetNodeId } : {},
        returnDirect: false,
      },
    };

    addToolToNode(nodeId, newTool);
    setDialogOpen(false);
    setNewToolData({ name: '', description: '', type: 'mcp', targetNodeId: '' });
  };

  const allNodes = useWorkflowStore((state) => state.workflow.nodes);
  const availableTargetNodes = allNodes.filter(n => n.id !== nodeId && n.type !== 'start');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base">Tools</Label>
          <p className="text-xs text-muted-foreground">
            {tools.length} {tools.length === 1 ? 'tool' : 'tools'} added
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Tool</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tool-name">Name</Label>
                <Input
                  id="tool-name"
                  value={newToolData.name}
                  onChange={(e) => setNewToolData({ ...newToolData, name: e.target.value })}
                  placeholder="e.g., create_request"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-desc">Description</Label>
                <Textarea
                  id="tool-desc"
                  value={newToolData.description}
                  onChange={(e) => setNewToolData({ ...newToolData, description: e.target.value })}
                  placeholder="What does this tool do?"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tool-type">Type</Label>
                <Select
                  value={newToolData.type}
                  onValueChange={(value) => setNewToolData({ ...newToolData, type: value as any })}
                >
                  <SelectTrigger id="tool-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="handoff">Handoff (to another node)</SelectItem>
                    <SelectItem value="mcp">MCP Tool</SelectItem>
                    <SelectItem value="http">HTTP Request</SelectItem>
                    <SelectItem value="function">Function</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newToolData.type === 'handoff' && (
                <div className="space-y-2">
                  <Label htmlFor="target-node">Target Node</Label>
                  <Select
                    value={newToolData.targetNodeId}
                    onValueChange={(value) => setNewToolData({ ...newToolData, targetNodeId: value })}
                  >
                    <SelectTrigger id="target-node">
                      <SelectValue placeholder="Select target node" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargetNodes.map((n) => (
                        <SelectItem key={n.id} value={n.id}>
                          {n.name} ({n.type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={handleAddTool} className="w-full">
                Add Tool
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {tools.map((tool) => (
          <div key={tool._id} className="p-3 border rounded-lg space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{tool.name}</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    {tool.config.type}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeToolFromNode(nodeId, tool._id)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">
              {tool.description || 'No description'}
            </p>
          </div>
        ))}

        {tools.length === 0 && (
          <div className="col-span-2 text-sm text-muted-foreground text-center py-4 border border-dashed rounded-lg">
            No tools added yet
          </div>
        )}
      </div>
    </div>
  );
}
