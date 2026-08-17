import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to get Gemini Client safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please verify your GEMINI_API_KEY in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
  });
}

// Health Check API
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Helper to check if model is an AgentRouter model
function isAgentRouterModel(modelName: string): boolean {
  const m = modelName.toLowerCase();
  return (
    m.includes('claude') ||
    m.includes('chatgpt') ||
    m.includes('gpt') ||
    m.includes('agentrouter')
  );
}

// Handler for AgentRouter / OpenAI compatible endpoint
async function streamAgentRouterResponse(
  reqBody: any,
  res: Response,
  sendEvent: (data: any) => void
) {
  const {
    messages,
    model = 'claude-5.0',
    systemInstruction = 'You are a helpful, knowledgeable AI assistant. Use markdown formatting effectively.',
    temperature = 0.7,
    agentRouterApiKey: clientApiKey,
  } = reqBody;

  const apiKey =
    clientApiKey ||
    process.env.AGENTROUTER_API_KEY ||
    process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'AgentRouter API key is missing. Please set your AgentRouter API key in preferences (Settings modal) or environment variable AGENTROUTER_API_KEY.'
    );
  }

  let baseUrl = (
    process.env.AGENTROUTER_BASE_URL || 'https://api.agentrouter.ai/v1'
  ).replace(/\/+$/, '');

  // Format messages into OpenAI format
  const formattedMessages: any[] = [];
  if (systemInstruction) {
    formattedMessages.push({ role: 'system', content: systemInstruction });
  }

  messages.forEach((msg: any) => {
    const role = msg.role === 'assistant' ? 'assistant' : 'user';

    // Handle multimodal image attachments
    if (
      Array.isArray(msg.attachments) &&
      msg.attachments.length > 0 &&
      role === 'user'
    ) {
      const contentParts: any[] = [];
      if (msg.content) {
        contentParts.push({ type: 'text', text: msg.content });
      }
      msg.attachments.forEach((att: any) => {
        if (att.url && typeof att.url === 'string') {
          contentParts.push({
            type: 'image_url',
            image_url: { url: att.url },
          });
        }
      });
      formattedMessages.push({ role, content: contentParts });
    } else {
      formattedMessages.push({ role, content: msg.content || '' });
    }
  });

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: formattedMessages,
      stream: true,
      temperature: Math.max(0, Math.min(1, Number(temperature) || 0.7)),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedMsg = errorText;
    try {
      const errJson = JSON.parse(errorText);
      parsedMsg = errJson.error?.message || errJson.message || errorText;
    } catch (e) {}
    throw new Error(`AgentRouter API Error (${response.status}): ${parsedMsg}`);
  }

  if (!response.body) {
    throw new Error('No response stream received from AgentRouter API.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataStr = trimmed.slice(5).trim();

      if (dataStr === '[DONE]') {
        break;
      }

      try {
        const parsed = JSON.parse(dataStr);
        const chunkText =
          parsed.choices?.[0]?.delta?.content ||
          parsed.choices?.[0]?.text ||
          '';
        if (chunkText) {
          sendEvent({ chunk: chunkText });
        }
      } catch (e) {
        // Skip incomplete JSON lines
      }
    }
  }

  sendEvent({ done: true });
  res.write('data: [DONE]\n\n');
  res.end();
}

// Auto Title Generation API
app.post('/api/title', async (req: Request, res: Response) => {
  try {
    const { prompt, agentRouterApiKey: clientApiKey } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const arKey = clientApiKey || process.env.AGENTROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (arKey) {
      const baseUrl = (process.env.AGENTROUTER_BASE_URL || 'https://api.agentrouter.ai/v1').replace(/\/+$/, '');
      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${arKey}`,
        },
        body: JSON.stringify({
          model: 'claude-4.7',
          messages: [
            {
              role: 'system',
              content: 'Generate a short 3 to 5 word title for a conversation starting with the prompt provided. Output ONLY the title text, with no quotes or punctuation.',
            },
            { role: 'user', content: prompt.slice(0, 300) },
          ],
          temperature: 0.3,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        const title = data.choices?.[0]?.message?.content?.trim();
        if (title) return res.json({ title });
      }
    }

    if (process.env.GEMINI_API_KEY) {
      const ai = getGeminiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: `Generate a short, concise 3 to 5 word title for a conversation starting with this user message: "${prompt.slice(0, 300)}". Output ONLY the title text, with no quotes or punctuation.`,
        config: {
          temperature: 0.3,
        },
      });

      const title = response.text?.trim() || 'New Conversation';
      return res.json({ title });
    }

    return res.json({ title: 'New Conversation' });
  } catch (error: any) {
    console.error('Title generation error:', error);
    return res.json({ title: 'New Conversation' });
  }
});

// Streaming Chat API (Server-Sent Events)
app.post('/api/chat', async (req: Request, res: Response) => {
  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const {
      messages,
      model = 'claude-5.0',
      systemInstruction = 'You are a helpful, knowledgeable AI assistant. Use markdown formatting effectively.',
      enableSearchGrounding = false,
      temperature = 0.7,
      agentRouterApiKey,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      sendEvent({ error: 'Messages array is required' });
      res.write('data: [DONE]\n\n');
      return res.end();
    }

// Route to AgentRouter if requested model is Claude/ChatGPT and AgentRouter key is available
    const arKey = agentRouterApiKey || process.env.AGENTROUTER_API_KEY || process.env.OPENAI_API_KEY;
    if (arKey && isAgentRouterModel(model)) {
      try {
        await streamAgentRouterResponse(req.body, res, sendEvent);
        return;
      } catch (agentErr: any) {
        console.warn('AgentRouter streaming failed, falling back to Gemini engine:', agentErr.message);
        // Continue to Gemini fallback
      }
    }

    // High-performance Gemini execution (handles Gemini models and intelligent fallback)
    const ai = getGeminiClient();

    // Enhance system instruction for elite coding and formula rendering
    let enhancedSystemInstruction = systemInstruction || 'You are a highly capable AI assistant.';
    if (!enhancedSystemInstruction.includes('LaTeX') && !enhancedSystemInstruction.includes('markdown')) {
      enhancedSystemInstruction += ' Format all code snippets cleanly using fenced markdown blocks with explicit language identifiers (e.g. ```typescript, ```python, ```html, ```sql, ```bash). Never truncate code blocks. When explaining mathematical, scientific, or algorithmic formulas, format them in standard LaTeX ($$...$$ for display equations and $...$ for inline variables).';
    }

    // Transform messages array into GenAI contents format
    const formattedContents = messages.map((msg: any) => {
      const parts: any[] = [];

      // Add attached images if present
      if (Array.isArray(msg.attachments) && msg.attachments.length > 0) {
        msg.attachments.forEach((att: any) => {
          if (att.url && typeof att.url === 'string') {
            const match = att.url.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
            if (match) {
              parts.push({
                inlineData: {
                  mimeType: match[1],
                  data: match[2],
                },
              });
            }
          }
        });
      }

      // Add text content
      if (msg.content) {
        parts.push({ text: msg.content });
      }

      // Ensure at least one part exists
      if (parts.length === 0) {
        parts.push({ text: ' ' });
      }

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts,
      };
    });

    // Determine appropriate Gemini model
    const targetModel = model === 'gemini-3.1-pro-preview' ? 'gemini-3.1-pro-preview' : 'gemini-3.7-flash';

    // Configure model call options
    const config: any = {
      systemInstruction: enhancedSystemInstruction,
      temperature: Math.max(0, Math.min(1, Number(temperature) || 0.7)),
    };

    if (enableSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    // Call Gemini generateContentStream with automatic fallback
    let responseStream;
    try {
      responseStream = await ai.models.generateContentStream({
        model: targetModel,
        contents: formattedContents,
        config,
      });
    } catch (modelErr: any) {
      console.warn(`Streaming with ${targetModel} failed:`, modelErr.message);
      // If tools or pro model failed, retry without search tools with gemini-3.7-flash
      delete config.tools;
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.7-flash',
        contents: formattedContents,
        config,
      });
    }

    for await (const chunk of responseStream) {
      const chunkText = chunk.text || '';
      
      // Check for Google Search Grounding sources
      let groundingSources: Array<{ uri: string; title: string }> | undefined;
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (Array.isArray(groundingChunks) && groundingChunks.length > 0) {
        groundingSources = groundingChunks
          .map((gc: any) => gc.web)
          .filter(Boolean)
          .map((w: any) => ({ uri: w.uri, title: w.title || w.uri }));
      }

      sendEvent({
        chunk: chunkText,
        groundingSources,
      });
    }

    sendEvent({ done: true });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const errorMessage =
      error?.message || 'An unexpected error occurred while processing your request.';
    sendEvent({ error: errorMessage });
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 AI Studio Chat Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
