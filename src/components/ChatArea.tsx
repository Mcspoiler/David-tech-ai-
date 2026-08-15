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
} from 'lucide-react';
import { ChatConversation, Persona } from '../types/chat';
import { ChatMessageItem } from './ChatMessageItem';

interface ChatAreaProps {
  chat: ChatConversation | null;
  activePersona: Persona;
  isStreaming: boolean;
  onSendMessage: (text: string) => void;
  onRegenerate: () => void;
  onEditPrompt: (newPrompt: string) => void;
  onOpenPersonaModal: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  chat,
  activePersona,
  isStreaming,
  onSendMessage,
  onRegenerate,
  onEditPrompt,
  onOpenPersonaModal,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

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
      default:
        return <Sparkles className="w-8 h-8 text-amber-500 fill-amber-500/20" />;
    }
  };

  // If no chat or empty messages, show Welcome Screen
  if (!chat || chat.messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-0 bg-[#faf9f5] dark:bg-[#0c0b09]">
        <div className="max-w-2xl w-full text-center space-y-6 my-auto py-8">
          {/* Persona Header Card */}
          <div className="inline-flex items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-500/20 shadow-md shadow-amber-500/10 mb-2">
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

          {/* Interactive Suggested Prompts Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-left pt-4">
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
          <div className="pt-2 text-xs text-zinc-400 dark:text-zinc-500">
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
      className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#faf9f5] dark:bg-[#0c0b09]"
    >
      <div className="divide-y divide-amber-900/5 dark:divide-amber-500/10 pb-6">
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
