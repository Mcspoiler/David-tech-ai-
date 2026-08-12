import { ChatConversation, ChatMessage, ThemeMode } from '../types/chat';

const STORAGE_KEYS = {
  CONVERSATIONS: 'aistudio_chat_conversations',
  ACTIVE_ID: 'aistudio_chat_active_id',
  THEME: 'aistudio_chat_theme',
  SETTINGS: 'aistudio_chat_settings',
};

export interface AppSettings {
  defaultModel: string;
  defaultPersonaId: string;
  enableSearchGrounding: boolean;
  fontSize: 'sm' | 'base' | 'lg';
  streamSpeed: 'fast' | 'normal';
}

export const DEFAULT_SETTINGS: AppSettings = {
  defaultModel: 'gemini-3.6-flash',
  defaultPersonaId: 'general',
  enableSearchGrounding: false,
  fontSize: 'base',
  streamSpeed: 'fast',
};

export function getStoredConversations(): ChatConversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse conversations from localStorage', e);
    return [];
  }
}

export function saveConversations(conversations: ChatConversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage', e);
  }
}

export function getStoredActiveId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_ID);
  } catch (e) {
    return null;
  }
}

export function saveStoredActiveId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_ID);
    }
  } catch (e) {
    console.error('Failed to save active chat ID', e);
  }
}

export function getStoredTheme(): ThemeMode {
  try {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeMode;
    if (theme === 'light' || theme === 'dark' || theme === 'system') {
      return theme;
    }
    return 'dark';
  } catch (e) {
    return 'dark';
  }
}

export function saveStoredTheme(theme: ThemeMode): void {
  try {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  } catch (e) {
    console.error('Failed to save theme', e);
  }
}

export function getStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function exportChatToMarkdown(chat: ChatConversation): string {
  let md = `# ${chat.title}\n`;
  md += `*Created: ${new Date(chat.createdAt).toLocaleString()}*\n`;
  md += `*Model: ${chat.model}*\n\n`;
  md += `---\n\n`;

  chat.messages.forEach((msg) => {
    const roleTitle = msg.role === 'user' ? '👤 **User**' : '🤖 **AI Assistant**';
    md += `### ${roleTitle}\n*${new Date(msg.timestamp).toLocaleTimeString()}*\n\n${msg.content}\n\n`;
    if (msg.groundingSources && msg.groundingSources.length > 0) {
      md += `\n**Sources & Grounding:**\n`;
      msg.groundingSources.forEach((src) => {
        md += `- [${src.title || src.uri}](${src.uri})\n`;
      });
      md += `\n`;
    }
    md += `---\n\n`;
  });

  return md;
}

export function exportChatToJSON(chat: ChatConversation): string {
  return JSON.stringify(chat, null, 2);
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
