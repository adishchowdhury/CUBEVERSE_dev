import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import { PassThrough } from 'stream';

dotenv.config();

let elevenlabs: ElevenLabsClient | null = null;

function getElevenLabs() {
  if (!elevenlabs) {
    const key = process.env.ELEVENLABS_API_KEY;
    if (!key) {
      throw new Error('ELEVENLABS_API_KEY environment variable is required');
    }
    elevenlabs = new ElevenLabsClient({ apiKey: key });
  }
  return elevenlabs;
}

let ai: GoogleGenAI | null = null;

function getAI() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    ai = new GoogleGenAI({ 
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

async function createServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/tts', async (req, res) => {
    try {
      const { text, voiceId = 'JBFqnCBsd6RMkjVDRZzb' } = req.body;
      const client = getElevenLabs();
      const audioStream = await client.textToSpeech.convert(
        voiceId,
        {
          text: text || 'The first move is what sets everything in motion. Everything begins scrambled',
          modelId: 'eleven_multilingual_v2',
          outputFormat: 'mp3_44100_128',
        }
      );
      
      res.setHeader('Content-Type', 'audio/mpeg');
      
      if (audioStream && typeof (audioStream as any).pipe === 'function') {
        (audioStream as any).pipe(res);
      } else {
        // Handle web stream or other stream types
        const reader = (audioStream as any).getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      }
    } catch (err: any) {
      console.error("TTS Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/chat', async (req, res) => {
    try {
        const { prompt } = req.body;
        const ai = getAI();
        const interaction = await ai.interactions.create({
            model: "gemini-3.5-flash",
            input: `You are the Cubeverse Neural Coach, an elite speedcubing expert. 
            CRITICAL: Start every single response with a unique, high-energy motivational quote or encouragement for a speedcuber (e.g., about breaking PB, mastering algorithms, or staying consistent). 
            Then, provide concise, professional, and helpful insights on CFOP/Roux methods, scramble analysis, or cubing history.
            
            User request: ${prompt}`,
        });
        
        let fullOutput = "";
        for (const step of (interaction as any).steps) {
            if (step.type === 'model_output') {
                const textContent = step.content?.find((c: any) => c.type === 'text');
                if (textContent && textContent.text) {
                    fullOutput += textContent.text;
                }
            }
        }
        res.json({ text: fullOutput || "I was unable to generate a response. Please try again." });
    } catch (err: any) {
        console.error("Gemini Error:", err);
        res.status(500).json({ 
            text: `System Alert: Neural link unstable. ${err.message || 'Unknown interference detected.'} Please verify your GEMINI_API_KEY.` 
        });
    }
  });

  app.post('/api/music', async (req, res) => {
    try {
      const { prompt = 'lofi hip hop music for deep focus cubing' } = req.body;
      const client = getElevenLabs();
      
      const audioStream = await client.textToSoundEffects.convert({
        text: prompt,
        durationSeconds: 22, // Max allowed usually
      });
      
      res.setHeader('Content-Type', 'audio/mpeg');
      
      if (audioStream && typeof (audioStream as any).pipe === 'function') {
        (audioStream as any).pipe(res);
      } else {
        const reader = (audioStream as any).getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          res.write(value);
        }
        res.end();
      }
    } catch (err: any) {
      console.error("Music Generation Error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  return app;
}

// For local development and Cloud Run
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  createServer().then(app => {
    const PORT = parseInt(process.env.PORT || "3000", 10);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  });
}

// For Vercel and Netlify serverless functions
const handler = async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};

export { createServer, handler };
export default handler;
