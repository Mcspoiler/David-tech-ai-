import { ModelOption } from '../types/chat';

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Fast, intelligent, ultra-responsive model optimized for real-time streaming chat and daily tasks.',
    badge: 'Recommended'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    description: 'Advanced reasoning, deep logic, multi-step problem solving, and complex software engineering.',
    badge: 'Deep Reasoning',
    isPro: true
  }
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0].id;
