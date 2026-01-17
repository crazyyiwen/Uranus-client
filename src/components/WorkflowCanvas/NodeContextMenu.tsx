import { useEffect, useRef, useState } from 'react';
import { Copy, Trash2, Edit, Play } from 'lucide-react';
import { useWorkflowStore } from '@/store/workflowStore';
import { useUIStore } from '@/store/uiStore';

interface NodeContextMenuProps {
  nodeId: string;
  x: number;
  y: number;
  onClose: () => void;
}

export function NodeContextMenu({ nodeId, x, y, onClose }: NodeContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const workflow = useWorkflowStore((state) => state.workflow);
  const duplicateNode = useWorkflowStore((state) => state.duplicateNode);
  const deleteNode = useWorkflowStore((state) => state.deleteNode);
  const { openConfigPanel } = useUIStore();

  const node = workflow.nodes.find(n => n.id === nodeId);
  const isDeletable = node?.deletable !== false;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleDuplicate = () => {
    duplicateNode(nodeId);
    onClose();
  };

  const handleDelete = () => {
    if (isDeletable) {
      deleteNode(nodeId);
      onClose();
    }
  };

  const handleEdit = () => {
    openConfigPanel(nodeId);
    onClose();
  };

  const handleRun = () => {
    // TODO: Implement run single node
    console.log('Run node:', nodeId);
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1"
      style={{ left: x, top: y }}
    >
      <button
        onClick={handleEdit}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <Edit className="w-4 h-4" />
        Edit Properties
      </button>
      <button
        onClick={handleDuplicate}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Duplicate
      </button>
      <button
        onClick={handleRun}
        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        Run Node
      </button>
      <div className="h-px bg-gray-200 my-1" />
      <button
        onClick={handleDelete}
        disabled={!isDeletable}
        className={`w-full px-4 py-2 text-left text-sm flex items-center gap-2 ${
          isDeletable
            ? 'hover:bg-red-50 text-red-600'
            : 'opacity-50 cursor-not-allowed text-gray-400'
        }`}
      >
        <Trash2 className="w-4 h-4" />
        Delete
      </button>
    </div>
  );
}
