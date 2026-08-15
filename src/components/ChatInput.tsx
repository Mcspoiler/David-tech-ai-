import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  X,
  Mic,
  MicOff,
  Sparkles,
  Paperclip,
  Zap,
  ChevronDown,
  Check,
} from 'lucide-react';
import { Attachment, ModelProvider, Persona } from '../types/chat';
import { MODEL_OPTIONS, PROVIDER_META } from '../lib/models';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  activePersona: Persona;
  onOpenPersonaModal: () => void;
  currentModel: string;
  onSelectModel: (modelId: string) => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  activePersona,
  onOpenPersonaModal,
  currentModel,
  onSelectModel,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const selectedModel = MODEL_OPTIONS.find((m) => m.id === currentModel) || MODEL_OPTIONS[0];

  // Auto resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [text]);

  // Handle Form Submit
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isStreaming) {
      onStopStreaming();
      return;
    }
    if (!text.trim() && attachments.length === 0) return;

    onSendMessage(text.trim(), attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Keyboard shortcut: Shift+Enter = newline, Enter = submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Handle File Upload (Image)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substring(2, 9),
            url,
            mimeType: file.type,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Remove attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Speech to Text (Web Speech API)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => prev + (prev ? ' ' : '') + transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    }
  };

  return (
    <div className="sticky bottom-0 z-10 p-3 md:p-4 bg-gradient-to-t from-[#faf9f5] via-[#faf9f5]/95 to-transparent dark:from-[#0c0b09] dark:via-[#0c0b09]/95 dark:to-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-white dark:bg-[#151411] border border-amber-900/15 dark:border-amber-500/20 shadow-xs">
            {attachments.map((att) => (
              <div key={att.id} className="relative group rounded-lg overflow-hidden border border-amber-300 dark:border-amber-700 w-16 h-16">
                <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(att.id)}
                  className="absolute top-1 right-1 p-0.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Input Box Container */}
        <form
          onSubmit={handleSubmit}
          className="relative rounded-2xl bg-white dark:bg-[#151411] border border-amber-900/15 dark:border-amber-500/25 shadow-lg shadow-amber-500/5 focus-within:border-amber-500 dark:focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activePersona.name} using ${selectedModel.name}... (Shift+Enter for newline)`}
            rows={1}
            className="w-full px-4 pt-3.5 pb-13 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none leading-relaxed max-h-48"
          />

          {/* Bottom Bar inside Input Box */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            {/* Left Controls: Persona Tag & Model Switcher & File Attachment */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Quick Model Selector Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                    selectedModel.provider === 'claude'
                      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800/80 hover:bg-amber-100'
                      : selectedModel.provider === 'chatgpt'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/80 hover:bg-emerald-100'
                      : 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800/80 hover:bg-blue-100'
                  }`}
                  title="Switch Model"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      selectedModel.provider === 'claude'
                        ? 'bg-amber-500'
                        : selectedModel.provider === 'chatgpt'
                        ? 'bg-emerald-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  <span className="truncate max-w-[90px] sm:max-w-[120px]">{selectedModel.name}</span>
                  <ChevronDown className="w-3 h-3 opacity-70" />
                </button>

                {/* Dropdown Popover */}
                {isModelDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsModelDropdownOpen(false)}
                    />
                    <div className="absolute bottom-full left-0 mb-2 w-72 p-1.5 bg-white dark:bg-[#151411] border border-amber-200/90 dark:border-amber-500/30 rounded-2xl shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                        Switch Model
                      </div>
                      <div className="space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                        {MODEL_OPTIONS.map((m) => {
                          const isSelected = m.id === currentModel;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                onSelectModel(m.id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected
                                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 font-bold border border-amber-300 dark:border-amber-700'
                                  : 'hover:bg-amber-50/50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    m.provider === 'claude'
                                      ? 'bg-amber-500'
                                      : m.provider === 'chatgpt'
                                      ? 'bg-emerald-500'
                                      : 'bg-blue-500'
                                  }`}
                                />
                                <span className="truncate">{m.name}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                                    m.provider === 'claude'
                                      ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                                      : m.provider === 'chatgpt'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                                      : 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                                  }`}
                                >
                                  {m.badge}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Persona Pill */}
              <button
                type="button"
                onClick={onOpenPersonaModal}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-zinc-800 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer border border-zinc-200/80 dark:border-zinc-700/60"
                title="Change Persona"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span className="truncate max-w-[100px]">{activePersona.name}</span>
              </button>

              {/* Attach File */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                title="Attach Image"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Voice input */}
              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                }`}
                title={isListening ? 'Stop Listening' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Controls: Character count & Send/Stop Button */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-mono hidden md:inline">
                {text.length} chars
              </span>

              {isStreaming ? (
                <button
                  type="button"
                  onClick={onStopStreaming}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  title="Stop generating"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                  <span>Stop</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!text.trim() && attachments.length === 0}
                  className="p-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 disabled:opacity-40 disabled:hover:from-amber-500 disabled:hover:to-amber-600 text-zinc-950 shadow-md shadow-amber-500/25 border border-amber-300/60 transition-all cursor-pointer hover:scale-105 active:scale-95"
                  title="Send message"
                >
                  <Send className="w-4 h-4 stroke-[2.5]" />
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
          AI Assistant can make mistakes. Verify critical facts and details.
        </p>
      </div>
    </div>
  );
};

