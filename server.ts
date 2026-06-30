/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check API
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Create lazy initialization of Gemini Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not configured.');
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// System Instruction for screenwriting styling and structure
const SYSTEM_INSTRUCTION = `You are an elite Hollywood script coordinator and professional screenplay formatting expert. Your task is to analyze user-provided raw dialogue, messy drafts, outlines, transcriptions, or unstructured screenplay pages, and convert them into pristine, industry-standard US Screenplay elements.

You must categorize and structure every part of the text into the following exact element types:
1. 'Scene Heading': Also known as a Slugline. Must start with INT. or EXT., followed by location, and time of day (e.g., INT. OFFICE - DAY). Must be fully capitalized.
2. 'Action': Descriptions of what is happening or scene settings in present tense, active voice (e.g., JOE taps on his computer keyboard in panic). Character names must be in ALL-CAPS when FIRST introduced in Action elements, but standard casing later.
3. 'Character': The name of the speaking character, capitalized. Must precede Dialogue.
4. 'Dialogue': The spoken words corresponding to a Character.
5. 'Parenthetical': Directives for physical actions or vocal pacing, lowercase, in parentheses (e.g., "(nervous)" or "(smiling)"), placed between Character name and Dialogue elements or within a dialogue sequence.
6. 'Transition': Horizontal aligned scene markers (e.g., DISSOLVE TO:, FADE OUT., CUT TO:).
7. 'Shot': Specific camera angles (e.g., CLOSE UP ON CELLPHONE or ANGLE ON THE WINDOW).

Rules:
- If the draft doesn't have names, make up contextually appropriate names.
- Insert necessary Action descriptions to help explain character gestures or setup scenes if they are omitted.
- Group Dialogue with its matching Character.
- Infer scene headers where they logical belong if not stated.
- Do not write any external notes, disclaimers, explanations, or pleasantries in the JSON description. Output must only be the parsed screenplay elements.`;

// Screenplay conversion endpoint
app.post('/api/format', async (req, res) => {
  try {
    const { draftText, additionalInstructions, formatOption } = req.body;

    if (!draftText || draftText.trim() === '') {
      return res.status(400).json({ error: 'Draft text is required.' });
    }

    const ai = getGeminiClient();

    let userPrompt = `Here is the raw text to convert into professional screenplay format:\n\n${draftText}`;
    
    if (formatOption) {
      userPrompt += `\n\nProcess and edit the script with this formatting approach: "${formatOption}".`;
    }
    
    if (additionalInstructions && additionalInstructions.trim() !== '') {
      userPrompt += `\n\nAdditional instructions or adjustments requested:\n${additionalInstructions}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: 'The inferred or supplied title of the scene/script.'
            },
            author: {
              type: Type.STRING,
              description: 'The inferred or supplied author name, or "Writer" if unknown.'
            },
            elements: {
              type: Type.ARRAY,
              description: 'The strict sequence of screenplay elements in exact layout order.',
              items: {
                type: Type.OBJECT,
                properties: {
                  type: {
                    type: Type.STRING,
                    description: 'The element type. Must be one of: "Scene Heading", "Action", "Character", "Dialogue", "Parenthetical", "Transition", "Shot".',
                  },
                  text: {
                    type: Type.STRING,
                    description: 'The exact lines or values of this script element. Be faithful to original text meaning.'
                  }
                },
                required: ['type', 'text']
              }
            }
          },
          required: ['title', 'author', 'elements']
        }
      }
    });

    const bodyText = response.text;
    if (!bodyText) {
      throw new Error('Received an empty response from Gemini.');
    }

    const screenplayData = JSON.parse(bodyText.trim());
    return res.json({ success: true, screenplay: screenplayData });
  } catch (error: any) {
    console.error('Error formatting script:', error);
    return res.status(500).json({
      error: error.message || 'An unexpected server error occurred while processing the screenplay.'
    });
  }
});

async function startServer() {
  // Vite integration in development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
