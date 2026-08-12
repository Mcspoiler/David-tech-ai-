import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Square,
  Image as ImageIcon,
  X,
  Mic,
  MicOff,
  Sparkles,
  Paperclip,
} from 'lucide-react';
import { Attachment, Persona } from '../types/chat';

interface ChatInputProps {
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  isStreaming: boolean;
  onStopStreaming: () => void;
  activePersona: Persona;
  onOpenPersonaModal: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isStreaming,
  onStopStreaming,
  activePersona,
  onOpenPersonaModal,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

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
    <div className="sticky bottom-0 z-10 p-3 md:p-4 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-zinc-950 dark:via-zinc-950/90 dark:to-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Attachment Previews */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            {attachments.map((att) => (
              <div key={att.id} className="relative group rounded-lg overflow-hidden border border-zinc-300 dark:border-zinc-700 w-16 h-16">
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
          className="relative rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 shadow-lg shadow-zinc-200/50 dark:shadow-none focus-within:border-indigo-500 dark:focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all overflow-hidden"
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask ${activePersona.name}... (Shift+Enter for new line)`}
            rows={1}
            className="w-full px-4 pt-3.5 pb-12 text-sm bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none leading-relaxed max-h-48"
          />

          {/* Bottom Bar inside Input Box */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
            {/* Left Controls: Persona Tag & File Attachment */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onOpenPersonaModal}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                title="Change Persona"
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span className="truncate max-w-[120px]">{activePersona.name}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
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

              <button
                type="button"
                onClick={toggleSpeechRecognition}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                title={isListening ? 'Stop Listening' : 'Voice Input'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>

            {/* Right Controls: Character count & Send/Stop Button */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
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
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </form>

        <p className="text-[11px] text-center text-zinc-400 dark:text-zinc-500 mt-2">
          AI Assistant can make mistakes. Verify important factual details.
        </p>
      </div>
    </div>
  );
};
