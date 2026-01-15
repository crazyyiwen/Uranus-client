import { Play, Save, FileJson, Settings, Variable, Layout, LogOut, User, Undo, Redo } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUIStore } from '@/store/uiStore';
import { useWorkflowStore } from '@/store/workflowStore';
import { useStorageStore } from '@/store/storageStore';
import { useAuthStore } from '@/store/authStore';
import { formatDistanceToNow } from '@/utils/dateUtils';

export function TopNav() {
  const navigate = useNavigate();
  const { activeTab, setActiveTab } = useUIStore();
  const {
    workflow,
    hasUnsavedChanges,
    lastSaved,
    undo,
    redo,
    canUndo,
    canRedo,
    markSaved,
  } = useWorkflowStore();
  const { saveDraft, publish } = useStorageStore();
  const { user, logout } = useAuthStore();

  const handleSave = () => {
    saveDraft(workflow);
    markSaved();
  };

  const handlePublish = () => {
    publish(workflow);
    markSaved();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-14 border-b bg-background flex items-center justify-between px-4">
      {/* Left: Workflow name and status */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          {workflow.displayName || 'Untitled Workflow'}
          {hasUnsavedChanges && <span className="text-red-500 ml-1">*</span>}
        </h1>
        <Badge variant={workflow.status === 'published' ? 'default' : 'secondary'}>
          {workflow.status === 'published' ? 'Published' : 'Draft'}
        </Badge>
        {lastSaved && (
          <span className="text-xs text-muted-foreground">
            Saved {formatDistanceToNow(lastSaved.toISOString())}
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
        {/* Undo/Redo */}
        <div className="flex items-center gap-1 border-r pr-2 mr-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => undo()}
            disabled={!canUndo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => redo()}
            disabled={!canRedo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

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

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="h-4 w-4" />
              {user?.username}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{user?.username}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
