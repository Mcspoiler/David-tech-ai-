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
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-4 bg-white/95 dark:bg-[#0f0e0c]/95 backdrop-blur-md border-b border-amber-900/10 dark:border-amber-500/15 transition-colors">
      {/* Left section: Sidebar toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
          title="Toggle Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 border border-amber-300/40">
            <Sparkles className="w-5 h-5 animate-gold-shimmer fill-amber-950/20" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-amber-50 leading-none flex items-center gap-1.5">
              <span>Lumina AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-semibold uppercase tracking-wider">
                Gold
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              {selectedModelObj.badge} Active
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Model & Persona Selectors */}
      <div className="flex items-center gap-2 max-w-md">
        {/* Model Selector Dropdown */}
        <div className="relative group">
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-zinc-900 dark:text-amber-100 text-xs font-semibold transition-all border border-amber-200/70 dark:border-amber-500/30 cursor-pointer shadow-xs"
            title="Switch AI Model"
          >
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span className="truncate max-w-[100px] sm:max-w-[130px]">{selectedModelObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-80" />
          </button>

          <div className="absolute top-full left-0 mt-1.5 w-68 p-1.5 bg-white dark:bg-[#151411] border border-amber-200/80 dark:border-amber-500/30 rounded-2xl shadow-xl dark:shadow-2xl opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all duration-150 z-50">
            <div className="px-2.5 py-1.5 text-[10px] font-bold tracking-wider text-amber-700/80 dark:text-amber-400/80 uppercase">
              Select AI Model
            </div>
            <div className="space-y-0.5 max-h-72 overflow-y-auto custom-scrollbar">
              {MODEL_OPTIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onSelectModel(m.id)}
                  className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-start gap-2.5 ${
                    m.id === currentModel
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 font-semibold border border-amber-300/80 dark:border-amber-700/80'
                      : 'hover:bg-amber-50/50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                  }`}
                >
                  <div className="mt-0.5">
                    <Bot className={`w-4 h-4 ${m.id === currentModel ? 'text-amber-600 dark:text-amber-400' : 'text-zinc-400'}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 font-medium">
                      <span className="truncate">{m.name}</span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                        m.isPro
                          ? 'bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
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
        </div>

        {/* Persona Selector Button */}
        <button
          onClick={onOpenPersonaModal}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200/80 dark:border-zinc-700/60 cursor-pointer"
          title="Change System Persona"
        >
          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800/60">
            {activePersona.badge}
          </span>
          <span className="truncate max-w-[120px]">{activePersona.name}</span>
        </button>

        {/* Search Grounding Toggle */}
        <button
          onClick={onToggleSearchGrounding}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            enableSearchGrounding
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80 shadow-xs'
              : 'bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/60 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          title={enableSearchGrounding ? 'Google Web Search Grounding Active' : 'Enable Google Web Search Grounding'}
        >
          <Globe className={`w-3.5 h-3.5 ${enableSearchGrounding ? 'text-amber-600 dark:text-amber-400 animate-spin-slow' : ''}`} />
          <span className="hidden lg:inline text-xs">Web Search</span>
        </button>
      </div>

      {/* Right section: New Chat, Export, Settings, Theme */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-zinc-950 text-xs font-bold shadow-sm shadow-amber-500/30 border border-amber-300/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          title="New Chat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">New Chat</span>
        </button>

        <button
          onClick={onOpenExportModal}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer"
          title="Export Conversation"
          aria-label="Export Conversation"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer"
          title="Settings"
          aria-label="App Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={onToggleTheme}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Color Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
        </button>
      </div>
    </header>
  );
};
