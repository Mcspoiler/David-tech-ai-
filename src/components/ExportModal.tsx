import React, { useRef } from 'react';
import { X, Download, Upload, FileText, Code2, FileCode } from 'lucide-react';
import { ChatConversation } from '../types/chat';
import {
  exportChatToMarkdown,
  exportChatToJSON,
  downloadFile,
} from '../lib/storage';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChat: ChatConversation | null;
  onImportChat: (importedChat: ChatConversation) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  activeChat,
  onImportChat,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExportMarkdown = () => {
    if (!activeChat) return;
    const content = exportChatToMarkdown(activeChat);
    const filename = `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}.md`;
    downloadFile(content, filename, 'text/markdown');
  };

  const handleExportJSON = () => {
    if (!activeChat) return;
    const content = exportChatToJSON(activeChat);
    const filename = `${activeChat.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}.json`;
    downloadFile(content, filename, 'application/json');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const raw = event.target?.result as string;
        const parsed = JSON.parse(raw);
        if (parsed && parsed.title && Array.isArray(parsed.messages)) {
          // assign new ID to avoid conflict
          parsed.id = `chat_${Date.now()}`;
          parsed.updatedAt = Date.now();
          onImportChat(parsed);
          alert('Chat imported successfully!');
          onClose();
        } else {
          alert('Invalid chat JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-amber-900/10 dark:border-amber-500/15">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-amber-50">Export & Import Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-amber-700 dark:hover:text-amber-300 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 bg-white dark:bg-[#12110e]">
          {activeChat ? (
            <div>
              <label className="block text-xs font-bold text-amber-900/80 dark:text-amber-400/80 mb-2 uppercase tracking-wider">
                Export Current Chat ("{activeChat.title}")
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-900/15 dark:border-amber-500/20 bg-amber-50/40 dark:bg-[#181714] hover:border-amber-400 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-amber-900/15 dark:border-amber-500/20 bg-amber-50/40 dark:bg-[#181714] hover:border-amber-400 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <span>JSON (.json)</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Select a conversation to export it.</p>
          )}

          <div className="pt-4 border-t border-amber-900/10 dark:border-amber-500/15">
            <label className="block text-xs font-bold text-amber-900/80 dark:text-amber-400/80 mb-2 uppercase tracking-wider">
              Import Chat File
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-900/20 dark:border-amber-500/30 hover:border-amber-500 text-amber-900 dark:text-amber-300 text-xs font-semibold transition-colors cursor-pointer bg-amber-50/30 dark:bg-amber-950/20"
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Upload JSON Conversation File</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
