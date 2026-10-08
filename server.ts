import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  orchestrateSharkChat,
  executePitchTurn,
  generateFinalVerdict
} from './server/geminiService.ts';
import {
  DifficultyLevel,
  InvestorId,
  StartupContextSummary,
  ChatMessage
} from './types/session.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // API Status & Configuration Endpoint
  app.get('/api/status', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      model: 'gemini-3.1-flash-lite',
      mode: Boolean(process.env.GEMINI_API_KEY) ? 'live' : 'demo_fallback'
    });
  });

  // DYNAMIC GEMINI ENGINE: POST /api/pitch/turn
  app.post('/api/pitch/turn', async (req: Request, res: Response) => {
    try {
      const {
        startupData,
        startupName,
        startupNiche,
        startupPitch,
        targetAudience,
        revenueAsk,
        chatHistory = [],
        userLatestMessage,
        selectedSharks = ['tony', 'bill', 'priya', 'raj', 'maya'],
        difficulty = 'Standard VC'
      } = req.body;

      const normalizedStartupData = {
        startupName: startupData?.startupName || startupName || 'Our Startup',
        startupNiche: startupData?.startupNiche || startupNiche || 'Emerging Market Tech',
        startupPitch: startupData?.startupPitch || startupPitch || 'Autonomous innovative solution.',
        targetAudience: startupData?.targetAudience || targetAudience || '',
        revenueAsk: startupData?.revenueAsk || revenueAsk || ''
      };

      const result = await executePitchTurn({
        startupData: normalizedStartupData,
        chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
        userLatestMessage: userLatestMessage || '',
        selectedSharks,
        difficulty
      });

      res.json({
        shark_name: result.shark_name,
        reaction_type: result.reaction_type,
        message_text: result.message_text,
        responding_shark_id: result.responding_shark_id
      });
    } catch (err: any) {
      console.error('API Error in /api/pitch/turn:', err);
      res.status(500).json({ error: err.message || 'Internal error in pitch turn orchestration' });
    }
  });

  // UNIFIED CHAT ROOM PROTOCOL: POST /api/chat/message
  app.post('/api/chat/message', async (req: Request, res: Response) => {
    try {
      const {
        roomId = `room_${Date.now()}`,
        selectedSharks = ['tony', 'bill', 'priya', 'raj', 'maya'],
        difficulty = 'Standard VC',
        startupContext,
        messages = [],
        userMessage
      }: {
        roomId?: string;
        selectedSharks?: InvestorId[];
        difficulty?: DifficultyLevel;
        startupContext: StartupContextSummary;
        messages?: ChatMessage[];
        userMessage?: string;
      } = req.body;

      if (!startupContext || !startupContext.name || !startupContext.elevatorPitch) {
        res.status(400).json({ error: 'Missing required startup context details.' });
        return;
      }

      const result = await orchestrateSharkChat(
        roomId,
        selectedSharks,
        difficulty,
        startupContext,
        messages,
        userMessage
      );

      res.json(result);
    } catch (err: any) {
      console.error('API Error in /api/chat/message:', err);
      res.status(500).json({ error: err.message || 'Internal chat orchestration error' });
    }
  });

  // FINAL VERDICT: POST /api/pitch/final-verdict
  app.post('/api/pitch/final-verdict', async (req: Request, res: Response) => {
    try {
      const { state, pitch } = req.body;
      const result = await generateFinalVerdict(state || {}, pitch);
      res.json(result);
    } catch (err: any) {
      console.error('API Error in /api/pitch/final-verdict:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  });

  // Client Application Mounting
  if (!isProduction) {
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
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.use('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shark Tank Simulator server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
