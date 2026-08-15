import React, { useMemo } from 'react';
import { marked } from 'marked';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { CodeBlock } from './CodeBlock';

interface MarkdownRendererProps {
  content: string;
}

// Function to preprocess and render LaTeX math expressions using KaTeX
function renderMathInMarkdown(text: string): string {
  if (!text) return '';

  // 1. Math / LaTeX fenced blocks
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
  processed = processed.replace(/(?<!\\|\$)\$(?!\$)(\S(?:[\s\S]*?\S)?)\$(?!\$)/g, (_match, equation) => {
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

type ContentSegment =
  | { type: 'markdown'; html: string }
  | { type: 'code'; code: string; language: string };

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const segments = useMemo<ContentSegment[]>(() => {
    if (!content) return [];

    const renderer = new marked.Renderer();
    renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
      const titleAttr = title ? `title="${title}"` : '';
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-amber-700 dark:text-amber-400 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity" ${titleAttr}>${text}</a>`;
    };

    marked.setOptions({
      renderer,
      gfm: true,
      breaks: true,
    });

    const result: ContentSegment[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)(?:```|$)/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      const matchIndex = match.index;
      const lang = match[1] || 'plaintext';
      const code = match[2] || '';

      // If this is a math/latex block, treat it as markdown so KaTeX handles it
      if (lang.toLowerCase() === 'math' || lang.toLowerCase() === 'latex') {
        continue;
      }

      // Preceding text before this code block
      if (matchIndex > lastIndex) {
        const textBefore = content.substring(lastIndex, matchIndex);
        if (textBefore.trim()) {
          const withMath = renderMathInMarkdown(textBefore);
          const parsed = marked.parse(withMath) as string;
          result.push({ type: 'markdown', html: parsed });
        }
      }

      // The code block
      result.push({
        type: 'code',
        code: code.replace(/\n$/, ''),
        language: lang,
      });

      lastIndex = codeBlockRegex.lastIndex;
    }

    // Remaining text after last code block
    if (lastIndex < content.length) {
      const remainingText = content.substring(lastIndex);
      if (remainingText.trim()) {
        const withMath = renderMathInMarkdown(remainingText);
        const parsed = marked.parse(withMath) as string;
        result.push({ type: 'markdown', html: parsed });
      }
    }

    // If no code blocks were found at all, parse the whole text as markdown
    if (result.length === 0 && content.trim()) {
      const withMath = renderMathInMarkdown(content);
      const parsed = marked.parse(withMath) as string;
      result.push({ type: 'markdown', html: parsed });
    }

    return result;
  }, [content]);

  return (
    <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-100 leading-relaxed font-normal prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-amber-50 prose-p:my-2.5 prose-ul:my-2.5 prose-ol:my-2.5 prose-li:my-0.5 prose-blockquote:border-l-4 prose-blockquote:border-amber-500/80 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400 prose-table:my-4 prose-th:bg-amber-100/50 dark:prose-th:bg-amber-950/40 prose-th:p-2.5 prose-td:p-2.5 prose-td:border prose-td:border-amber-900/10 dark:prose-td:border-amber-500/20">
      {segments.map((seg, i) => {
        if (seg.type === 'code') {
          return <CodeBlock key={i} code={seg.code} language={seg.language} />;
        }
        return (
          <div
            key={i}
            className="markdown-segment"
            dangerouslySetInnerHTML={{ __html: seg.html }}
          />
        );
      })}
    </div>
  );
};
