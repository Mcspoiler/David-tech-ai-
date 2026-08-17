import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Code2,
  HeartPulse,
  Scale,
  Feather,
  BarChart3,
  Sliders,
  Check,
  Plus,
  Calculator,
} from 'lucide-react';
import { Persona } from '../types/chat';
import { PRESET_PERSONAS } from '../lib/personas';

interface PersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  activePersona: Persona;
  onSelectPersona: (persona: Persona) => void;
}

export const PersonaModal: React.FC<PersonaModalProps> = ({
  isOpen,
  onClose,
  activePersona,
  onSelectPersona,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [customTemp, setCustomTemp] = useState(0.7);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-emerald-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-5 h-5 text-rose-500" />;
      case 'Scale':
        return <Scale className="w-5 h-5 text-amber-500" />;
      case 'Feather':
        return <Feather className="w-5 h-5 text-purple-500" />;
      case 'BarChart3':
        return <BarChart3 className="w-5 h-5 text-blue-500" />;
      case 'Calculator':
        return <Calculator className="w-5 h-5 text-amber-500" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-500" />;
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customPrompt.trim()) return;

    const customPersona: Persona = {
      id: `custom_${Date.now()}`,
      name: customName.trim(),
      description: 'User defined custom system persona',
      icon: 'Sliders',
      badge: 'Custom Persona',
      category: 'Custom',
      temperature: customTemp,
      systemPrompt: customPrompt.trim(),
      suggestedPrompts: [
        `Help me accomplish my goals as ${customName.trim()}.`,
        `What are your key capabilities?`,
      ],
    };

    onSelectPersona(customPersona);
    setIsCustomMode(false);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/10 dark:border-amber-500/15">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-amber-50">
              {isCustomMode ? 'Create Custom Persona' : 'Select AI Persona'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-500 hover:text-amber-900 dark:hover:text-amber-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 rounded-lg transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
            title="Exit Persona Selection (Esc)"
          >
            <X className="w-4 h-4" />
            <span>Exit</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white dark:bg-[#12110e]">
          {!isCustomMode ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PRESET_PERSONAS.map((persona) => {
                  const isSelected = persona.id === activePersona.id;

                  return (
                    <div
                      key={persona.id}
                      onClick={() => {
                        onSelectPersona(persona);
                        onClose();
                      }}
                      className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-500 shadow-sm shadow-amber-500/10'
                          : 'bg-zinc-50/50 dark:bg-[#181714] border-amber-900/10 dark:border-amber-500/15 hover:border-amber-400 dark:hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-white dark:bg-[#1f1e1a] shadow-xs border border-amber-900/10 dark:border-amber-500/20">
                            {getIcon(persona.icon)}
                          </div>
                          <div>
                            <h3 className="text-xs font-bold text-zinc-900 dark:text-amber-50">
                              {persona.name}
                            </h3>
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 mt-0.5 border border-amber-200 dark:border-amber-800/60">
                              {persona.badge}
                            </span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 flex items-center justify-center font-bold">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {persona.description}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Button to enter custom mode */}
              <button
                onClick={() => setIsCustomMode(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-900/20 dark:border-amber-500/30 hover:border-amber-500 dark:hover:border-amber-400 text-amber-800 dark:text-amber-300 font-semibold text-xs transition-colors cursor-pointer mt-2 bg-amber-50/40 dark:bg-amber-950/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Custom Persona</span>
              </button>
            </>
          ) : (
            <form onSubmit={handleCreateCustom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-900/80 dark:text-amber-400/80 mb-1">
                  Persona Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Financial Advisor, Startup Mentor"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-[#181714] border border-amber-900/15 dark:border-amber-500/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-900/80 dark:text-amber-400/80 mb-1">
                  System Instructions (Prompt)
                </label>
                <textarea
                  rows={4}
                  placeholder="Define how the AI should behave, its tone, expert background, constraints, etc."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  required
                  className="w-full p-3 text-xs rounded-xl bg-zinc-50 dark:bg-[#181714] border border-amber-900/15 dark:border-amber-500/20 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  <span>Temperature (Creativity)</span>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{customTemp}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={customTemp}
                  onChange={(e) => setCustomTemp(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                  <span>Focused & Exact (0.0)</span>
                  <span>Creative & Broad (1.0)</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="px-4 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Back to Presets
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-xl shadow-xs transition-all cursor-pointer hover:from-amber-600 hover:to-amber-700"
                >
                  Save Persona
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {!isCustomMode && (
          <div className="flex items-center justify-between px-6 py-3 bg-zinc-50 dark:bg-[#151411] border-t border-amber-900/10 dark:border-amber-500/15">
            <span className="text-[11px] text-zinc-500">
              Active: <strong className="text-amber-700 dark:text-amber-300">{activePersona.name}</strong>
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer border border-zinc-200 dark:border-zinc-700"
            >
              Exit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
