import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useStorageStore } from '@/store/storageStore';
import { useUIStore } from '@/store/uiStore';

export function useAutoSave(interval: number = 3000) {
  const workflow = useWorkflowStore((state) => state.workflow);
  const saveDraft = useStorageStore((state) => state.saveDraft);
  const setLastSavedAt = useUIStore((state) => state.setLastSavedAt);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      saveDraft(workflow);
      setLastSavedAt(new Date().toISOString());
    }, interval);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [workflow, saveDraft, setLastSavedAt, interval]);
}
