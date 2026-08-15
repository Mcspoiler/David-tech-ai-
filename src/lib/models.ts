import { ModelOption } from '../types/chat';

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: 'claude-5.0',
    name: 'Claude 5.0',
    description: 'Anthropic flagship next-generation model for complex reasoning, autonomous agents, and multi-domain problem solving.',
    badge: 'AgentRouter Pro',
    isPro: true
  },
  {
    id: 'claude-4.8',
    name: 'Claude 4.8',
    description: 'Advanced Claude model optimized for deep coding, mathematical proofs, nuanced reasoning, and high throughput.',
    badge: 'AgentRouter Pro',
    isPro: true
  },
  {
    id: 'claude-4.7',
    name: 'Claude 4.7',
    description: 'High-capability Claude model optimized for precise logic, coding architecture, and complex analytical tasks.',
    badge: 'AgentRouter'
  },
  {
    id: 'chatgpt-5.6',
    name: 'ChatGPT 5.6',
    description: 'OpenAI advanced multi-step reasoning model with high speed, deep context comprehension, and superior instruction following.',
    badge: 'AgentRouter Pro',
    isPro: true
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    description: 'Hybrid reasoning and instant response model for software development and general intelligence.',
    badge: 'AgentRouter'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Versatile, high-speed OpenAI model for complex multimodal and conversational tasks.',
    badge: 'AgentRouter'
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Fast, intelligent, ultra-responsive model optimized for real-time streaming chat and daily tasks.',
    badge: 'Gemini'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    description: 'Advanced Google reasoning model for deep logic and software engineering.',
    badge: 'Gemini'
  }
];

export const DEFAULT_MODEL = MODEL_OPTIONS[0].id;

