import React from 'react';
import { X, Settings, Sun, Moon, Monitor, Trash2, Check, Zap } from 'lucide-react';
import { AppSettings } from '../lib/storage';
import { ThemeMode } from '../types/chat';
import { MODEL_OPTIONS } from '../lib/models';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  theme: ThemeMode;
  onChangeTheme: (theme: ThemeMode) => void;
  onClearAllData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  theme,
  onChangeTheme,
  onClearAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/10 dark:border-amber-500/15">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-amber-50">Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 bg-white dark:bg-[#12110e]">
          {/* Theme Selector */}
          <div>
            <label className="block text-xs font-bold text-amber-900/70 dark:text-amber-400/80 mb-2 uppercase tracking-wider">
              Color Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => onChangeTheme('light')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Light</span>
              </button>

              <button
                onClick={() => onChangeTheme('dark')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  theme === 'dark'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Moon className="w-4 h-4 text-amber-400" />
                <span>Dark</span>
              </button>

              <button
                onClick={() => onChangeTheme('system')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                  theme === 'system'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Default Model */}
          <div>
            <label className="block text-xs font-bold text-amber-900/70 dark:text-amber-400/80 mb-2 uppercase tracking-wider">
              Default Model
            </label>
            <select
              value={settings.defaultModel}
              onChange={(e) =>
                onUpdateSettings({ ...settings, defaultModel: e.target.value })
              }
              className="w-full px-3 py-2.5 text-xs font-medium rounded-xl bg-zinc-50 dark:bg-[#181714] border border-amber-900/15 dark:border-amber-500/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
            >
              {MODEL_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} - {m.badge}
                </option>
              ))}
            </select>
          </div>

          {/* AgentRouter API Key Input */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-amber-900/70 dark:text-amber-400/80 mb-1 uppercase tracking-wider">
              AgentRouter API Key
            </label>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mb-2">
              Required for Claude 4.8 / 5.0 and ChatGPT 5.6 models. You can set it here or in server environment variables.
            </p>
            <input
              type="password"
              placeholder="sk-agentrouter-..."
              value={settings.agentRouterApiKey || ''}
              onChange={(e) =>
                onUpdateSettings({ ...settings, agentRouterApiKey: e.target.value })
              }
              className="w-full px-3 py-2.5 text-xs rounded-xl bg-zinc-50 dark:bg-[#181714] border border-amber-900/15 dark:border-amber-500/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Data Clearance */}
          <div className="pt-4 border-t border-amber-900/10 dark:border-amber-500/15">
            <label className="block text-xs font-bold text-red-600 dark:text-red-400 mb-1 uppercase tracking-wider">
              Danger Zone
            </label>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
              Clear all saved conversations and reset local preferences.
            </p>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete all conversations?')) {
                  onClearAllData();
                  onClose();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Storage Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
