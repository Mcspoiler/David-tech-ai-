import { ModelOption, ModelProvider } from '../types/chat';

export const MODEL_OPTIONS: ModelOption[] = [
  // --- CLAUDE (Anthropic) Models ---
  {
    id: 'claude-5.0',
    name: 'Claude 5.0',
    provider: 'claude',
    description: 'Anthropic next-gen flagship for supreme reasoning, complex coding, and deep analytical problem solving.',
    badge: 'Claude Pro',
    isPro: true,
    speed: 'Ultra Fast',
    reasoning: 'Maximum (10/10)',
  },
  {
    id: 'claude-4.8',
    name: 'Claude 4.8',
    provider: 'claude',
    description: 'Advanced Claude model optimized for deep coding, mathematical proofs, nuanced writing, and high throughput.',
    badge: 'Claude Pro',
    isPro: true,
    speed: 'Fast',
    reasoning: 'Superior (9.8/10)',
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'claude',
    description: 'Hybrid reasoning and instant response model for software development and general intelligence.',
    badge: 'Claude',
    speed: 'Lightning',
    reasoning: 'High (9.5/10)',
  },
  {
    id: 'claude-4.7',
    name: 'Claude 4.7',
    provider: 'claude',
    description: 'High-capability Claude model optimized for precise logic, coding architecture, and complex analytical tasks.',
    badge: 'Claude',
    speed: 'Fast',
    reasoning: 'High (9.3/10)',
  },

  // --- CHATGPT (OpenAI) Models ---
  {
    id: 'chatgpt-5.6',
    name: 'ChatGPT 5.6',
    provider: 'chatgpt',
    description: 'OpenAI multi-step reasoning model with high speed, deep context comprehension, and superior instruction following.',
    badge: 'ChatGPT Pro',
    isPro: true,
    speed: 'Ultra Fast',
    reasoning: 'Maximum (9.9/10)',
  },
  {
    id: 'gpt-4o',
    name: 'ChatGPT 4o',
    provider: 'chatgpt',
    description: 'Versatile, high-speed OpenAI flagship model for multimodal tasks, coding, and creative dialogue.',
    badge: 'ChatGPT',
    speed: 'Lightning',
    reasoning: 'High (9.4/10)',
  },

  // --- GEMINI (Google) Models ---
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'gemini',
    description: 'Ultra-responsive Google model optimized for real-time streaming, web search grounding, and fast answers.',
    badge: 'Gemini',
    speed: 'Instant',
    reasoning: 'High (9.2/10)',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    description: 'Advanced Google reasoning model for complex multimodal analysis, coding, and mathematical logic.',
    badge: 'Gemini',
    speed: 'Fast',
    reasoning: 'Superior (9.6/10)',
  },
];

export const DEFAULT_MODEL = 'claude-5.0';

export const PROVIDER_META: Record<
  ModelProvider,
  {
    name: string;
    tagline: string;
    badgeColor: string;
    activeBorder: string;
    defaultModel: string;
  }
> = {
  claude: {
    name: 'Claude',
    tagline: 'Anthropic Flagship Intelligence',
    badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
    activeBorder: 'border-amber-500',
    defaultModel: 'claude-5.0',
  },
  chatgpt: {
    name: 'ChatGPT',
    tagline: 'OpenAI Advanced Reasoning',
    badgeColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
    activeBorder: 'border-emerald-500',
    defaultModel: 'chatgpt-5.6',
  },
  gemini: {
    name: 'Gemini',
    tagline: 'Google Multimodal & Search',
    badgeColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
    activeBorder: 'border-blue-500',
    defaultModel: 'gemini-3.6-flash',
  },
};


