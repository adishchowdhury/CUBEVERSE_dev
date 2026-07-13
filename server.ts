import express from 'express';
import path from 'path';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
import snowflakePkg from 'snowflake-sdk';
const snowflake = (snowflakePkg as any).default || snowflakePkg;
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
let snowflakeConnection: any = null;

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

function getSnowflake() {
  if (!snowflakeConnection) {
    snowflakeConnection = snowflake.createConnection({
      account: process.env.SNOWFLAKE_ACCOUNT || '',
      username: process.env.SNOWFLAKE_USERNAME || '',
      password: process.env.SNOWFLAKE_PASSWORD || '',
      warehouse: process.env.SNOWFLAKE_WAREHOUSE || '',
      database: process.env.SNOWFLAKE_DATABASE || '',
      schema: process.env.SNOWFLAKE_SCHEMA || '',
      role: process.env.SNOWFLAKE_ROLE || '',
    });
  }
  return snowflakeConnection;
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
        const { prompt, history = [] } = req.body;
        const ai = getAI();
        
        // Format history for @google/genai SDK
        const formattedContents = [
          ...history.map((msg: any) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          })),
          // Ensure the latest prompt is included if not already at the end of history
          ...(history.length === 0 || history[history.length - 1].text !== prompt ? [{
            role: 'user',
            parts: [{ text: prompt }]
          }] : [])
        ];

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formattedContents,
            config: {
                systemInstruction: `You are the Cubeverse Neural Coach, an elite speedcubing expert. 
                Keep your responses natural, conversational, energetic, and highly concise (strictly under 3 sentences where possible) because they are designed to be converted into speech via ElevenLabs.
                CRITICAL: Never use markdown formatting like asterisks (** or *), hashes, bullet points, or numbered lists in your output as they disrupt the voice engine. 
                Do NOT start every message with a generic greeting, repetitive motivational quote, or boilerplate welcoming. Jump straight into the helpful, dynamic, and elite advice or discussion.`
            }
        });
        
        const textOutput = response.text || "I was unable to generate a response. Please try again.";
        res.json({ text: textOutput });
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

  app.get('/api/analytics/global', async (req, res) => {
    try {
        const hasSnowflake = process.env.SNOWFLAKE_ACCOUNT && process.env.SNOWFLAKE_USERNAME;
        
        const demoData = {
            source: 'demo_fallback',
            stats: {
                total_solves: 124500,
                avg_tps: 8.42,
                global_avg_time: 14.22,
                top_method: 'CFOP (Advanced)',
                active_cubers: 1240,
                neural_optimization_score: 94
            }
        };

        if (!hasSnowflake) {
            return res.json(demoData);
        }

        const connection = getSnowflake();
        
        // Only connect if not already active
        if (!connection.isUp()) {
            try {
                await new Promise((resolve, reject) => {
                    connection.connect((err, conn) => {
                        if (err) {
                            if (err.message && err.message.includes('Already connected')) {
                                resolve(conn);
                            } else {
                                reject(err);
                            }
                        } else {
                            resolve(conn);
                        }
                    });
                });
            } catch (connErr: any) {
                if (!connErr.message.includes('Already connected')) {
                    throw connErr;
                }
            }
        }

        // Try to fetch real stats, fallback to a "ping" check if table doesn't exist
        let results: any[] = [];
        try {
            results = await new Promise((resolve, reject) => {
                connection.execute({
                    sqlText: 'SELECT * FROM GLOBAL_SOLVE_STATS ORDER BY RECORD_DATE DESC LIMIT 1',
                    complete: (err, stmt, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    }
                });
            });
        } catch (sqlErr: any) {
            console.log("Analytics table not found, verifying connection via version check...");
            // Verify connection is alive even if table is missing
            await new Promise((resolve, reject) => {
                connection.execute({
                    sqlText: 'SELECT CURRENT_VERSION()',
                    complete: (err) => err ? reject(err) : resolve(true)
                });
            });
            return res.json(demoData);
        }

        if (!results || results.length === 0) {
            return res.json(demoData);
        }

        res.json({
            source: 'snowflake_snowpark',
            data: results[0] || {}
        });

    } catch (err: any) {
        console.error("Snowflake Error:", err);
        
        // If it's a SQL error (like table not found) or connection issue, 
        // fall back to demo data instead of crashing the UI
        res.json({
            source: 'demo_fallback',
            error: err.message,
            stats: {
                total_solves: 124500,
                avg_tps: 8.42,
                global_avg_time: 14.22,
                top_method: 'CFOP (Advanced)',
                active_cubers: 1240,
                neural_optimization_score: 94
            }
        });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import('vite');
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
const isServerless = process.env.VERCEL || process.env.NETLIFY || process.env.FUNCTIONS_EMULATOR;

if (process.env.NODE_ENV !== 'production' || !isServerless) {
  createServer().then(app => {
    const port = process.env.PORT || "3000";
    const PORT = parseInt(port, 10);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }).catch(err => {
    console.error("CRITICAL: Failed to start server:", err);
    process.exit(1);
  });
}

// For Vercel and Netlify serverless functions
const handler = async (req: any, res: any) => {
  const app = await createServer();
  return app(req, res);
};

export { createServer, handler };
export default handler;
