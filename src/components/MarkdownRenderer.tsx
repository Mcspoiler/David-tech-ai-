import React, { useMemo, useState } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css'; // modern dark theme for code
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

// Custom renderer for marked to build code blocks with copy buttons
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Configure marked options with hljs
  const htmlAndCodeBlocks = useMemo(() => {
    const codeBlocks: Array<{ id: number; lang: string; code: string }> = [];
    let codeCounter = 0;

    const renderer = new marked.Renderer();

    renderer.code = ({ text, lang }: { text: string; lang?: string }) => {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      let highlighted = text;
      try {
        if (lang && hljs.getLanguage(lang)) {
          highlighted = hljs.highlight(text, { language: lang }).value;
        } else {
          highlighted = hljs.highlightAuto(text).value;
        }
      } catch (e) {
        highlighted = text;
      }

      const id = codeCounter++;
      codeBlocks.push({ id, lang: language, code: text });

      return `
        <div class="code-block-wrapper my-4 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-900 shadow-sm text-sm">
          <div class="flex items-center justify-between px-4 py-2 bg-zinc-800/80 text-zinc-300 border-b border-zinc-700/60 font-mono text-xs select-none">
            <span class="font-medium text-zinc-400 capitalize">${language}</span>
            <button data-code-id="${id}" class="copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-700/50 hover:bg-zinc-700 text-zinc-200 text-xs transition-all cursor-pointer">
              <span>Copy</span>
            </button>
          </div>
          <pre class="p-4 overflow-x-auto text-zinc-100 font-mono text-xs leading-relaxed"><code>${highlighted}</code></pre>
        </div>
      `;
    };

    // Override link renderer for security
    renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
      const titleAttr = title ? `title="${title}"` : '';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 font-medium underline underline-offset-2 hover:opacity-80 transition-opacity" ${titleAttr}>${text}</a>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    const rawHtml = marked.parse(content || '') as string;
    return { rawHtml, codeBlocks };
  }, [content]);

  // Handle copy code clicks via event delegation
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const button = target.closest('.copy-code-btn') as HTMLButtonElement | null;
    if (!button) return;

    const idAttr = button.getAttribute('data-code-id');
    if (idAttr === null) return;

    const id = parseInt(idAttr, 10);
    const block = htmlAndCodeBlocks.codeBlocks.find((b) => b.id === id);
    if (block) {
      navigator.clipboard.writeText(block.code);
      button.innerHTML = `<span class="text-emerald-400 flex items-center gap-1"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!</span>`;
      setTimeout(() => {
        button.innerHTML = `<span>Copy</span>`;
      }, 2000);
    }
  };

  return (
    <div
      onClick={handleContainerClick}
      className="prose dark:prose-invert max-w-none prose-zinc text-zinc-800 dark:text-zinc-100 leading-relaxed space-y-3 font-normal prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-50 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-indigo-500/80 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-table:my-4 prose-th:bg-zinc-100 dark:prose-th:bg-zinc-800 prose-th:p-2.5 prose-td:p-2.5 prose-td:border prose-td:border-zinc-200 dark:prose-td:border-zinc-800"
      dangerouslySetInnerHTML={{ __html: htmlAndCodeBlocks.rawHtml }}
    />
  );
};
