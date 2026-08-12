import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// Helper to get Gemini Client safely
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured. Please set your Gemini API key in Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
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

// Auto Title Generation API
app.post('/api/title', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `Generate a short, concise 3 to 5 word title for a conversation starting with this user message: "${prompt.slice(0, 300)}". Output ONLY the title text, with no quotes or punctuation.`,
      config: {
        temperature: 0.3,
      },
    });

    const title = response.text?.trim() || 'New Conversation';
    return res.json({ title });
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
      model = 'gemini-3.6-flash',
      systemInstruction = 'You are a helpful, knowledgeable AI assistant. Use markdown formatting effectively.',
      enableSearchGrounding = false,
      temperature = 0.7,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      sendEvent({ error: 'Messages array is required' });
      res.write('data: [DONE]\n\n');
      return res.end();
    }

    const ai = getGeminiClient();

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

      return {
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: parts.length > 0 ? parts : [{ text: '' }],
      };
    });

    // Configure model call options
    const config: any = {
      systemInstruction,
      temperature: Math.max(0, Math.min(1, Number(temperature) || 0.7)),
    };

    if (enableSearchGrounding) {
      config.tools = [{ googleSearch: {} }];
    }

    // Call Gemini generateContentStream
    const responseStream = await ai.models.generateContentStream({
      model: model || 'gemini-3.6-flash',
      contents: formattedContents,
      config,
    });

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
        port: Number(PORT),
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

  app.listen(PORT, () => {
    console.log(`🚀 AI Studio Chat Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
