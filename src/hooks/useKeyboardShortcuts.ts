import { useEffect } from 'react';
import { useWorkflowStore } from '@/store/workflowStore';

export function useKeyboardShortcuts() {
  useEffect(() => {
    console.log('[useKeyboardShortcuts] Hook initialized');

    const handleKeyDown = (e: KeyboardEvent) => {
      console.log('[Keyboard] Key pressed:', e.key, 'Target:', (e.target as HTMLElement).tagName);

      // Prevent shortcuts when typing in input/textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        console.log('[Keyboard] Ignoring - inside input/textarea');
        return;
      }

      // CRITICAL: Prevent Backspace from navigating back in browser history
      if (e.key === 'Backspace') {
        console.log('[Keyboard] Backspace detected - preventing default browser behavior');
        e.preventDefault();
        e.stopPropagation();
      }

      // Get fresh state from store on each keypress
      const state = useWorkflowStore.getState();

      // Delete: Delete or Backspace key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        console.log('[Keyboard] Delete/Backspace detected');
        e.preventDefault();

        console.log('[Keyboard] Selected node IDs from store:', state.selectedNodes);
        console.log('[Keyboard] Total workflow nodes:', state.workflow.nodes.length);

        // Filter out non-deletable nodes
        const deletableNodeIds = state.selectedNodes.filter(nodeId => {
          const node = state.workflow.nodes.find(n => n.id === nodeId);
          return node && node.deletable !== false;
        });

        console.log('[Keyboard] Deletable node IDs:', deletableNodeIds);

        if (deletableNodeIds.length > 0) {
          console.log('[Keyboard] Calling deleteNodes with:', deletableNodeIds);
          state.deleteNodes(deletableNodeIds);
        } else {
          console.log('[Keyboard] No deletable nodes to delete');
        }
        return;
      }

      // Undo: Ctrl+Z (Windows/Linux) or Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        if (state.canUndo()) {
          e.preventDefault();
          state.undo();
        }
      }

      // Redo: Ctrl+Shift+Z or Ctrl+Y (Windows/Linux) or Cmd+Shift+Z (Mac)
      if (
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') ||
        ((e.ctrlKey || e.metaKey) && e.key === 'y')
      ) {
        if (state.canRedo()) {
          e.preventDefault();
          state.redo();
        }
      }
    };

    // Use capture phase to intercept Backspace before browser's default handler
    window.addEventListener('keydown', handleKeyDown, true);
    console.log('[useKeyboardShortcuts] Event listener attached (with capture=true)');

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      console.log('[useKeyboardShortcuts] Event listener removed');
    };
  }, []); // Empty dependency array - only setup once
}
