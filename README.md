# Production-Ready AI Studio Chat Application

An intelligent, full-stack ChatGPT/Claude-style web application built with **React 19**, **TypeScript**, **Tailwind CSS v4**, **Express**, and the official **@google/genai** SDK powered by Google Gemini.

---

## 🌟 Key Features

- 💬 **ChatGPT / Claude-Style Interface**: Clean, responsive layout with real-time streaming AI responses.
- 🎭 **Specialized AI Personas & Models**: Switch between models including **Claude 5.0**, **Claude 4.7**, **ChatGPT 5.6**, **Claude 3.7 Sonnet**, **GPT-4o**, and **Gemini 3.6 Flash**.
- 🔑 **AgentRouter API Key Support**: Configure `AGENTROUTER_API_KEY` in environment variables or directly inside the in-app Preferences/Settings modal to query Claude and ChatGPT models.
- 🚀 **Real-Time Streaming Responses**: Fast, progressive token rendering using Server-Sent Events (SSE).
- 🎨 **Markdown & Code Highlighting**: Full Markdown rendering with syntax highlighting and 1-click **Copy Code** buttons.
- 🌐 **Google Web Search Grounding**: Optional web search grounding mode to retrieve real-time factual citations and source links.
- 📷 **Multimodal Vision Support**: Upload images to ask questions about diagrams, code screenshots, or photos.
- 🎙️ **Voice Input & Speech Output**: Integrated Web Speech API for voice dictation and reading responses aloud.
- 📜 **Conversation History**: Organized chat history grouped by timeframe (Pinned, Today, Yesterday, Previous 7 Days, Older) with rename, pin, and delete features.
- 📑 **Export & Import**: Export conversations to Markdown (`.md`) or JSON (`.json`) files and import saved sessions.
- 🌓 **Dark & Light Mode**: Seamless theme switching with high contrast legibility.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Marked, Highlight.js
- **Backend**: Express (Node.js/TypeScript)
- **AI Engine**: `@google/genai` SDK (`gemini-3.6-flash` default, `gemini-3.1-pro-preview` for complex reasoning)
- **Persistence**: `localStorage` client-side storage

---

## 🚀 Environment Setup

Copy `.env.example` to `.env` and configure your API key:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

### Running Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000` in your browser.

---

## 🛡️ Security

The Gemini API key is managed strictly on the server (`server.ts`) and is **never** exposed to the browser client bundle.
