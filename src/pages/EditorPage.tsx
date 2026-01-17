import { TopNav } from '@/components/TopNavigation/TopNav';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { WorkflowCanvas } from '@/components/WorkflowCanvas/WorkflowCanvas';
import { ConfigPanel } from '@/components/ConfigurationPanel/ConfigPanel';
import { useUIStore } from '@/store/uiStore';

export function EditorPage() {
  const activeTab = useUIStore((state) => state.activeTab);

  // Note: localStorage auto-load and auto-save removed
  // Workflow data will be saved to database instead

  return (
    <div className="flex flex-col h-screen">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 relative">
          {activeTab === 'properties' && <WorkflowCanvas key="workflow-canvas" />}
          {activeTab === 'json' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">JSON Editor - Coming Soon</p>
            </div>
          )}
          {activeTab === 'interface' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Interface Editor - Coming Soon</p>
            </div>
          )}
          {activeTab === 'variables' && (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Variables Editor - Coming Soon</p>
            </div>
          )}
        </main>
      </div>

      <ConfigPanel />
    </div>
  );
}
