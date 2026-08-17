import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { ChatInput } from './components/ChatInput';
import { PersonaModal } from './components/PersonaModal';
import { SettingsModal } from './components/SettingsModal';
import { ExportModal } from './components/ExportModal';
import { AuthModal } from './components/AuthModal';

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
import {
  supabase,
  EDGE_FUNCTION_URL,
  HYPER_SERVICE_FUNCTION_URL,
  SUPABASE_ANON_KEY,
} from './lib/supabase';
import {
  fetchUserConversations,
  upsertConversationDb,
  saveMessageDb,
  deleteConversationDb,
  clearAllConversationsDb,
} from './lib/supabaseDb';
import { User, Session } from '@supabase/supabase-js';

export default function App() {
  // Load initial settings & state
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [conversations, setConversations] = useState<ChatConversation[]>(getStoredConversations);
  const [activeId, setActiveId] = useState<string | null>(getStoredActiveId);

  // Supabase Auth State
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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

  // Initialize Supabase Auth & Listen for changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // When user logs in, load cloud conversations from Supabase
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    fetchUserConversations(user.id).then((cloudConvs) => {
      if (!isMounted) return;
      if (cloudConvs.length > 0) {
        // Merge cloud with local, avoiding duplicates
        setConversations((prev) => {
          const map = new Map<string, ChatConversation>();
          // Put cloud conversations first
          cloudConvs.forEach((c) => map.set(c.id, c));
          // Put remaining local ones that aren't cloud
          prev.forEach((c) => {
            if (!map.has(c.id)) map.set(c.id, c);
          });
          return Array.from(map.values());
        });
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Sync dark class on documentElement
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (systemDark) root.classList.add('dark');
      else root.classList.remove('dark');
    }
    saveStoredTheme(theme);
  }, [theme]);

  // Sync state to localStorage for offline cache
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

    // Save to DB if authenticated
    if (user) {
      upsertConversationDb(newChat, user.id);
    }

    return newChat;
  }, [activePersona, currentModel, enableSearchGrounding, user]);

  // Handle New Chat Click
  const handleNewChat = () => {
    if (isStreaming) handleStopStreaming();
    createNewChat();
  };

  // Exit Chat / Return to Home Dashboard
  const handleExitChat = () => {
    if (isStreaming) handleStopStreaming();
    setActiveId(null);
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
    if (user) {
      deleteConversationDb(id, user.id);
    }
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename Chat Title
  const handleRenameChat = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, title: newTitle, updatedAt: Date.now() };
          if (user) upsertConversationDb(updated, user.id);
          return updated;
        }
        return c;
      })
    );
  };

  // Pin Chat
  const handleTogglePinChat = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, isPinned: !c.isPinned };
          if (user) upsertConversationDb(updated, user.id);
          return updated;
        }
        return c;
      })
    );
  };

  // Clear All History
  const handleClearAllChats = () => {
    if (confirm('Are you sure you want to clear all conversation history?')) {
      setConversations([]);
      setActiveId(null);
      if (user) {
        clearAllConversationsDb(user.id);
      }
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

  // Generate Title for chat
  const generateTitleForChat = (chatId: string, firstPrompt: string) => {
    try {
      const cleanPrompt = firstPrompt
        .replace(/```[\s\S]*?```/g, '')
        .replace(/[#*_`\n\r]/g, ' ')
        .trim();
      const words = cleanPrompt.split(/\s+/).filter(Boolean).slice(0, 5);
      if (words.length > 0) {
        let title = words.join(' ');
        if (title.length > 32) title = title.substring(0, 32) + '...';
        title = title.charAt(0).toUpperCase() + title.slice(1);
        handleRenameChat(chatId, title);
      }
    } catch (e) {
      console.error('Failed to generate title', e);
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Main Send Message Handler
  const handleSendMessage = async (userText: string, attachments?: Attachment[]) => {
    // Ensure user is authenticated
    const {
      data: { session: currentSession },
    } = await supabase.auth.getSession();

    if (!currentSession) {
      alert('Please log in first to chat and use AI models.');
      setIsAuthModalOpen(true);
      return;
    }

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

    // Save user message to DB in background
    if (user || currentSession.user) {
      saveMessageDb(targetChatId, userMsg, currentSession.user.id, currentModel);
    }

    setIsStreaming(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Format messages clean for the AI Edge Function / AgentRouter
      const messagesPayload = updatedMessages.slice(0, -1).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(EDGE_FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentSession.access_token}`,
          apikey: SUPABASE_ANON_KEY,
          Accept: 'application/json, text/event-stream, text/plain, */*',
        },
        body: JSON.stringify({
          messages: messagesPayload,
          model: currentModel || 'claude-5.0',
          conversationId: targetChatId,
          personaId: activePersona.id,
          prompt: userText,
          systemInstruction: activePersona.systemPrompt,
          enableSearchGrounding,
          temperature: activePersona.temperature,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        let errDetail = `HTTP ${response.status}`;
        try {
          const errJson = await response.json();
          errDetail = errJson.error || errJson.message || errDetail;
        } catch {
          // ignore
        }
        throw new Error(`Edge function error: ${errDetail}`);
      }

      let accumulatedContent = '';
      let groundingSources: any[] = [];
      const contentType = response.headers.get('content-type') || '';

      // Non-streaming JSON response support
      if (contentType.includes('application/json') && !contentType.includes('event-stream')) {
        const json = await response.json();
        accumulatedContent =
          json.response ||
          json.content ||
          json.text ||
          json.message?.content ||
          json.output ||
          (typeof json === 'string' ? json : JSON.stringify(json, null, 2));

        if (json.groundingSources && Array.isArray(json.groundingSources)) {
          groundingSources = json.groundingSources;
        }
      } else {
        // Stream reader (handles SSE streams and chunked text)
        const reader = response.body?.getReader();
        const decoder = new TextDecoder('utf-8');

        if (!reader) {
          throw new Error('Response stream reader is unavailable');
        }

        let buffer = '';
        let streamError: string | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunkText = decoder.decode(value, { stream: true });
          buffer += chunkText;

          if (buffer.includes('data:')) {
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
                } else if (data.content) {
                  accumulatedContent += data.content;
                } else if (data.text) {
                  accumulatedContent += data.text;
                } else if (data.choices?.[0]?.delta?.content) {
                  accumulatedContent += data.choices[0].delta.content;
                }

                if (data.groundingSources && Array.isArray(data.groundingSources)) {
                  groundingSources = data.groundingSources;
                }
              } catch {
                if (dataStr && dataStr !== '[DONE]') {
                  accumulatedContent += dataStr;
                }
              }
            }
          } else {
            // Raw text streaming
            accumulatedContent += chunkText;
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

          if (streamError) {
            throw new Error(streamError);
          }
        }

        if (streamError) {
          throw new Error(streamError);
        }
      }

      // Complete message state
      const endTime = Date.now();
      const latency = endTime - startTime;
      const wordCount = accumulatedContent.trim().split(/\s+/).length;

      const finalAssistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: accumulatedContent,
        timestamp: Date.now(),
        status: 'complete' as const,
        latencyMs: latency,
        wordCount,
        groundingSources,
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetChatId) return c;
          const finalMsgs = c.messages.map((m) => {
            if (m.id === assistantMsgId) {
              return finalAssistantMsg;
            }
            return m;
          });
          const updatedChat = { ...c, messages: finalMsgs, updatedAt: Date.now() };
          if (user) {
            upsertConversationDb(updatedChat, user.id);
            saveMessageDb(targetChatId, finalAssistantMsg, user.id, currentModel);
          }
          return updatedChat;
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
                  error: err.message || 'Failed to communicate with Supabase edge function.',
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
        prev.map((c) => {
          if (c.id === activeId) {
            const updated = { ...c, model: modelId, updatedAt: Date.now() };
            if (user) upsertConversationDb(updated, user.id);
            return updated;
          }
          return c;
        })
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
        userEmail={user?.email}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSignOut={handleSignOut}
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
          hasActiveChat={Boolean(activeChat && activeChat.messages.length > 0)}
          onExitChat={handleExitChat}
          userEmail={user?.email}
          onOpenAuth={() => setIsAuthModalOpen(true)}
          onSignOut={handleSignOut}
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
          onExitChat={handleExitChat}
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
          if (user) clearAllConversationsDb(user.id);
        }}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        activeChat={activeChat}
        onImportChat={(imported) => {
          setConversations((prev) => [imported, ...prev]);
          setActiveId(imported.id);
          if (user) upsertConversationDb(imported, user.id);
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
