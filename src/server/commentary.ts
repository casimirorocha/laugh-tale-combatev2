import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function generateCommentary(context: {
  fighterName: string;
  opponentName: string;
  event: 'comeback' | 'long_combo' | 'round_win' | 'clash';
  stats: any;
}): Promise<string> {
  const shortFighter = context.fighterName.split(' ').pop() || context.fighterName;
  const shortOpponent = context.opponentName.split(' ').pop() || context.opponentName;
  const prompt = `Act as an enthusiastic arcade fighting game commentator.
Fighter: ${shortFighter}
Opponent: ${shortOpponent}
Event: ${context.event}
Generate a very short, punchy, natural reaction (max 5 to 7 words). ONLY use their short names (${shortFighter}, ${shortOpponent}).`;

  const response = await ai.models.generateContent({
    model: "gemini-3.8-flash",
    contents: prompt,
  });

  return response.text?.replace(/[#*"\n]/g, '').trim() || "Incredible move!";
}
