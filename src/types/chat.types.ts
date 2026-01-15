// Chat session types for execution history
export interface ChatMessage {
  id: string;
  type: 'user' | 'ai' | 'error' | 'intermediate';
  content: string;
  timestamp: Date;
  metadata?: unknown;
  rawResponse?: {
    executionSequence?: unknown[];
    snapshot?: Record<string, unknown> | any[];
    duration?: number;
  };
  attachments?: FileAttachment[];
}

export interface FileAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
  data?: string; // Base64 or URL
}

export interface ChatSession {
  sessionId: string;
  messages: ChatMessage[];
  timestamp: Date;
  lastUpdated: Date;
  title: string;
  workflowId: string | null;
}

export interface ValidationIssue {
  nodeId: string;
  nodeName: string;
  type: 'error' | 'warning';
  message: string;
  field?: string;
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  timestamp: Date;
}
