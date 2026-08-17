import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { PersonaModal } from './components/PersonaModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';

import {
  ChatConversation,
  ChatMessage,
  Persona,
  ThemeMode,
  Attachment,
} from './types/chat';
import { PRESET_PERSONAS } from './lib/personas';
import { DEFAULT_MODEL } from './lib/models';
import {
  getStoredConversations,
  saveConversations,
  getStoredActiveId,
  saveStoredActiveId,
  getStoredTheme,
  saveStoredTheme,
  getStoredSettings,
  saveStoredSettings,
  AppSettings,
} from './lib/storage';

export default function App() {
  // Load initial settings & state
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [conversations, setConversations] = useState<ChatConversation[]>(getStoredConversations);
  const [activeId, setActiveId] = useState<string | null>(getStoredActiveId);

  const [activePersona, setActivePersona] = useState<Persona>(() => {
    return (
      PRESET_PERSONAS.find((p) => p.id === settings.defaultPersonaId) || PRESET_PERSONAS[0]
    );
  });
  const [currentModel, setCurrentModel] = useState<string>(settings.defaultModel || DEFAULT_MODEL);
  const [enableSearchGrounding, setEnableSearchGrounding] = useState<boolean>(
    settings.enableSearchGrounding
  );
  const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

  // UI Modals
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPersonaModalOpen, setIsPersonaModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Streaming State
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync dark class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system theme
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync state to localStorage
  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    saveStoredActiveId(activeId);
  }, [activeId]);

  // Get active conversation object
  const activeChat = conversations.find((c) => c.id === activeId) || null;

  // Create a new conversation
  const createNewChat = useCallback(() => {
    const newChat: ChatConversation = {
      id: `chat_${Date.now()}`,
      title: 'New Conversation',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      personaId: activePersona.id,
      model: currentModel,
      systemInstruction: activePersona.systemPrompt,
      enableSearchGrounding,
    };

    setConversations((prev) => [newChat, ...prev]);
    setActiveId(newChat.id);
    return newChat;
  }, [activePersona, currentModel, enableSearchGrounding]);

  // Handle New Chat Click
  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    createNewChat();
  };

  // Select Chat
  const handleSelectChat = (id: string) => {
    if (isStreaming) handleStopStreaming();
    setActiveId(id);
    const target = conversations.find((c) => c.id === id);
    if (target) {
      const matchedPersona = PRESET_PERSONAS.find((p) => p.id === target.personaId);
      if (matchedPersona) setActivePersona(matchedPersona);
      if (target.model) setCurrentModel(target.model);
    }
  };

  // Delete Chat
  const handleDeleteChat = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename Chat Title
  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Pin Chat
  const handleTogglePinChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Clear All History
  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to clear all conversation history?')) {
      setConversations([]);
      setActiveId(null);
    }
  };

  // Stop Streaming
  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
  };

  // Generate Title with AI after first message
  const generateTitleForChat = async (chatId: string, firstPrompt: string) => {
    try {
      const res = await fetch('/api/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: firstPrompt }),
      });
      const data = await res.json();
      if (data.title) {
        handleRenameChat(chatId, data.title);
      }
    } catch (e) {
      console.error('Failed to generate title', e);
    }
  };

  // Main Send Message Handler
  const handleSendMessage = async (userText: string, attachments?: Attachment[]) => {
    if (isStreaming) handleStopStreaming();

    let targetChat = activeChat;
    let targetChatId = activeId;

    if (!targetChat || !targetChatId) {
      targetChat = createNewChat();
      targetChatId = targetChat.id;
    }

    const startTime = Date.now();

    // User message
    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      content: userText,
      timestamp: startTime,
      attachments,
    };

    // Assistant placeholder
    const assistantMsgId = `msg_${Date.now()}_a`;
    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'streaming',
    };

    // Update state with user message & assistant placeholder
    const updatedMessages = [...targetChat.messages, userMsg, assistantMsg];
    const isFirstUserMessage = targetChat.messages.length === 0;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === targetChatId
          ? {
              ...c,
              messages: updatedMessages,
              updatedAt: Date.now(),
            }
          : c
      )
    );

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.slice(0, -1), // send up to user message
          model: currentModel,
          systemInstruction: activePersona.systemPrompt,
          enableSearchGrounding,
          temperature: activePersona.temperature,
          agentRouterApiKey: settings.agentRouterApiKey,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errDetail = errJson.error || errDetail;
        } catch {
          // ignore
        }
        throw new Error(`Server connection error: ${errDetail}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) {
        throw new Error('Response stream reader is unavailable');
      }

      let accumulatedContent = '';
      let groundingSources: any[] = [];
      let buffer = '';
      let streamError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const dataStr = trimmed.slice(5).trim();

          if (dataStr === '[DONE]') {
            break;
          }

          try {
            const data = JSON.parse(dataStr);

            if (data.error) {
              streamError = data.error;
              break;
            }

            if (data.chunk) {
              accumulatedContent += data.chunk;
            }

            if (data.groundingSources && Array.isArray(data.groundingSources)) {
              groundingSources = data.groundingSources;
            }

            // Update state with streamed chunk
            setConversations((prev) =>
              prev.map((c) => {
                if (c.id !== targetChatId) return c;
                const newMsgs = c.messages.map((m) => {
                  if (m.id === assistantMsgId) {
                    return {
                      ...m,
                      content: accumulatedContent,
                      groundingSources:
                        groundingSources.length > 0 ? groundingSources : m.groundingSources,
                    };
                  }
                  return m;
                });
                return { ...c, messages: newMsgs };
              })
            );
          } catch {
            // Skip unparseable lines
          }
        }

        if (streamError) {
          throw new Error(streamError);
        }
      }

      if (streamError) {
        throw new Error(streamError);
      }

      // Complete message state
      const endTime = Date.now();
      const latency = endTime - startTime;
      const wordCount = accumulatedContent.trim().split(/\s+/).length;

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetChatId) return c;
          const finalMsgs = c.messages.map((m) => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                content: accumulatedContent,
                status: 'complete' as const,
                latencyMs: latency,
                wordCount,
              };
            }
            return m;
          });
          return { ...c, messages: finalMsgs };
        })
      );

      // Auto Title generation for first prompt
      if (isFirstUserMessage && userText.length > 0) {
        generateTitleForChat(targetChatId, userText);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Stream aborted by user');
      } else {
        console.error('Chat stream error:', err);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetChatId) return c;
            const errorMsgs = c.messages.map((m) => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  status: 'error' as const,
                  error: err.message || 'Failed to communicate with AI server.',
                };
              }
              return m;
            });
            return { ...c, messages: errorMsgs };
          })
        );
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last response
  const handleRegenerate = () => {
    if (!activeChat || activeChat.messages.length === 0) return;
    const messages = activeChat.messages;
    const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const lastUserMsg = messages[lastUserIndex];
    // Remove last assistant message
    const trimmed = messages.slice(0, lastUserIndex);

    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, messages: trimmed } : c))
    );

    handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
  };

  // Edit user prompt and regenerate
  const handleEditPrompt = (newPrompt: string) => {
    if (!activeChat) return;
    const messages = activeChat.messages;
    const lastUserIndex = messages.findLastIndex((m) => m.role === 'user');
    if (lastUserIndex !== -1) {
      const trimmed = messages.slice(0, lastUserIndex);
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, messages: trimmed } : c))
      );
    }
    handleSendMessage(newPrompt);
  };

  // Handle Model Selection
  const handleSelectModel = (modelId: string) => {
    setCurrentModel(modelId);
    if (activeId) {
      setConversations((prev) =>
        prev.map((c) => (c.id === activeId ? { ...c, model: modelId, updatedAt: Date.now() } : c))
      );
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#faf9f5] dark:bg-[#0c0b09] text-zinc-900 dark:text-zinc-100 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelectChat={handleSelectChat}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onRenameChat={handleRenameChat}
        onTogglePinChat={handleTogglePinChat}
        onClearAllChats={handleClearAllChats}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
        isOpen={isSidebarOpen}
        onCloseMobile={() => setIsSidebarOpen(false)}
        onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header
          currentModel={currentModel}
          onSelectModel={handleSelectModel}
          activePersona={activePersona}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          enableSearchGrounding={enableSearchGrounding}
          onToggleSearchGrounding={() => setEnableSearchGrounding((prev) => !prev)}
          theme={theme}
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenSettings={() => setIsSettingsModalOpen(true)}
          onOpenExportModal={() => setIsExportModalOpen(true)}
        />

        <ChatArea
          chat={activeChat}
          activePersona={activePersona}
          currentModel={currentModel}
          onSelectModel={handleSelectModel}
          isStreaming={isStreaming}
          onSendMessage={handleSendMessage}
          onRegenerate={handleRegenerate}
          onEditPrompt={handleEditPrompt}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          onStopStreaming={handleStopStreaming}
          activePersona={activePersona}
          onOpenPersonaModal={() => setIsPersonaModalOpen(true)}
          currentModel={currentModel}
          onSelectModel={handleSelectModel}
        />
      </div>

      {/* Dialog Modals */}
      <PersonaModal
        isOpen={isPersonaModalOpen}
        onClose={() => setIsPersonaModalOpen(false)}
        activePersona={activePersona}
        onSelectPersona={setActivePersona}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={(s) => {
          setSettings(s);
          saveStoredSettings(s);
        }}
        theme={theme}
        onChangeTheme={setTheme}
        onClearAllData={() => {
          setConversations([]);
          setActiveId(null);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeChat={activeChat}
        onImportChat={(imported) => {
          setConversations((prev) => [imported, ...prev]);
          setActiveId(imported.id);
        }}
      />
    </div>
  );
}
