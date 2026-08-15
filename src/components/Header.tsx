import React, { useState } from 'react';
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
  Check,
} from 'lucide-react';
import { MODEL_OPTIONS, PROVIDER_META } from '../lib/models';
import { ModelProvider, Persona, ThemeMode } from '../types/chat';

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterProvider, setFilterProvider] = useState<'all' | ModelProvider>('all');

  const selectedModelObj =
    MODEL_OPTIONS.find((m) => m.id === currentModel) || MODEL_OPTIONS[0];

  const filteredModels =
    filterProvider === 'all'
      ? MODEL_OPTIONS
      : MODEL_OPTIONS.filter((m) => m.provider === filterProvider);

  // Quick switch to top model for provider
  const handleQuickProviderSwitch = (provider: ModelProvider) => {
    const targetModel = PROVIDER_META[provider].defaultModel;
    onSelectModel(targetModel);
  };

  const getProviderIcon = (provider: ModelProvider) => {
    switch (provider) {
      case 'claude':
        return <span className="w-2 h-2 rounded-full bg-amber-500 shadow-xs shadow-amber-500/50" />;
      case 'chatgpt':
        return <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500/50" />;
      case 'gemini':
        return <span className="w-2 h-2 rounded-full bg-blue-500 shadow-xs shadow-blue-500/50" />;
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between h-16 px-3 sm:px-4 bg-white/95 dark:bg-[#0f0e0c]/95 backdrop-blur-md border-b border-amber-900/10 dark:border-amber-500/15 transition-colors">
      {/* Left section: Sidebar toggle & Brand */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
          title="Toggle Sidebar"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 border border-amber-300/40 shrink-0">
            <Sparkles className="w-5 h-5 animate-gold-shimmer fill-amber-950/20" />
          </div>
          <div className="hidden lg:block">
            <h1 className="text-sm font-bold text-zinc-900 dark:text-amber-50 leading-none flex items-center gap-1.5">
              <span>Lumina AI</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 font-semibold uppercase tracking-wider">
                Gold
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block animate-pulse"></span>
              {selectedModelObj.name}
            </p>
          </div>
        </div>
      </div>

      {/* Middle section: Quick Claude/ChatGPT/Gemini Toggle & Model Dropdown */}
      <div className="flex items-center gap-2">
        {/* Quick Engine Switcher Pills: Claude vs ChatGPT */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-zinc-100/90 dark:bg-[#161512] border border-amber-900/15 dark:border-amber-500/20 shadow-xs">
          <button
            onClick={() => handleQuickProviderSwitch('claude')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedModelObj.provider === 'claude'
                ? 'bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/20 scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-300'
            }`}
            title="Switch to Claude (Anthropic)"
          >
            <span className={`w-2 h-2 rounded-full ${selectedModelObj.provider === 'claude' ? 'bg-zinc-950' : 'bg-amber-500'}`} />
            <span>Claude</span>
          </button>

          <button
            onClick={() => handleQuickProviderSwitch('chatgpt')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedModelObj.provider === 'chatgpt'
                ? 'bg-emerald-500 text-zinc-950 shadow-sm shadow-emerald-500/20 scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-300'
            }`}
            title="Switch to ChatGPT (OpenAI)"
          >
            <span className={`w-2 h-2 rounded-full ${selectedModelObj.provider === 'chatgpt' ? 'bg-zinc-950' : 'bg-emerald-500'}`} />
            <span>ChatGPT</span>
          </button>

          <button
            onClick={() => handleQuickProviderSwitch('gemini')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              selectedModelObj.provider === 'gemini'
                ? 'bg-blue-500 text-white shadow-sm shadow-blue-500/20 scale-[1.02]'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-300'
            }`}
            title="Switch to Gemini (Google)"
          >
            <span className={`w-2 h-2 rounded-full ${selectedModelObj.provider === 'gemini' ? 'bg-white' : 'bg-blue-500'}`} />
            <span>Gemini</span>
          </button>
        </div>

        {/* Detailed Model Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 hover:bg-amber-100/80 dark:hover:bg-amber-900/50 text-zinc-900 dark:text-amber-100 text-xs font-semibold transition-all border border-amber-200/80 dark:border-amber-500/30 cursor-pointer shadow-xs"
            title="Change Specific Model"
          >
            {getProviderIcon(selectedModelObj.provider)}
            <span className="truncate max-w-[100px] sm:max-w-[120px]">{selectedModelObj.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 opacity-80" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute top-full left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 mt-2 w-80 sm:w-96 p-2 bg-white dark:bg-[#151411] border border-amber-200/90 dark:border-amber-500/30 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
                {/* Header & Tabs */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-amber-900/10 dark:border-amber-500/15">
                  <span className="text-[11px] font-bold tracking-wider text-amber-800 dark:text-amber-400 uppercase">
                    Choose AI Model
                  </span>
                  {/* Filter Tabs */}
                  <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-[10px]">
                    {(['all', 'claude', 'chatgpt', 'gemini'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setFilterProvider(tab)}
                        className={`px-2 py-0.5 rounded capitalize font-medium transition-colors cursor-pointer ${
                          filterProvider === tab
                            ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                        }`}
                      >
                        {tab === 'chatgpt' ? 'ChatGPT' : tab}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Model List */}
                <div className="space-y-1 max-h-80 overflow-y-auto custom-scrollbar pt-2 pr-1">
                  {filteredModels.map((m) => {
                    const isSelected = m.id === currentModel;
                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          onSelectModel(m.id);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-100 font-semibold border border-amber-300 dark:border-amber-500/60 shadow-xs'
                            : 'hover:bg-amber-50/50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          <Bot
                            className={`w-4 h-4 ${
                              isSelected
                                ? 'text-amber-600 dark:text-amber-400'
                                : 'text-zinc-400'
                            }`}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 truncate">
                              {m.name}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {m.speed && (
                                <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-mono hidden sm:inline">
                                  {m.speed}
                                </span>
                              )}
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                  m.provider === 'claude'
                                    ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60'
                                    : m.provider === 'chatgpt'
                                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60'
                                    : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-300/60 dark:border-blue-700/60'
                                }`}
                              >
                                {m.badge}
                              </span>
                              {isSelected && (
                                <Check className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />
                              )}
                            </div>
                          </div>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                            {m.description}
                          </p>
                          {m.reasoning && (
                            <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-700/80 dark:text-amber-400/80 font-medium">
                              <span>Reasoning: {m.reasoning}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Persona Selector Button */}
        <button
          onClick={onOpenPersonaModal}
          className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors border border-zinc-200/80 dark:border-zinc-700/60 cursor-pointer"
          title="Change System Persona"
        >
          <span className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200 dark:border-amber-800/60">
            {activePersona.badge}
          </span>
          <span className="truncate max-w-[110px]">{activePersona.name}</span>
        </button>

        {/* Search Grounding Toggle */}
        <button
          onClick={onToggleSearchGrounding}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
            enableSearchGrounding
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800/80 shadow-xs'
              : 'bg-zinc-100/80 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-zinc-200/80 dark:border-zinc-700/60 hover:text-zinc-800 dark:hover:text-zinc-200'
          }`}
          title={
            enableSearchGrounding
              ? 'Google Web Search Grounding Active'
              : 'Enable Google Web Search Grounding'
          }
        >
          <Globe
            className={`w-3.5 h-3.5 ${
              enableSearchGrounding ? 'text-amber-600 dark:text-amber-400 animate-spin-slow' : ''
            }`}
          />
          <span className="hidden md:inline text-xs">Search</span>
        </button>
      </div>

      {/* Right section: New Chat, Export, Settings, Theme */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-zinc-950 text-xs font-bold shadow-sm shadow-amber-500/30 border border-amber-300/60 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          title="New Chat"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden md:inline">New Chat</span>
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
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-zinc-600" />
          )}
        </button>
      </div>
    </header>
  );
};

