import {
  Play,
  Bot,
  FileOutput,
  Sparkles,
  Globe,
  Shield,
  GitBranch,
  GitMerge,
  Workflow,
  Variable,
  Code
} from 'lucide-react';
import type { NodeType } from '@/types/workflow.types';

interface NodeCardProps {
  type: NodeType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

function NodeCard({ type, label, icon, description }: NodeCardProps) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:shadow-sm cursor-grab active:cursor-grabbing transition-all"
    >
      <div className="p-2 rounded-md bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground line-clamp-2">{description}</div>
      </div>
    </div>
  );
}

export function NodesPalette() {
  const nodes: NodeCardProps[] = [
    {
      type: 'start',
      label: 'START',
      icon: <Play className="h-4 w-4" />,
      description: 'Starting point of the workflow',
    },
    {
      type: 'agent',
      label: 'Agent',
      icon: <Bot className="h-4 w-4" />,
      description: 'AI agent with tools and reasoning capabilities',
    },
    {
      type: 'llm',
      label: 'LLM',
      icon: <Sparkles className="h-4 w-4" />,
      description: 'Large Language Model for text generation',
    },
    {
      type: 'httpRequest',
      label: 'HTTP Request',
      icon: <Globe className="h-4 w-4" />,
      description: 'Make HTTP API calls',
    },
    {
      type: 'guardrail',
      label: 'Guardrail',
      icon: <Shield className="h-4 w-4" />,
      description: 'Validate and filter content',
    },
    {
      type: 'rule',
      label: 'Rule',
      icon: <GitBranch className="h-4 w-4" />,
      description: 'Conditional branching logic',
    },
    {
      type: 'parallel',
      label: 'Parallel',
      icon: <GitMerge className="h-4 w-4" />,
      description: 'Execute multiple branches concurrently',
    },
    {
      type: 'workflow',
      label: 'Workflow',
      icon: <Workflow className="h-4 w-4" />,
      description: 'Nested workflow execution',
    },
    {
      type: 'output',
      label: 'Output',
      icon: <FileOutput className="h-4 w-4" />,
      description: 'Output node for workflow results',
    },
    {
      type: 'variable',
      label: 'Variable',
      icon: <Variable className="h-4 w-4" />,
      description: 'Get or set workflow variables',
    },
    {
      type: 'script',
      label: 'Script',
      icon: <Code className="h-4 w-4" />,
      description: 'Execute custom JavaScript or Python code',
    },
  ];

  return (
    <div className="px-4 pb-4 space-y-2">
      {nodes.map((node) => (
        <NodeCard key={node.type} {...node} />
      ))}
    </div>
  );
}
