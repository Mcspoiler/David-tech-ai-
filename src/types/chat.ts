export type MessageRole = 'user' | 'assistant';

export interface Attachment {
  id: string;
  url: string; // Data URL or base64
  mimeType: string;
  name: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  attachments?: Attachment[];
  groundingSources?: GroundingSource[];
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
  latencyMs?: number;
  wordCount?: number;
}

export interface ChatConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  personaId: string;
  model: string;
  systemInstruction?: string;
  enableSearchGrounding: boolean;
  isPinned?: boolean;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon identifier
  systemPrompt: string;
  suggestedPrompts: string[];
  badge: string;
  temperature: number;
  category: 'General' | 'Coding' | 'Health' | 'Legal' | 'Writing' | 'Data' | 'Math' | 'Custom';
}

export type ModelProvider = 'claude' | 'chatgpt' | 'gemini';

export interface ModelOption {
  id: string;
  name: string;
  provider: ModelProvider;
  description: string;
  badge: string;
  isPro?: boolean;
  speed?: string;
  reasoning?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
