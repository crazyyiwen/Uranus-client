import { Play, Save, FileJson, Settings, Variable, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useUIStore } from '@/store/uiStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useStorageStore } from '@/store/storageStore';
import { formatDistanceToNow } from '@/utils/dateUtils';

export function TopNav() {
  const { activeTab, setActiveTab, lastSavedAt } = useUIStore();
  const workflow = useWorkflowStore((state) => state.workflow);
  const { saveDraft, publish } = useStorageStore();

  const handleSave = () => {
    saveDraft(workflow);
    useUIStore.setState({ lastSavedAt: new Date().toISOString() });
  };

  const handlePublish = () => {
    publish(workflow);
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left: Workflow name and status */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">{workflow.displayName || 'Untitled Workflow'}</h1>
        <Badge variant={workflow.status === 'published' ? 'default' : 'secondary'}>
          {workflow.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
        {lastSavedAt && (
          <span className="text-xs text-muted-foreground">
            Auto-saved {formatDistanceToNow(lastSavedAt)}
          </span>
        )}
      </div>

      {/* Center: Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
        <TabsList>
          <TabsTrigger value="properties" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="json" className="flex items-center gap-2">
            <FileJson className="h-4 w-4" />
            JSON
          </TabsTrigger>
          <TabsTrigger value="interface" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Interface
          </TabsTrigger>
          <TabsTrigger value="variables" className="flex items-center gap-2">
            <Variable className="h-4 w-4" />
            Variables
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        <Button variant="default" size="sm" onClick={handlePublish}>
          Publish
        </Button>
        <Button variant="ghost" size="sm">
          <Play className="h-4 w-4 mr-2" />
          Run
        </Button>
      </div>
    </div>
  );
}
