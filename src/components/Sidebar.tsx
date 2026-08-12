import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Search,
  Trash2,
  Edit2,
  Pin,
  Check,
  X,
  Sparkles,
  Bot,
  User,
  SlidersHorizontal,
  FolderDown,
  Trash,
} from 'lucide-react';
import { ChatConversation, Persona } from '../types/chat';
import { PRESET_PERSONAS } from '../lib/personas';

interface SidebarProps {
  conversations: ChatConversation[];
  activeId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePinChat: (id: string) => void;
  onClearAllChats: () => void;
  activePersona: Persona;
  onSelectPersona: (persona: Persona) => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  onOpenPersonaModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePinChat,
  onClearAllChats,
  activePersona,
  onSelectPersona,
  isOpen,
  onCloseMobile,
  onOpenPersonaModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  // Group conversations by time frame
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [conversations, searchTerm]);

  const grouped = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    const pinned: ChatConversation[] = [];
    const today: ChatConversation[] = [];
    const yesterday: ChatConversation[] = [];
    const previousWeek: ChatConversation[] = [];
    const older: ChatConversation[] = [];

    filteredConversations.forEach((c) => {
      if (c.isPinned) {
        pinned.push(c);
        return;
      }
      if (c.updatedAt >= todayStart) {
        today.push(c);
      } else if (c.updatedAt >= yesterdayStart) {
        yesterday.push(c);
      } else if (c.updatedAt >= weekStart) {
        previousWeek.push(c);
      } else {
        older.push(c);
      }
    });

    return { pinned, today, yesterday, previousWeek, older };
  }, [filteredConversations]);

  const handleStartEdit = (c: ChatConversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveEdit = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderGroup = (title: string, list: ChatConversation[]) => {
    if (list.length === 0) return null;
    return (
      <div className="mb-4">
        <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          {title}
        </div>
        <div className="space-y-0.5 mt-1">
          {list.map((c) => {
            const isActive = c.id === activeId;
            const isEditing = c.id === editingId;

            return (
              <div
                key={c.id}
                onClick={() => {
                  onSelectChat(c.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold shadow-xs'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-indigo-600 dark:text-indigo-400'
                        : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300'
                    }`}
                  />

                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveEdit(c.id, e)} className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="w-full px-2 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-indigo-500 rounded text-zinc-900 dark:text-zinc-100 outline-none"
                      />
                      <button
                        type="submit"
                        onClick={(e) => handleSaveEdit(c.id, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-zinc-400 hover:bg-zinc-100 rounded"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="truncate">{c.title || 'Untitled Chat'}</span>
                  )}
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePinChat(c.id);
                      }}
                      className={`p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 ${
                        c.isPinned ? 'text-amber-500' : 'text-zinc-400'
                      }`}
                      title={c.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleStartEdit(c, e)}
                      className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
                      title="Rename Title"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(c.id);
                      }}
                      className="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded"
                      title="Delete Chat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-zinc-50 dark:bg-zinc-950 border-r border-zinc-200/80 dark:border-zinc-800/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3 border-b border-zinc-200/60 dark:border-zinc-800/60 space-y-2">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Scrollable Conversation History */}
        <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-zinc-300 dark:text-zinc-700 mb-2" />
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                No chat history yet
              </p>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-1">
                Start a new conversation above!
              </p>
            </div>
          ) : (
            <>
              {renderGroup('Pinned', grouped.pinned)}
              {renderGroup('Today', grouped.today)}
              {renderGroup('Yesterday', grouped.yesterday)}
              {renderGroup('Previous 7 Days', grouped.previousWeek)}
              {renderGroup('Older', grouped.older)}
            </>
          )}
        </div>

        {/* Persona Switcher Quick Section */}
        <div className="p-3 border-t border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-900/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
              Active Persona
            </span>
            <button
              onClick={onOpenPersonaModal}
              className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div
            onClick={onOpenPersonaModal}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate">{activePersona.name}</div>
              <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {activePersona.badge}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        {conversations.length > 0 && (
          <div className="p-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="px-2">{conversations.length} chats</span>
            <button
              onClick={onClearAllChats}
              className="flex items-center gap-1 px-2 py-1 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Clear all conversation history"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear history</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
