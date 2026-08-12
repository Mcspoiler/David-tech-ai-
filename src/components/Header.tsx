import React from 'react';
import {
  Sparkles,
  Plus,
  Globe,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  Settings,
  Download,
  Bot,
  Zap,
} from 'lucide-react';
import { MODEL_OPTIONS } from '../lib/models';
import { Persona, ThemeMode } from '../types/chat';

interface HeaderProps {
  currentModel: string;
  onSelectModel: (model: string) => void;
  activePersona: Persona;
  onOpenPersonaModal: () => void;
  enableSearchGrounding: boolean;
  onToggleSearchGrounding: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onNewChat: () => void;
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenExportModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentModel,
  onSelectModel,
  activePersona,
  onOpenPersonaModal,
  enableSearchGrounding,
  onToggleSearchGrounding,
  theme,
  onToggleTheme,
  onNewChat,
  onToggleSidebar,
  onOpenSettings,
  onOpenExportModal,
}) => {
  const selectedModelObj = MODEL_OPTIONS.find((m) => m.id === currentModel) || MODEL_OPTIONS[0];

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Toggle Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm shadow-indigo-500/20">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 leading-none">
              AI Assistant
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Gemini Powered
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Model & Persona Selectors */}
      <div className="flex items-center gap-2 max-w-md">
        {/* Model Selector Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer"
            title="Switch AI Model"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[100px] sm:max-w-[130px]">{selectedModelObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-60" />
          </button>

          <div className="absolute top-full left-0 mt-1 w-64 p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
            <div className="px-2 py-1 text-[11px] font-bold tracking-wider text-zinc-400 uppercase">
              Select Model
            </div>
            {MODEL_OPTIONS.map((m) => (
              <button
                key={m.id}
                onClick={() => onSelectModel(m.id)}
                className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-start gap-2 ${
                  m.id === currentModel
                    ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-semibold'
                    : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <div className="mt-0.5">
                  <Bot className={`w-4 h-4 ${m.id === currentModel ? 'text-indigo-600 dark:text-indigo-400' : 'text-zinc-400'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-medium">
                    {m.name}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {m.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-2">
                    {m.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Persona Selector Button */}
        <button
          onClick={onOpenPersonaModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200/60 dark:border-zinc-700/60 cursor-pointer"
          title="Change System Persona"
        >
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-[10px]">
            {activePersona.badge}
          </span>
          <span className="truncate max-w-[120px]">{activePersona.name}</span>
        </button>

        {/* Search Grounding Toggle */}
        <button
          onClick={onToggleSearchGrounding}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer border ${
            enableSearchGrounding
              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800/60 shadow-sm'
              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-zinc-200/60 dark:border-zinc-700/60 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          title={enableSearchGrounding ? 'Google Web Search Grounding Active' : 'Enable Google Web Search Grounding'}
        >
          <Globe className={`w-3.5 h-3.5 ${enableSearchGrounding ? 'text-blue-600 dark:text-blue-400 animate-spin-slow' : ''}`} />
          <span className="hidden lg:inline text-xs">Web Search</span>
        </button>
      </div>

      {/* Right section: New Chat, Export, Settings, Theme */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          title="New Chat"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Export Conversation"
          aria-label="Export Conversation"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title="Settings"
          aria-label="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
