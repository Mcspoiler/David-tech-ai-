import React, { useMemo } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
}

// Function to preprocess and render LaTeX math expressions using KaTeX
function renderMathInMarkdown(text: string): string {
  if (!text) return '';

  // 1. Preprocess code blocks marked as ```math or ```latex
  let processed = text.replace(/```(?:math|latex)\n([\s\S]*?)```/g, (_match, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-wrapper my-3 p-3 overflow-x-auto rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-900/15 dark:border-amber-500/25 text-center">${rendered}</div>`;
    } catch {
      return `<pre class="p-2 text-xs font-mono bg-zinc-900 text-amber-300 rounded">${equation}</pre>`;
    }
  });

  // 2. Block equations: $$ ... $$
  processed = processed.replace(/\$\$([\s\S]*?)\$\$/g, (_match, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-wrapper my-3 p-3 overflow-x-auto rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-900/15 dark:border-amber-500/25 text-center">${rendered}</div>`;
    } catch {
      return `$$${equation}$$`;
    }
  });

  // 3. Block equations: \[ ... \]
  processed = processed.replace(/\\\[([\s\S]*?)\\\]/g, (_match, equation) => {
    try {
      const rendered = katex.renderToString(equation.trim(), {
        displayMode: true,
        throwOnError: false,
      });
      return `<div class="katex-display-wrapper my-3 p-3 overflow-x-auto rounded-xl bg-amber-500/5 dark:bg-amber-950/20 border border-amber-900/15 dark:border-amber-500/25 text-center">${rendered}</div>`;
    } catch {
      return `\\[${equation}\\]`;
    }
  });

  // 4. Inline equations: \( ... \)
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_match, equation) => {
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `\\(${equation}\\)`;
    }
  });

  // 5. Inline equations: $ ... $ (avoid matching escaped currency like \$ or multiple $$$)
  // Only match $...$ when not surrounded by whitespace or empty
  processed = processed.replace(/(?<!\\|\$)\$(?!\$)(\S(?:[\s\S]*?\S)?)\$(?!\$)/g, (_match, equation) => {
    // Avoid single numbers or currency like $100
    if (/^\d+(?:,\d{3})*(?:\.\d+)?$/.test(equation.trim())) {
      return `$${equation}$`;
    }
    try {
      return katex.renderToString(equation.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return `$${equation}$`;
    }
  });

  return processed;
}

// Custom renderer for marked to build code blocks with copy buttons and formulas
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
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
      } catch {
        highlighted = text;
      }

      const id = codeCounter++;
      codeBlocks.push({ id, lang: language, code: text });

      return `
        <div class="code-block-wrapper my-4 rounded-xl overflow-hidden border border-amber-900/20 dark:border-amber-500/20 bg-[#161512] shadow-sm text-sm">
          <div class="flex items-center justify-between px-4 py-2 bg-[#201e19] text-amber-200/80 border-b border-amber-900/30 font-mono text-xs select-none">
            <span class="font-medium text-amber-300 capitalize">${language}</span>
            <button data-code-id="${id}" class="copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs transition-all cursor-pointer border border-amber-500/30">
              <span>Copy</span>
            </button>
          </div>
          <pre class="p-4 overflow-x-auto text-amber-50 font-mono text-xs leading-relaxed"><code>${highlighted}</code></pre>
        </div>
      `;
    };

    // Override link renderer for security
    renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
      const titleAttr = title ? `title="${title}"` : '';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-amber-700 dark:text-amber-400 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity" ${titleAttr}>${text}</a>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    // 1. Process math equations first
    const contentWithMath = renderMathInMarkdown(content || '');

    // 2. Parse markdown
    const rawHtml = marked.parse(contentWithMath) as string;
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
      className="prose dark:prose-invert max-w-none prose-zinc text-zinc-800 dark:text-zinc-100 leading-relaxed space-y-3 font-normal prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-amber-50 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-amber-500/80 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-table:my-4 prose-th:bg-amber-100/50 dark:prose-th:bg-amber-950/40 prose-th:p-2.5 prose-td:p-2.5 prose-td:border prose-td:border-amber-900/10 dark:prose-td:border-amber-500/20"
      dangerouslySetInnerHTML={{ __html: htmlAndCodeBlocks.rawHtml }}
    />
  );
};

