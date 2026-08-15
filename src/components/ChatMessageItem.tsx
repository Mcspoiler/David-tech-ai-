import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Edit3,
  Volume2,
  VolumeX,
  ExternalLink,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { ChatMessage } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  onEditPrompt?: (newPrompt: string) => void;
  isStreaming?: boolean;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  onRegenerate,
  onEditPrompt,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Text to Speech
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message.content);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  // Edit user prompt
  const handleSaveEdit = () => {
    if (editContent.trim() && onEditPrompt) {
      onEditPrompt(editContent.trim());
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group w-full py-5 px-4 md:px-6 transition-colors ${
        isUser
          ? 'bg-transparent'
          : 'bg-amber-50/25 dark:bg-[#12110e]/70 border-y border-amber-900/5 dark:border-amber-500/10'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-4">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-950/80 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-900 dark:text-amber-200 font-semibold text-xs shadow-xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 flex items-center justify-center text-zinc-950 shadow-md shadow-amber-500/20 border border-amber-300/40">
              <Sparkles className="w-4 h-4 animate-gold-shimmer fill-amber-950/20" />
            </div>
          )}
        </div>

        {/* Message Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header row */}
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            <span className="font-bold text-zinc-900 dark:text-amber-100">
              {isUser ? 'You' : 'AI Assistant'}
            </span>
            <div className="flex items-center gap-2 text-[11px]">
              <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              {message.latencyMs && (
                <span className="flex items-center gap-1 text-amber-600/70 dark:text-amber-400/70">
                  <Clock className="w-3 h-3" />
                  {(message.latencyMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>

          {/* User Attachments (Images) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="relative rounded-xl overflow-hidden border border-amber-200/80 dark:border-amber-500/20 bg-amber-50 dark:bg-zinc-900 max-w-[200px]"
                >
                  <img src={att.url} alt={att.name} className="w-full h-auto max-h-48 object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Text Content / Edit Mode */}
          {isEditing ? (
            <div className="space-y-2 pt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 text-sm rounded-xl bg-white dark:bg-[#151411] border border-amber-500 text-zinc-900 dark:text-zinc-100 focus:outline-none ring-2 ring-amber-500/20"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveEdit}
                  className="px-3.5 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 rounded-xl transition-all cursor-pointer shadow-xs shadow-amber-500/20"
                >
                  Save & Resend
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              {isUser ? (
                <p className="text-sm text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </p>
              ) : (
                <MarkdownRenderer content={message.content} />
              )}
            </div>
          )}

          {/* Streaming Typing Indicator */}
          {isStreaming && message.role === 'assistant' && !message.content && (
            <div className="flex items-center gap-1.5 py-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-150"></span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce delay-300"></span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-medium ml-1">Thinking...</span>
            </div>
          )}

          {/* Grounding / Search Sources */}
          {message.groundingSources && message.groundingSources.length > 0 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 text-xs">
              <div className="font-semibold text-amber-900 dark:text-amber-200 mb-1.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Web Search Sources:</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {message.groundingSources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-[#151411] border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 hover:border-amber-400 truncate max-w-[240px]"
                  >
                    <span>{src.title}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Error Card if status === 'error' */}
          {message.status === 'error' && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Error</p>
                <p className="mt-0.5 text-[11px] opacity-90">{message.error || 'Failed to complete message.'}</p>
              </div>
            </div>
          )}

          {/* Message Toolbar */}
          {!isEditing && message.content && (
            <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 dark:text-zinc-500 text-xs">
              <button
                onClick={handleCopy}
                className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                title="Copy text"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied && <span className="text-[10px] text-emerald-500 font-medium">Copied!</span>}
              </button>

              {'speechSynthesis' in window && (
                <button
                  onClick={handleToggleSpeak}
                  className={`p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer ${
                    isSpeaking ? 'text-amber-600 dark:text-amber-400' : ''
                  }`}
                  title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {isUser && onEditPrompt && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer"
                  title="Edit prompt"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}

              {!isUser && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  title="Regenerate response"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
