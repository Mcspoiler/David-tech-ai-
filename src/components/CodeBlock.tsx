import React, { useState, useMemo } from 'react';
import hljs from 'highlight.js';
import {
  Check,
  Copy,
  Download,
  Eye,
  Code2,
  WrapText,
  ListOrdered,
  FileCode,
  Terminal,
  Layers,
  Database,
  Cpu,
} from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

// Map languages to file extensions and friendly names
const LANG_MAP: Record<string, { ext: string; name: string; icon: 'code' | 'terminal' | 'db' | 'web' | 'cpu' }> = {
  ts: { ext: 'ts', name: 'TypeScript', icon: 'code' },
  typescript: { ext: 'ts', name: 'TypeScript', icon: 'code' },
  tsx: { ext: 'tsx', name: 'React TypeScript', icon: 'code' },
  js: { ext: 'js', name: 'JavaScript', icon: 'code' },
  javascript: { ext: 'js', name: 'JavaScript', icon: 'code' },
  jsx: { ext: 'jsx', name: 'React JSX', icon: 'code' },
  py: { ext: 'py', name: 'Python', icon: 'code' },
  python: { ext: 'py', name: 'Python', icon: 'code' },
  html: { ext: 'html', name: 'HTML5', icon: 'web' },
  htm: { ext: 'html', name: 'HTML5', icon: 'web' },
  css: { ext: 'css', name: 'CSS3', icon: 'web' },
  scss: { ext: 'scss', name: 'SCSS', icon: 'web' },
  json: { ext: 'json', name: 'JSON', icon: 'code' },
  sql: { ext: 'sql', name: 'SQL', icon: 'db' },
  postgres: { ext: 'sql', name: 'PostgreSQL', icon: 'db' },
  bash: { ext: 'sh', name: 'Bash', icon: 'terminal' },
  sh: { ext: 'sh', name: 'Shell', icon: 'terminal' },
  zsh: { ext: 'sh', name: 'Zsh', icon: 'terminal' },
  shell: { ext: 'sh', name: 'Shell', icon: 'terminal' },
  rust: { ext: 'rs', name: 'Rust', icon: 'cpu' },
  rs: { ext: 'rs', name: 'Rust', icon: 'cpu' },
  go: { ext: 'go', name: 'Go', icon: 'code' },
  golang: { ext: 'go', name: 'Go', icon: 'code' },
  cpp: { ext: 'cpp', name: 'C++', icon: 'cpu' },
  c: { ext: 'c', name: 'C', icon: 'cpu' },
  csharp: { ext: 'cs', name: 'C#', icon: 'code' },
  cs: { ext: 'cs', name: 'C#', icon: 'code' },
  java: { ext: 'java', name: 'Java', icon: 'code' },
  kotlin: { ext: 'kt', name: 'Kotlin', icon: 'code' },
  swift: { ext: 'swift', name: 'Swift', icon: 'code' },
  svg: { ext: 'svg', name: 'SVG Vector', icon: 'web' },
  yaml: { ext: 'yaml', name: 'YAML', icon: 'code' },
  yml: { ext: 'yaml', name: 'YAML', icon: 'code' },
  markdown: { ext: 'md', name: 'Markdown', icon: 'code' },
  md: { ext: 'md', name: 'Markdown', icon: 'code' },
  dockerfile: { ext: 'dockerfile', name: 'Dockerfile', icon: 'terminal' },
  diff: { ext: 'diff', name: 'Git Diff', icon: 'code' },
};

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'plaintext' }) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'code' | 'preview'>('code');
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const cleanLang = language.toLowerCase().trim();
  const langMeta = LANG_MAP[cleanLang] || { ext: 'txt', name: cleanLang || 'Code', icon: 'code' };

  const isPreviewable = useMemo(() => {
    return ['html', 'htm', 'svg'].includes(cleanLang) ||
      (cleanLang === 'xml' && code.includes('<svg')) ||
      (code.trim().startsWith('<') && code.trim().endsWith('>'));
  }, [cleanLang, code]);

  // Syntax highlighting
  const highlightedCode = useMemo(() => {
    try {
      if (cleanLang && hljs.getLanguage(cleanLang)) {
        return hljs.highlight(code, { language: cleanLang }).value;
      }
      return hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  }, [code, cleanLang]);

  // Split lines for line numbering
  const lines = useMemo(() => {
    return highlightedCode.split('\n');
  }, [highlightedCode]);

  // Handle Copy
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle Download
  const handleDownload = () => {
    const filename = `snippet_${Date.now()}.${langMeta.ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getLangIcon = () => {
    switch (langMeta.icon) {
      case 'terminal':
        return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'db':
        return <Database className="w-3.5 h-3.5 text-blue-400" />;
      case 'web':
        return <Layers className="w-3.5 h-3.5 text-orange-400" />;
      case 'cpu':
        return <Cpu className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="code-block-container my-4 rounded-2xl overflow-hidden border border-amber-900/20 dark:border-amber-500/25 bg-[#141310] shadow-md text-sm font-mono">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#1c1a16] border-b border-amber-900/30 text-xs select-none">
        {/* Left: Language Badge & Preview Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold tracking-wide">
            {getLangIcon()}
            <span>{langMeta.name}</span>
          </div>

          {/* Line count badge */}
          <span className="hidden sm:inline text-[11px] text-zinc-500 font-normal">
            {lines.length} {lines.length === 1 ? 'line' : 'lines'}
          </span>

          {/* Live Preview Toggle for HTML/SVG */}
          {isPreviewable && (
            <div className="flex items-center rounded-lg bg-black/40 p-0.5 border border-zinc-800">
              <button
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'code'
                    ? 'bg-amber-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Code2 className="w-3 h-3" />
                <span>Code</span>
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
                  viewMode === 'preview'
                    ? 'bg-emerald-500 text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Preview</span>
              </button>
            </div>
          )}
        </div>

        {/* Right: Actions (Line Numbers, Word Wrap, Download, Copy) */}
        <div className="flex items-center gap-1">
          {viewMode === 'code' && (
            <>
              {/* Toggle Line Numbers */}
              <button
                onClick={() => setShowLineNumbers(!showLineNumbers)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  showLineNumbers
                    ? 'text-amber-400 bg-amber-500/15'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title={showLineNumbers ? 'Hide line numbers' : 'Show line numbers'}
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>

              {/* Toggle Word Wrap */}
              <button
                onClick={() => setWrapLines(!wrapLines)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  wrapLines
                    ? 'text-amber-400 bg-amber-500/15'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
                title={wrapLines ? 'Disable word wrap' : 'Enable word wrap'}
              >
                <WrapText className="w-3.5 h-3.5" />
              </button>

              {/* Download File */}
              <button
                onClick={handleDownload}
                className="p-1.5 text-zinc-400 hover:text-amber-300 hover:bg-zinc-800 rounded-lg transition-colors cursor-pointer"
                title={`Download as .${langMeta.ext}`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30'
            }`}
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                <span className="text-emerald-300">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body: Either Code or Live Interactive Preview */}
      {viewMode === 'preview' && isPreviewable ? (
        <div className="p-4 bg-white dark:bg-[#0c0b09] min-h-[160px] flex items-center justify-center overflow-auto border-t border-amber-900/20">
          {cleanLang === 'svg' || (code.trim().startsWith('<svg') && code.trim().endsWith('</svg>')) ? (
            <div
              className="max-w-full overflow-auto p-4 flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: code }}
            />
          ) : (
            <iframe
              srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/><script src="https://cdn.tailwindcss.com"></script><style>body { font-family: system-ui, -apple-system, sans-serif; padding: 16px; margin: 0; background: #ffffff; color: #18181b; } @media (prefers-color-scheme: dark) { body { background: #12110e; color: #f4f4f5; } }</style></head><body>${code}</body></html>`}
              className="w-full h-64 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#12110e]"
              sandbox="allow-scripts"
              title="Live Code Preview"
            />
          )}
        </div>
      ) : (
        <div className="relative overflow-x-auto custom-scrollbar">
          <pre
            className={`p-4 text-xs font-mono leading-relaxed text-amber-50 m-0 ${
              wrapLines ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'
            }`}
          >
            {showLineNumbers ? (
              <table className="border-collapse w-full">
                <tbody>
                  {lines.map((lineHtml, idx) => (
                    <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                      <td className="select-none text-right pr-4 text-zinc-600 dark:text-zinc-600 w-8 align-top font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      <td
                        className="pl-2 text-amber-100/90 font-mono align-top"
                        dangerouslySetInnerHTML={{ __html: lineHtml || '&nbsp;' }}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
            )}
          </pre>
        </div>
      )}
    </div>
  );
};
