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
        <div className="px-3 py-1 text-[10px] font-bold text-amber-800/60 dark:text-amber-400/60 uppercase tracking-wider">
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
                    ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100 font-semibold shadow-xs border border-amber-300/80 dark:border-amber-600/40'
                    : 'hover:bg-amber-50/50 dark:hover:bg-[#181714] text-zinc-700 dark:text-zinc-300 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1 pr-1">
                  <MessageSquare
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-zinc-400 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-400'
                    }`}
                  />

                  {isEditing ? (
                    <form onSubmit={(e) => handleSaveEdit(c.id, e)} className="flex items-center gap-1 w-full">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        autoFocus
                        className="w-full px-2 py-0.5 text-xs bg-white dark:bg-zinc-900 border border-amber-500 rounded-lg text-zinc-900 dark:text-zinc-100 outline-none"
                      />
                      <button
                        type="submit"
                        onClick={(e) => handleSaveEdit(c.id, e)}
                        className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
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
                      className={`p-1 rounded hover:bg-amber-100 dark:hover:bg-amber-950/60 ${
                        c.isPinned ? 'text-amber-500' : 'text-zinc-400'
                      }`}
                      title={c.isPinned ? 'Unpin Chat' : 'Pin Chat'}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={(e) => handleStartEdit(c, e)}
                      className="p-1 text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-100 dark:hover:bg-zinc-800 rounded"
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
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#fbfaf8] dark:bg-[#0d0c0a] border-r border-amber-900/10 dark:border-amber-500/15 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & New Chat button */}
        <div className="p-3.5 border-b border-amber-900/10 dark:border-amber-500/15 space-y-2.5">
          <div className="flex items-center justify-between pb-1 md:hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">Menu & History</span>
            </div>
            <button
              onClick={onCloseMobile}
              className="p-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg cursor-pointer"
              title="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-zinc-950 font-bold text-xs shadow-sm shadow-amber-500/30 border border-amber-300/60 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>New Conversation</span>
          </button>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-amber-700/60 dark:text-amber-400/60" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white dark:bg-[#151411] border border-amber-900/15 dark:border-amber-500/20 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Scrollable Conversation History */}
        <div className="flex-1 overflow-y-auto px-2 py-3 custom-scrollbar">
          {conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <MessageSquare className="w-8 h-8 mx-auto text-amber-300/60 dark:text-amber-900/60 mb-2" />
              <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">
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
        <div className="p-3 border-t border-amber-900/10 dark:border-amber-500/15 bg-amber-50/40 dark:bg-amber-950/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-amber-800/70 dark:text-amber-400/70 uppercase tracking-wider">
              Active Persona
            </span>
            <button
              onClick={onOpenPersonaModal}
              className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
            >
              Change
            </button>
          </div>

          <div
            onClick={onOpenPersonaModal}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#151411] hover:bg-amber-50/80 dark:hover:bg-amber-950/40 border border-amber-200/70 dark:border-amber-500/20 text-zinc-800 dark:text-zinc-200 cursor-pointer transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold truncate text-zinc-900 dark:text-zinc-100">{activePersona.name}</div>
              <div className="text-[10px] text-amber-700 dark:text-amber-400 truncate">
                {activePersona.badge}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        {conversations.length > 0 && (
          <div className="p-2.5 border-t border-amber-900/10 dark:border-amber-500/15 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span className="px-2 font-medium text-[11px]">{conversations.length} conversations</span>
            <button
              onClick={onClearAllChats}
              className="flex items-center gap-1 px-2 py-1 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer text-[11px]"
              title="Clear all conversation history"
            >
              <Trash className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};
