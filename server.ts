import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Initialize GoogleGenAI SDK server-side
  let ai: GoogleGenAI | null = null;
  if (process.env.GEMINI_API_KEY) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI:', e);
    }
  }

  // API endpoint for Gemini intent parsing & action structuring
  app.post('/api/gemini/parse-intent', async (req, res) => {
    try {
      const { prompt, currentContext } = req.body;

      if (!prompt || typeof prompt !== 'string') {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      // If Gemini API is available on server
      if (ai && process.env.GEMINI_API_KEY) {
        const systemPrompt = `You are the in-app AI Assistant for the Personal Multi-Purpose Command Center ("Obsidian Sanctuary").
Your task is to classify user intent, extract structured parameters for actions, and detect any schedule conflicts.
You NEVER write directly to the database. You only produce structured draft proposals for user confirmation.

Allowed Action Intents:
1. CREATE_TODO: parameters: { title: string, date?: string (YYYY-MM-DD), timeLimit?: string (HH:mm), priority?: 'high'|'medium'|'low' }
2. CREATE_SCHEDULE: parameters: { day: string ('Senin'|'Selasa'|'Rabu'|'Kamis'|'Jumat'|'Sabtu'|'Minggu'), startTime: string (HH:mm), endTime: string (HH:mm), subject: string, room?: string }
3. CREATE_EXPENSE: parameters: { amount: number, category: string, description: string, date?: string }
4. CREATE_GYM_SESSION: parameters: { exerciseName: string, sets: number, reps: number, restSeconds: number, targetNote?: string }
5. GENERAL_QUERY: parameters: { query: string, advice: string }

Current teaching schedules:
${JSON.stringify(currentContext?.teachingSchedules || [])}

Rules:
- If a schedule or task overlaps with an existing permanent teaching schedule, set hasConflict = true and describe the conflict warning.
- Return structured JSON matching the schema.`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: `User request: "${prompt}". Today is: ${currentContext?.date || new Date().toISOString().split('T')[0]}.`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  intent: {
                    type: Type.STRING,
                    description: 'One of CREATE_TODO, CREATE_SCHEDULE, CREATE_EXPENSE, CREATE_GYM_SESSION, GENERAL_QUERY',
                  },
                  confidence: { type: Type.NUMBER },
                  summary: { type: Type.STRING, description: 'Short summary of the action in Indonesian' },
                  parameters: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      date: { type: Type.STRING },
                      timeLimit: { type: Type.STRING },
                      day: { type: Type.STRING },
                      startTime: { type: Type.STRING },
                      endTime: { type: Type.STRING },
                      subject: { type: Type.STRING },
                      amount: { type: Type.NUMBER },
                      category: { type: Type.STRING },
                      description: { type: Type.STRING },
                      exerciseName: { type: Type.STRING },
                      sets: { type: Type.INTEGER },
                      reps: { type: Type.INTEGER },
                      restSeconds: { type: Type.INTEGER },
                      advice: { type: Type.STRING },
                    },
                  },
                  hasConflict: { type: Type.BOOLEAN },
                  conflictWarning: { type: Type.STRING },
                  requiresConfirmation: { type: Type.BOOLEAN },
                },
                required: ['intent', 'summary', 'parameters', 'hasConflict', 'requiresConfirmation'],
              },
            },
          });

          if (response.text) {
            const parsed = JSON.parse(response.text);
            return res.json(parsed);
          }
        } catch (apiError) {
          console.error('Gemini API call error, falling back to local heuristic:', apiError);
        }
      }

      // Intelligent Local Heuristic Parser (Offline / Fallback Guarantee)
      const p = prompt.toLowerCase();
      let result = {
        intent: 'GENERAL_QUERY',
        confidence: 0.9,
        summary: 'Catatan umum',
        parameters: { advice: 'Tercatat dalam asisten.' } as Record<string, any>,
        hasConflict: false,
        conflictWarning: '',
        requiresConfirmation: true,
      };

      if (p.includes('beli') || p.includes('bayar') || p.includes('pengeluaran') || p.includes('rp') || p.includes('ribu') || p.includes('makan') || p.includes('bensin')) {
        const amountMatch = prompt.match(/\d+[\d.,]*/);
        const amount = amountMatch ? parseInt(amountMatch[0].replace(/[.,]/g, ''), 10) : 50000;
        let cat = 'Makan';
        if (p.includes('bensin')) cat = 'Bensin';
        else if (p.includes('gym')) cat = 'Gym';
        else if (p.includes('spaylater') || p.includes('cicilan')) cat = 'SPayLater';
        else if (p.includes('laptop')) cat = 'Tagihan Laptop';

        result = {
          intent: 'CREATE_EXPENSE',
          confidence: 0.92,
          summary: `Catat pengeluaran Rp ${amount.toLocaleString('id-ID')} untuk ${cat}`,
          parameters: {
            amount,
            category: cat,
            description: prompt,
            date: new Date().toISOString().split('T')[0],
          },
          hasConflict: false,
          conflictWarning: '',
          requiresConfirmation: true,
        };
      } else if (p.includes('ngajar') || p.includes('jadwal') || p.includes('kelas') || p.includes('kuliah') || p.includes('jam')) {
        let day = 'Senin';
        ['senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu', 'minggu'].forEach(d => {
          if (p.includes(d)) day = d.charAt(0).toUpperCase() + d.slice(1);
        });

        const timeMatches = prompt.match(/\b\d{1,2}[:.]\d{2}\b/g) || ['09:00', '11:00'];
        const startTime = timeMatches[0]?.replace('.', ':') || '09:00';
        const endTime = timeMatches[1]?.replace('.', ':') || '11:00';

        // Check conflict with permanent teaching schedule
        let hasConflict = false;
        let conflictWarning = '';
        if (currentContext?.teachingSchedules) {
          const conflict = currentContext.teachingSchedules.find((s: any) =>
            s.day.toLowerCase() === day.toLowerCase() &&
            ((startTime >= s.startTime && startTime < s.endTime) || (endTime > s.startTime && endTime <= s.endTime))
          );
          if (conflict) {
            hasConflict = true;
            conflictWarning = `Peringatan: Jadwal bentrok dengan jam mengajar permanen "${conflict.subject}" (${conflict.day} ${conflict.startTime} - ${conflict.endTime})`;
          }
        }

        result = {
          intent: 'CREATE_SCHEDULE',
          confidence: 0.88,
          summary: `Jadwal Baru: ${day} pukul ${startTime} - ${endTime}`,
          parameters: {
            day,
            startTime,
            endTime,
            subject: prompt.replace(/jadwal|ngajar|jam/gi, '').trim() || 'Sesi Mengajar / Kelas Tambahan',
          },
          hasConflict,
          conflictWarning,
          requiresConfirmation: true,
        };
      } else if (p.includes('gym') || p.includes('latihan') || p.includes('calf') || p.includes('carry') || p.includes('plank') || p.includes('dead hang')) {
        let exerciseName = 'Seated Calf Raise';
        if (p.includes('suitcase')) exerciseName = 'Suitcase Carry';
        else if (p.includes('plank')) exerciseName = 'Side Plank';
        else if (p.includes('treadmill') || p.includes('incline')) exerciseName = 'Incline Treadmill';
        else if (p.includes('dead hang')) exerciseName = 'Dead Hang';
        else if (p.includes('forearm') || p.includes('brachialis')) exerciseName = 'Target Forearm / Brachialis';

        result = {
          intent: 'CREATE_GYM_SESSION',
          confidence: 0.95,
          summary: `Latihan Gym: ${exerciseName}`,
          parameters: {
            exerciseName,
            sets: 3,
            reps: 12,
            restSeconds: 90,
            targetNote: exerciseName === 'Seated Calf Raise' ? 'Regangan maksimal di soleus' : 'Fokus form dan kontrol gerakan',
          },
          hasConflict: false,
          conflictWarning: '',
          requiresConfirmation: true,
        };
      } else {
        // Default to To-Do task
        result = {
          intent: 'CREATE_TODO',
          confidence: 0.85,
          summary: `Tugas Baru: ${prompt}`,
          parameters: {
            title: prompt,
            date: new Date().toISOString().split('T')[0],
            timeLimit: '18:00',
            priority: p.includes('urgent') || p.includes('penting') ? 'high' : 'medium',
          },
          hasConflict: false,
          conflictWarning: '',
          requiresConfirmation: true,
        };
      }

      return res.json(result);
    } catch (error: any) {
      console.error('Error parsing intent:', error);
      res.status(500).json({ error: error.message || 'Server error' });
    }
  });

  // Vite integration in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Command Center server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
