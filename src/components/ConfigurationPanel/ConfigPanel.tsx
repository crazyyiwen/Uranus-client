import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/store/uiStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { AgentConfigurator } from './AgentConfigurator/AgentConfigurator';
import { X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ConfigPanel() {
  const { configPanelOpen, selectedNodeId, closeConfigPanel } = useUIStore();
  const { nodes, deleteNode } = useWorkflowStore();

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      closeConfigPanel();
    }
  };

  return (
    <Sheet open={configPanelOpen} onOpenChange={(open) => !open && closeConfigPanel()}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-3 rounded-lg bg-primary/10 text-primary">
              <span className="text-2xl">🤖</span>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl">{selectedNode.name}</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">{selectedNode.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedNode.deletable && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={closeConfigPanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">
          {selectedNode.type === 'agent' && (
            <AgentConfigurator nodeId={selectedNodeId!} />
          )}
          {selectedNode.type !== 'agent' && (
            <div className="text-sm text-muted-foreground text-center py-8">
              Configuration for {selectedNode.type} nodes coming soon
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
