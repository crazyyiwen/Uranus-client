import { create } from 'zustand';
import type { WorkflowData } from '@/types/workflow.types';

const STORAGE_KEYS = {
  DRAFT: 'workflow_draft',
  PUBLISHED: 'workflow_published',
  AUTO_SAVE_TIMESTAMP: 'workflow_autosave_timestamp',
} as const;

interface StorageState {
  // Draft operations
  saveDraft: (workflow: WorkflowData) => void;
  loadDraft: () => WorkflowData | null;
  hasDraft: () => boolean;
  clearDraft: () => void;

  // Published operations
  publish: (workflow: WorkflowData) => void;
  loadPublished: () => WorkflowData | null;
  hasPublished: () => boolean;
  clearPublished: () => void;

  // Utility
  getLastSaveTimestamp: () => string | null;
  exportWorkflow: (workflow: WorkflowData) => void;
  importWorkflow: (file: File) => Promise<WorkflowData | null>;
}

export const useStorageStore = create<StorageState>()((set, get) => ({
  saveDraft: (workflow) => {
    try {
      const draft = {
        ...workflow,
        status: 'draft' as const,
        updatedOn: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
      localStorage.setItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP, new Date().toISOString());
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  },

  loadDraft: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  },

  hasDraft: () => {
    return !!localStorage.getItem(STORAGE_KEYS.DRAFT);
  },

  clearDraft: () => {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    localStorage.removeItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP);
  },

  publish: (workflow) => {
    try {
      const published = {
        ...workflow,
        status: 'published' as const,
        updatedOn: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEYS.PUBLISHED, JSON.stringify(published));
      // Also save as draft to keep them in sync
      get().saveDraft(published);
    } catch (error) {
      console.error('Failed to publish workflow:', error);
    }
  },

  loadPublished: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PUBLISHED);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load published workflow:', error);
      return null;
    }
  },

  hasPublished: () => {
    return !!localStorage.getItem(STORAGE_KEYS.PUBLISHED);
  },

  clearPublished: () => {
    localStorage.removeItem(STORAGE_KEYS.PUBLISHED);
  },

  getLastSaveTimestamp: () => {
    return localStorage.getItem(STORAGE_KEYS.AUTO_SAVE_TIMESTAMP);
  },

  exportWorkflow: (workflow) => {
    try {
      const dataStr = JSON.stringify(workflow, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${workflow.name || 'workflow'}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export workflow:', error);
    }
  },

  importWorkflow: async (file: File) => {
    try {
      const text = await file.text();
      const workflow = JSON.parse(text) as WorkflowData;

      // Basic validation
      if (!workflow.nodes || !workflow.edges) {
        throw new Error('Invalid workflow format');
      }

      return workflow;
    } catch (error) {
      console.error('Failed to import workflow:', error);
      return null;
    }
  },
}));
