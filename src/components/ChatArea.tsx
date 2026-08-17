import React, { useRef, useEffect, useState } from 'react';
import {
  Sparkles,
  ArrowDown,
  Globe,
  Zap,
  Code2,
  HeartPulse,
  Scale,
  Feather,
  BarChart3,
  Lightbulb,
  Bot,
  CheckCircle2,
  Calculator,
  ArrowLeft,
  LogOut,
  X,
} from 'lucide-react';
import { ChatConversation, Persona } from '../types/chat';
import { ChatMessageItem } from './ChatMessageItem';
import { MODEL_OPTIONS, PROVIDER_META } from '../lib/models';

interface ChatAreaProps {
  chat: ChatConversation | null;
  activePersona: Persona;
  currentModel: string;
  onSelectModel: (modelId: string) => void;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
  onEditPrompt: (newPrompt: string) => void;
  onOpenPersonaModal: () => void;
  onExitChat?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  activePersona,
  currentModel,
  onSelectModel,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onEditPrompt,
  onOpenPersonaModal,
  onExitChat,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const selectedModelObj =
    MODEL_OPTIONS.find((m) => m.id === currentModel) || MODEL_OPTIONS[0];

  // Auto scroll to bottom when new messages arrive or while streaming
  useEffect(() => {
    if (!showScrollBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chat?.messages, isStreaming, showScrollBottom]);

  // Monitor scroll position
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 150;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBottom(false);
  };

  const getPersonaIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code2':
        return <Code2 className="w-8 h-8 text-amber-500" />;
      case 'HeartPulse':
        return <HeartPulse className="w-8 h-8 text-rose-500" />;
      case 'Scale':
        return <Scale className="w-8 h-8 text-amber-600" />;
      case 'Feather':
        return <Feather className="w-8 h-8 text-amber-500" />;
      case 'BarChart3':
        return <BarChart3 className="w-8 h-8 text-amber-600" />;
      case 'Calculator':
        return <Calculator className="w-8 h-8 text-amber-500" />;
      default:
        return <Sparkles className="w-8 h-8 text-amber-500 fill-amber-500/20" />;
    }
  };

  // If no chat or empty messages, show Welcome Screen
  if (!chat || chat.messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-0 bg-[#faf9f5] dark:bg-[#0c0b09]">
        <div className="max-w-2xl w-full text-center space-y-6 my-auto py-6">
          {/* Persona Header Card */}
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-500/20 shadow-md shadow-amber-500/10 mb-1">
            {getPersonaIcon(activePersona.icon)}
          </div>

          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
              {activePersona.badge}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-amber-50 tracking-tight">
              What can {activePersona.name} help with today?
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
              {activePersona.description}
            </p>
          </div>

          {/* Quick Model Selector Cards: Claude vs ChatGPT vs Gemini */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#151411] border border-amber-900/10 dark:border-amber-500/20 shadow-xs text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Select AI Engine
              </span>
              <span className="text-[11px] text-zinc-500 font-medium">
                Active: <strong className="text-amber-600 dark:text-amber-400">{selectedModelObj.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Claude Card */}
              <button
                onClick={() => onSelectModel('claude-5.0')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedModelObj.provider === 'claude'
                    ? 'bg-amber-50/80 dark:bg-amber-950/50 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                    : 'bg-zinc-50 dark:bg-[#1c1a16] border-zinc-200 dark:border-zinc-800 hover:border-amber-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Claude 5.0
                  </span>
                  {selectedModelObj.provider === 'claude' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Anthropic deep reasoning & code architecture.
                </p>
                <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                  Anthropic Flagship
                </span>
              </button>

              {/* ChatGPT Card */}
              <button
                onClick={() => onSelectModel('chatgpt-5.6')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedModelObj.provider === 'chatgpt'
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                    : 'bg-zinc-50 dark:bg-[#1c1a16] border-zinc-200 dark:border-zinc-800 hover:border-emerald-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    ChatGPT 5.6
                  </span>
                  {selectedModelObj.provider === 'chatgpt' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  OpenAI multi-step logic & fast throughput.
                </p>
                <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-200/70 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200">
                  OpenAI Flagship
                </span>
              </button>

              {/* Gemini Card */}
              <button
                onClick={() => onSelectModel('gemini-3.6-flash')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative ${
                  selectedModelObj.provider === 'gemini'
                    ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                    : 'bg-zinc-50 dark:bg-[#1c1a16] border-zinc-200 dark:border-zinc-800 hover:border-blue-400'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    Gemini 3.6
                  </span>
                  {selectedModelObj.provider === 'gemini' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  Google multimodal streaming & search grounding.
                </p>
                <span className="inline-block mt-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-200/70 dark:bg-blue-900/60 text-blue-900 dark:text-blue-200">
                  Google Flash
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Suggested Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left">
            {activePersona.suggestedPrompts.map((promptText, idx) => (
              <button
                key={idx}
                onClick={() => onSendMessage(promptText)}
                className="group p-4 rounded-2xl bg-white dark:bg-[#151411] border border-amber-900/10 dark:border-amber-500/20 hover:border-amber-500 dark:hover:border-amber-500 shadow-xs hover:shadow-md hover:shadow-amber-500/10 transition-all cursor-pointer text-left flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-center justify-between text-amber-700/60 dark:text-amber-400/60 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  <Lightbulb className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Try this</span>
                </div>
                <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 leading-snug">
                  "{promptText}"
                </p>
              </button>
            ))}
          </div>

          {/* Persona Switch Hint */}
          <div className="pt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Want a different expert perspective?{' '}
            <button
              onClick={onOpenPersonaModal}
              className="text-amber-700 dark:text-amber-400 font-semibold hover:underline cursor-pointer"
            >
              Switch Personas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#faf9f5] dark:bg-[#0c0b09] flex flex-col"
    >
      {/* Top Active Chat Breadcrumb Bar with Exit Button */}
      <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-2.5 bg-white/90 dark:bg-[#12110e]/90 backdrop-blur-md border-b border-amber-900/10 dark:border-amber-500/15 text-xs">
        <div className="flex items-center gap-2 min-w-0">
          {onExitChat && (
            <button
              onClick={onExitChat}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-amber-100 dark:bg-zinc-800 dark:hover:bg-amber-950/60 text-zinc-700 hover:text-amber-900 dark:text-zinc-300 dark:hover:text-amber-300 transition-colors font-medium cursor-pointer shrink-0 border border-zinc-200/80 dark:border-zinc-700/60 shadow-2xs"
              title="Exit this conversation and return to dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit Chat</span>
            </button>
          )}
          <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate max-w-[200px] sm:max-w-md">
            {chat.title || 'Conversation'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-200/60 dark:border-amber-800/40">
            {activePersona.name}
          </span>
          <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[10px] font-semibold border border-zinc-200 dark:border-zinc-700">
            {selectedModelObj.name}
          </span>
          {onExitChat && (
            <button
              onClick={onExitChat}
              className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md transition-colors cursor-pointer"
              title="Close / Exit conversation"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-amber-900/5 dark:divide-amber-500/10 pb-6 flex-1">
        {chat.messages.map((msg, index) => {
          const isLast = index === chat.messages.length - 1;
          const isStreamingThis = isLast && isStreaming && msg.role === 'assistant';

          return (
            <ChatMessageItem
              key={msg.id}
              message={msg}
              onRegenerate={isLast && msg.role === 'assistant' ? onRegenerate : undefined}
              onEditPrompt={msg.role === 'user' ? onEditPrompt : undefined}
              isStreaming={isStreamingThis}
            />
          );
        })}
      </div>

      <div ref={messagesEndRef} />

      {/* Floating Scroll-to-Bottom Button */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-24 right-6 z-20 p-2.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-lg shadow-amber-500/30 hover:from-amber-600 hover:to-amber-700 border border-amber-300 transition-all cursor-pointer flex items-center justify-center animate-bounce"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};
