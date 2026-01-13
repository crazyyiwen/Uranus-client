import { useEffect } from 'react';
import { TopNav } from '@/components/TopNavigation/TopNav';
import { Sidebar } from '@/components/Sidebar/Sidebar';
import { WorkflowCanvas } from '@/components/WorkflowCanvas/WorkflowCanvas';
import { ConfigPanel } from '@/components/ConfigurationPanel/ConfigPanel';
import { useWorkflowStore } from '@/store/workflowStore';
import { useStorageStore } from '@/store/storageStore';
import { useUIStore } from '@/store/uiStore';
import { useAutoSave } from '@/hooks/useAutoSave';

export function EditorPage() {
  const { setWorkflow } = useWorkflowStore();
  const { loadDraft, hasDraft } = useStorageStore();
  const activeTab = useUIStore((state) => state.activeTab);

  // Load workflow from localStorage on mount
  useEffect(() => {
    if (hasDraft()) {
      const draft = loadDraft();
      if (draft) {
        setWorkflow(draft);
      }
    }
  }, [hasDraft, loadDraft, setWorkflow]);

  // Enable auto-save
  useAutoSave(3000);

  return (
    <div className="flex flex-col h-screen">
      <TopNav />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        <main className="flex-1 relative">
          {activeTab === 'properties' && <WorkflowCanvas />}
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
