import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useUIStore } from '@/store/uiStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { AgentConfigurator } from './AgentConfigurator/AgentConfigurator';
import { APIConfigurator } from './APIConfigurator/APIConfigurator';
import { LLMConfigurator } from './LLMConfigurator/LLMConfigurator';
import { OutputConfigurator } from './OutputConfigurator/OutputConfigurator';
import { ParallelConfigurator } from './ParallelConfigurator/ParallelConfigurator';
import { RuleConfigurator } from './RuleConfigurator/RuleConfigurator';
import { ScriptConfigurator } from './ScriptConfigurator/ScriptConfigurator';
import { WorkflowConfigurator } from './WorkflowConfigurator/WorkflowConfigurator';
import { VariableConfigurator } from './VariableConfigurator/VariableConfigurator';
import {
  X,
  Trash2,
  Play,
  Bot,
  Database,
  Zap,
  FileOutput,
  GitBranch,
  GitMerge,
  FileCode,
  Workflow,
  Variable
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NodeType } from '@/types/workflow.types';

// Map node types to icons and colors
const nodeIcons: Record<NodeType, { icon: any; color: string; bgColor: string }> = {
  start: { icon: Play, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  agent: { icon: Bot, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  llm: { icon: Zap, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  httpRequest: { icon: Database, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  output: { icon: FileOutput, color: 'text-gray-600', bgColor: 'bg-gray-100' },
  parallel: { icon: GitMerge, color: 'text-purple-600', bgColor: 'bg-purple-100' },
  guardrail: { icon: GitBranch, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  rule: { icon: GitBranch, color: 'text-red-600', bgColor: 'bg-red-100' },
  workflow: { icon: Workflow, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  variable: { icon: Variable, color: 'text-green-600', bgColor: 'bg-green-100' },
  script: { icon: FileCode, color: 'text-orange-600', bgColor: 'bg-orange-100' },
};

export function ConfigPanel() {
  const { configPanelOpen, selectedNodeId, closeConfigPanel } = useUIStore();
  const workflow = useWorkflowStore((state) => state.workflow);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) return null;

  const handleDelete = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      closeConfigPanel();
    }
  };

  // Get icon and colors for node type
  const nodeIcon = nodeIcons[selectedNode.type] || nodeIcons.agent;
  const IconComponent = nodeIcon.icon;

  // Render the appropriate configurator based on node type
  const renderConfigurator = () => {
    switch (selectedNode.type) {
      case 'agent':
        return <AgentConfigurator nodeId={selectedNodeId!} />;
      case 'httpRequest':
        return <APIConfigurator node={selectedNode} />;
      case 'llm':
        return <LLMConfigurator node={selectedNode} />;
      case 'output':
        return <OutputConfigurator node={selectedNode} />;
      case 'parallel':
        return <ParallelConfigurator node={selectedNode} />;
      case 'rule':
        return <RuleConfigurator node={selectedNode} />;
      case 'script':
        return <ScriptConfigurator node={selectedNode} />;
      case 'workflow':
        return <WorkflowConfigurator node={selectedNode} />;
      case 'variable':
        return <VariableConfigurator node={selectedNode} />;
      case 'guardrail':
        return (
          <div className="text-sm text-muted-foreground text-center py-8">
            Guardrail configuration coming soon
          </div>
        );
      case 'start':
        return (
          <div className="text-sm text-muted-foreground text-center py-8">
            Start node has no configuration
          </div>
        );
      default:
        return (
          <div className="text-sm text-muted-foreground text-center py-8">
            Configuration for {selectedNode.type} nodes not yet implemented
          </div>
        );
    }
  };

  return (
    <Sheet open={configPanelOpen} onOpenChange={(open) => !open && closeConfigPanel()}>
      <SheetContent side="right" className="w-[600px] sm:max-w-[600px] overflow-y-auto">
        <SheetHeader className="flex flex-row items-start justify-between pb-6 border-b">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg ${nodeIcon.bgColor}`}>
              <IconComponent className={`w-6 h-6 ${nodeIcon.color}`} />
            </div>
            <div className="flex-1">
              <SheetTitle className="text-lg font-semibold">{selectedNode.name}</SheetTitle>
              <p className="text-sm text-gray-500 mt-0.5">{selectedNode.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedNode.deletable !== false && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={closeConfigPanel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-6">{renderConfigurator()}</div>
      </SheetContent>
    </Sheet>
  );
}
