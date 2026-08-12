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
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Export & Import Chat</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {activeChat ? (
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
                Export Current Chat ("{activeChat.title}")
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportMarkdown}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-indigo-500" />
                  <span>Markdown (.md)</span>
                </button>

                <button
                  onClick={handleExportJSON}
                  className="flex items-center justify-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <span>JSON (.json)</span>
                </button>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500">Select a conversation to export it.</p>
          )}

          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2 uppercase tracking-wider">
              Import Chat File
            </label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-indigo-500 text-zinc-700 dark:text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-indigo-500" />
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
