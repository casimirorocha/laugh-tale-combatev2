import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;

// Shared Gemini AI Client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch {
      aiClient = null;
    }
  }
  return aiClient;
}

// In-Memory Cache to eliminate duplicate API requests
const cache = new Map<string, { data: any; expiry: number }>();
function getCached(key: string): any | null {
  const item = cache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data;
  }
  if (item) {
    cache.delete(key);
  }
  return null;
}
function setCached(key: string, data: any, ttlMs: number = 1000 * 60 * 15) {
  cache.set(key, { data, expiry: Date.now() + ttlMs });
}

// Smart Rate-Limiter & Backoff Tracker
let lastApiCallTimestamp = 0;
let backoffUntilTimestamp = 0;
const MIN_INTERVAL_MS = 6000; // Minimum 6s spacing between Gemini calls to stay strictly under rate limits

async function callGeminiSafe<T>(
  prompt: string,
  fallbackFn: () => T,
  cacheKey?: string
): Promise<T> {
  if (cacheKey) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const now = Date.now();
  if (now < backoffUntilTimestamp) {
    // Backing off due to recent quota exhaustion / 429
    return fallbackFn();
  }

  const ai = getAI();
  if (!ai) {
    return fallbackFn();
  }

  if (now - lastApiCallTimestamp < MIN_INTERVAL_MS) {
    // Too fast for rate limits, use high-fidelity procedural generation
    return fallbackFn();
  }

  lastApiCallTimestamp = now;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.8,
      },
    });

    const text = response.text;
    if (text) {
      const parsed = JSON.parse(text) as T;
      if (cacheKey) {
        setCached(cacheKey, parsed);
      }
      return parsed;
    }
    return fallbackFn();
  } catch (err: any) {
    const errStr = String(err).toLowerCase();
    const statusCode = err?.status || err?.code || err?.error?.code;
    if (statusCode === 429 || statusCode === 503 || errStr.includes('quota') || errStr.includes('demand') || errStr.includes('resource_exhausted')) {
      // Exponential backoff for 60 seconds on quota exhaustion
      backoffUntilTimestamp = Date.now() + 60000;
    }
    return fallbackFn();
  }
}

// Procedural One Piece Grand Line Lore Engines
function generateProceduralMatchAnalysis(team1: any, team2: any, stage: any) {
  const t1Leader = team1?.fighters?.[0] || { name: 'Challenger 1', bounty: '฿ 1,000,000,000' };
  const t2Leader = team2?.fighters?.[0] || { name: 'Challenger 2', bounty: '฿ 1,000,000,000' };
  const stageName = stage?.name || 'Marineford Summit Arena';

  const t1Haki = (t1Leader.haki?.conqueror || 50) + (t1Leader.haki?.armament || 50);
  const t2Haki = (t2Leader.haki?.conqueror || 50) + (t2Leader.haki?.armament || 50);

  const t1Prob = Math.min(75, Math.max(25, 50 + Math.round((t1Haki - t2Haki) / 4)));
  const t2Prob = 100 - t1Prob;

  const analysis = `BIG NEWS! The legendary arena at ${stageName} trembles as ${team1.name || t1Leader.name}'s crew faces off against ${team2.name || t2Leader.name}! With total combined bounties reaching into the billions, this King of Fighters tournament clash will reverberate across all Four Blues and the New World!`;

  const keyMatchupFactor = `Conqueror's Haki Willpower & Awakened Devil Fruit Supremacy on ${stageName}`;

  return {
    analysis,
    preMatchHype: analysis,
    keyMatchupFactor,
    keyMatchups: [
      `Haoshoku Clash: Willpower pressure between ${t1Leader.name} and ${t2Leader.name}`,
      `Devil Fruit Mastery vs Advanced Busoshoku (Ryuo) Internal Destruction`,
      `Stage Affinity & Tactical Super Meter Conservation on ${stageName}`
    ],
    tacticalPrediction: `Victory hinges on guard gauge discipline, frame traps during MAX Mode activations, and whoever lands the first devastating Awakened Climax Super!`,
    favoredTeam: t1Prob >= t2Prob ? team1.name : team2.name,
    winProbability: { team1: t1Prob, team2: t2Prob }
  };
}

function getShortFighterName(name?: string): string {
  if (!name) return 'Fighter';
  const clean = name.trim();
  const mapping: Record<string, string> = {
    'Monkey D. Luffy': 'Luffy',
    'Roronoa Zoro': 'Zoro',
    'Vinsmoke Sanji': 'Sanji',
    'Trafalgar D. Water Law': 'Law',
    'Marshall D. Teach': 'Blackbeard',
    'Edward Newgate': 'Whitebeard',
    'Charlotte Katakuri': 'Katakuri',
    'Portgas D. Ace': 'Ace',
    'Donquixote Doflamingo': 'Doflamingo',
    'Bartholomew Kuma': 'Kuma',
    'Dracule Mihawk': 'Mihawk',
    'Rob Lucci': 'Lucci',
    'Boa Hancock': 'Hancock',
    'Sakazuki (Akainu)': 'Akainu',
    'Kuzan (Aokiji)': 'Aokiji',
    'Borsalino (Kizaru)': 'Kizaru',
    'Eustass Kid': 'Kid',
    'Gol D. Roger': 'Roger',
    'Silvers Rayleigh': 'Rayleigh',
    'Kozuki Oden': 'Oden',
    'Tony Tony Chopper': 'Chopper',
    'Marco the Phoenix': 'Marco',
    'Buggy the Clown': 'Buggy',
    'Akainu': 'Akainu',
    'Aokiji': 'Aokiji',
    'Kizaru': 'Kizaru',
    'Blackbeard': 'Blackbeard',
    'Whitebeard': 'Whitebeard',
  };
  if (mapping[clean]) return mapping[clean];
  if (clean.includes('(')) {
    const match = clean.match(/\(([^)]+)\)/);
    if (match && match[1]) return match[1];
  }
  const parts = clean.split(' ');
  return parts[parts.length - 1] || clean;
}

function getSimplifiedMoveName(move?: string): string {
  if (!move) return 'Strike';
  let clean = move
    .replace(/^Gomu Gomu no\s+/i, '')
    .replace(/^Santoryu Ogi:\s+/i, '')
    .replace(/^Santoryu:\s+/i, '')
    .replace(/^Nitoryu:\s+/i, '')
    .replace(/^Ittoryu:\s+/i, '')
    .replace(/^Diable Jambe:\s+/i, '')
    .replace(/^Ifrit Jambe:\s+/i, '')
    .replace(/^Mochi Mochi:\s+/i, '')
    .replace(/^Ogi:\s+/i, '')
    .replace(/^Special:\s+/i, '')
    .replace(/^Ultimate:\s+/i, '')
    .replace(/^Haki:\s+/i, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/["'「」]/g, '')
    .trim();
  
  const words = clean.split(/\s+/);
  if (words.length > 3) {
    clean = words.slice(0, 2).join(' ');
  }
  return clean || 'Strike';
}

function generateProceduralCommentary(body: any) {
  const { lastAction, eventType, comboHits, damageDealt, actorShort, targetShort, shortMove } = body;
  const actor = actorShort || getShortFighterName(lastAction?.actorShortName || lastAction?.actorName);
  const target = targetShort || getShortFighterName(lastAction?.targetShortName || lastAction?.targetName);
  const moveName = shortMove || getSimplifiedMoveName(lastAction?.moveName);
  const dmg = damageDealt || lastAction?.damage || 50;

  let text = '';
  let excitement = 80;
  let highlightTag = eventType || 'STRIKE';

  if (eventType === 'KO') {
    const koLines = [
      `K.O.! ${actor} takes the round!`,
      `Down! ${actor} claims victory!`,
      `Decisive finish by ${actor}!`
    ];
    text = koLines[Math.floor(Math.random() * koLines.length)];
    excitement = 100;
    highlightTag = 'K.O.';
  } else if (eventType === 'HAKI_CLASH') {
    text = `Massive Haki clash between ${actor} and ${target}!`;
    excitement = 95;
    highlightTag = 'HAKI CLASH';
  } else if (eventType === 'SUPER_HIT' || lastAction?.moveType === 'super' || lastAction?.moveType === 'awakening') {
    text = `Huge hit! ${actor} lands ${moveName}!`;
    excitement = 92;
    highlightTag = 'HEAVY HIT';
  } else if (eventType === 'DODGE' || lastAction?.isDodged || lastAction?.isFutureSightDodge) {
    text = `Clean dodge by ${target}!`;
    excitement = 85;
    highlightTag = 'FUTURE SIGHT';
  } else if (eventType === 'GUARD_CRUSH' || lastAction?.isGuardCrush) {
    text = `Guard break! ${target} is open!`;
    excitement = 88;
    highlightTag = 'GUARD CRUSH';
  } else if (eventType === 'CLUTCH_COMEBACK') {
    text = `What a comeback blow by ${actor}!`;
    excitement = 94;
    highlightTag = 'COMEBACK';
  } else if (eventType === 'CRITICAL_HIT' || lastAction?.isCrit) {
    text = `Brutal critical strike by ${actor}!`;
    excitement = 86;
    highlightTag = 'CRITICAL HIT';
  } else {
    text = `Clean strike by ${actor}!`;
    excitement = 70;
    highlightTag = 'STRIKE';
  }

  return {
    commentary: text,
    excitement,
    highlightTag
  };
}

function generateProceduralRecap(body: any) {
  const { winningTeam, mvpFighter, totalRounds, matchResult } = body;
  const teamName = winningTeam || matchResult?.winnerName || 'The Champions';
  const mvp = mvpFighter || matchResult?.mvpFighter || 'The Ace Fighter';
  const rounds = totalRounds || matchResult?.totalRounds || 3;

  return {
    recap: `VICTORY! In a sensational ${rounds}-round King of Fighters championship duel, ${teamName} claimed absolute victory! Standout MVP ${mvp} dominated the neutral ground with ruthless offensive execution.`,
    recapText: `VICTORY! In a sensational ${rounds}-round King of Fighters championship duel, ${teamName} claimed absolute victory! Standout MVP ${mvp} dominated the neutral ground with ruthless offensive execution.`,
    mvpPlayer: mvp,
    mvpReasoning: `Commanded the tempo, converted multiple MAX mode confirmations, and dealt decisive finishing blows.`,
    tacticalInsight: `Superior super meter economy, high-damage punishes on guard breaks, and flawless Haki defense.`,
    tacticalDecidingFactor: `Superior super meter economy, high-damage punishes on guard breaks, and flawless Haki defense.`,
    bountyRewardEstimate: `+฿ 180,000,000`
  };
}

function generateProceduralTrashTalk(fighter1: any, fighter2: any) {
  const f1Name = fighter1?.name || 'Challenger 1';
  const f2Name = fighter2?.name || 'Challenger 2';

  let quote1 = `${f1Name}: "If you stand between me and my dream, I'll blow you away with all my might!"`;
  let quote2 = `${f2Name}: "Big words for someone stepping into my territory. Let's see if your Haki backs it up!"`;

  if (f1Name.includes('Luffy')) {
    quote1 = `Luffy: "I'm Monkey D. Luffy! The man who will become the King of the Pirates!"`;
  } else if (f1Name.includes('Zoro')) {
    quote1 = `Zoro: "Scars on the back are a swordsman's shame. Draw your weapon!"`;
  } else if (f1Name.includes('Kaido')) {
    quote1 = `Kaido: "Worororo! Only Haki transcends all! Show me if you have what it takes to face a Yonko!"`;
  } else if (f1Name.includes('Shanks')) {
    quote1 = `Shanks: "You can pour drinks on me, spit on me... but hurt my friends and you won't walk away."`;
  } else if (f1Name.includes('Akainu')) {
    quote1 = `Akainu: "Evil will be eradicated thoroughly in the name of Absolute Justice!"`;
  }

  if (f2Name.includes('Luffy')) {
    quote2 = `Luffy: "I won't lose to anyone! Gomu Gomu no... let's fight!"`;
  } else if (f2Name.includes('Zoro')) {
    quote2 = `Zoro: "Nine mountains and eight seas... there is nothing I cannot cut!"`;
  } else if (f2Name.includes('Blackbeard')) {
    quote2 = `Blackbeard: "Zehahaha! A man's dream will never die! Darkness swallows everything!"`;
  } else if (f2Name.includes('Mihawk')) {
    quote2 = `Mihawk: "It matters not who you are; my blade will test the depth of your conviction."`;
  }

  return {
    fighter1Quote: quote1,
    fighter2Quote: quote2,
    clashContext: `An epic clash of wills between ${f1Name} and ${f2Name} for Grand Line supremacy!`
  };
}

function generateProceduralVictoryQuote(fighterName: string) {
  let quote = `My ambition knows no bounds! Stand down.`;
  
  if (fighterName.includes('Luffy')) {
    quote = `"I am going to be the King of the Pirates! No matter who stands in my way, I will overcome them!"`;
  } else if (fighterName.includes('Zoro')) {
    quote = `"A swordsman who has never lost a battle of wills... my sword will pave my own road to absolute victory."`;
  } else if (fighterName.includes('Kaido')) {
    quote = `"Worororo! You thought your feeble willpower could stand against a real Yonko?!"`;
  } else if (fighterName.includes('Shanks')) {
    quote = `"You've fought well. Let's make peace now, before any more lives are needlessly lost."`;
  } else if (fighterName.includes('Akainu')) {
    quote = `"Absolute Justice brooks no delay! You have been thoroughly judged and eradicated."`;
  } else if (fighterName.includes('Blackbeard')) {
    quote = `"Zehahaha! A man's dream will never die! The age of darkness begins right now!"`;
  } else if (fighterName.includes('Mihawk')) {
    quote = `"To seek my blade with such fragile conviction is a foolish waste of your life."`;
  } else if (fighterName.includes('Law')) {
    quote = `"The weak do not get to decide how they die. Room... Shambles."`;
  } else if (fighterName.includes('Yamato')) {
    quote = `"I am Kozuki Oden! I will protect this land's freedom with all my spirit!"`;
  } else if (fighterName.includes('Katakuri')) {
    quote = `"I can see the future... and in that future, your defeat was already carved in stone."`;
  } else if (fighterName.includes('Whitebeard')) {
    quote = `"One Piece is real! I have no regrets in my journey."`;
  } else if (fighterName.includes('Ace')) {
    quote = `"Thank you... for loving someone like me! Fire Fist!"`;
  } else if (fighterName.includes('Sabo')) {
    quote = `"I'll inherit Ace's flame and protect his brother with everything I have!"`;
  } else if (fighterName.includes('Kizaru')) {
    quote = `"Ooooh... speed is weight. Have you ever been kicked at the speed of light?"`;
  } else if (fighterName.includes('Aokiji')) {
    quote = `"My justice is a lazy one... but I can still freeze you to the bone."`;
  } else if (fighterName.includes('Crocodile')) {
    quote = `"Water, sand... in the end, you're just another corpse buried in my desert."`;
  } else if (fighterName.includes('Enel')) {
    quote = `"Yahahaha! Fear is what you call God. Suffer my judgment!"`;
  } else if (fighterName.includes('Sanji')) {
    quote = `"A true chef never hurts a lady, but for you... I'll burn you with my Diable Jambe!"`;
  } else if (fighterName.includes('Doflamingo')) {
    quote = `"Fuffuffuffu! The weak cannot dictate the tide of the new era. Let the puppetry begin!"`;
  } else if (fighterName.includes('Garp')) {
    quote = `"You're a hundred years too early to face a Navy Hero! Fist of Love!"`;
  } else if (fighterName.includes('Roger')) {
    quote = `"Inherited will, the destiny of age, and the dreams of people... these cannot be stopped!"`;
  } else if (fighterName.includes('Dragon')) {
    quote = `"Let the wind of revolution guide the world to a new horizon."`;
  } else if (fighterName.includes('Rob Lucci')) {
    quote = `"Dark Justice requires complete elimination of weakness. Shigan!"`;
  }
  return { quote };
}

function generateProceduralFighterTale(team1: any, team2: any, stage: any) {
  const t1Fighters = team1?.fighters || [];
  const t2Fighters = team2?.fighters || [];
  const t1Name = team1?.name || t1Fighters[0]?.name || 'Challengers';
  const t2Name = team2?.name || t2Fighters[0]?.name || 'Opponents';
  const stageName = stage?.name || 'Grand Line Arena';

  const t1Names = t1Fighters.map((f: any) => f.name || '').join(' ').toLowerCase();
  const t2Names = t2Fighters.map((f: any) => f.name || '').join(' ').toLowerCase();

  const isNavy1 = t1Names.includes('akainu') || t1Names.includes('garp') || t1Names.includes('kizaru') || t1Names.includes('aokiji') || t1Names.includes('lucci') || t1Names.includes('smoker');
  const isNavy2 = t2Names.includes('akainu') || t2Names.includes('garp') || t2Names.includes('kizaru') || t2Names.includes('aokiji') || t2Names.includes('lucci') || t2Names.includes('smoker');

  const isYonko1 = t1Names.includes('kaido') || t1Names.includes('shanks') || t1Names.includes('blackbeard') || t1Names.includes('whitebeard') || t1Names.includes('big mom');
  const isYonko2 = t2Names.includes('kaido') || t2Names.includes('shanks') || t2Names.includes('blackbeard') || t2Names.includes('whitebeard') || t2Names.includes('big mom');

  const isSwordsman1 = t1Names.includes('zoro') || t1Names.includes('mihawk') || t1Names.includes('law') || t1Names.includes('shanks');
  const isSwordsman2 = t2Names.includes('zoro') || t2Names.includes('mihawk') || t2Names.includes('law') || t2Names.includes('shanks');

  let rivalryType = 'GRAND LINE DESTINY CLASH';
  let title = `CHRONICLE OF ${t1Name.toUpperCase()} VS ${t2Name.toUpperCase()}`;
  let clashMotto = `"When wills collide on the Grand Line, only one conviction carves history!"`;
  let narrative = `Long ago, the sea promised fortune to those bold enough to stake their lives upon its turbulent tides. Now, at the legendary battleground of ${stageName}, ${t1Name} stands face-to-face with ${t2Name}. Centuries of inherited willpower, ancient devil fruit curses, and unyielding Haki surge toward an inevitable climax. As the war drums resound, the entire New World holds its breath for the clash that will decide the next era.`;

  if ((isNavy1 && !isNavy2) || (!isNavy1 && isNavy2)) {
    rivalryType = 'NAVY JUSTICE VS OUTLAW FREEDOM';
    title = `ABSOLUTE JUSTICE VS THE REBEL TIDE`;
    clashMotto = `"Justice or Freedom — only the victor defines what is right on these seas!"`;
    narrative = `The iron hammer of Navy authority meets the unstoppable surge of pirate rebellion at ${stageName}. For decades, the World Government has sought to suppress the chaotic dreams of the New World, while outlaw captains shatter every chain in pursuit of absolute freedom. As Marine banners wave against pirate flags, no compromise remains — only absolute subjugation or glorious liberation!`;
  } else if (isYonko1 || isYonko2) {
    rivalryType = 'SUPREME YONKO HEAVEN-SPLITTING CLASH';
    title = `DANCE OF THE EMPERORS`;
    clashMotto = `"When two Supreme Conquerors collide, black lightning splits the sky!"`;
    narrative = `The very atmosphere at ${stageName} cracks under the oppressive weight of Haoshoku Haki. Emperors of the Sea, whose mere commands move fleets and shatter nations, engage in a cataclysmic trial of strength. Neither side will yield an inch of territory; every strike threatens to redefine the balance of power across the Four Blues!`;
  } else if (isSwordsman1 && isSwordsman2) {
    rivalryType = 'MASTERS OF THE BLADE';
    title = `WAY OF THE SUPREME SWORDSMAN`;
    clashMotto = `"Nine mountains and eight seas... there is nothing my steel cannot cut!"`;
    narrative = `Scars on the back are a swordsman's ultimate shame. At ${stageName}, master duelists unsheathe their blades in a sacred test of technique, precision, and Busoshoku Ryuo infusion. Beyond wealth and fame, this duel is fought for pure warrior honor, where a single flash of cold steel will determine the world's greatest blade.`;
  }

  return {
    title,
    chapter: `GRAND LINE CHRONICLE #${Math.floor(Math.random() * 800 + 200)}`,
    narrative,
    rivalryType,
    clashMotto,
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      game: 'One Piece: Grand Line Fighter Arcade (KOF Edition)',
      version: '2.5.0',
    });
  });

  // Pre-match analysis & clash prediction
  app.post('/api/match-analysis', async (req: Request, res: Response) => {
    const { team1, team2, matchFormat, stage } = req.body;
    const cacheKey = `analysis_${team1?.name || 't1'}_${team2?.name || 't2'}_${stage?.name || 'st'}`;

    const result = await callGeminiSafe(
      `You are "Big News" Morgans, the sensationalist One Piece news baron and King of Fighters announcer.
Provide a pre-match breakdown for:
Match Format: ${matchFormat || '3v3 KOF Elimination'}
Battlefield: ${stage?.name || 'Grand Line Arena'}
Team 1 (${team1?.name}): ${team1?.fighters?.map((f: any) => `${f.name} [Fruit: ${f.devilFruit?.name || 'None'}, Bounty: ${f.bounty}]`).join(', ')}
Team 2 (${team2?.name}): ${team2?.fighters?.map((f: any) => `${f.name} [Fruit: ${f.devilFruit?.name || 'None'}, Bounty: ${f.bounty}]`).join(', ')}

Return JSON:
- "analysis": (2-3 sentences of explosive hype commentary)
- "preMatchHype": (same as analysis)
- "keyMatchupFactor": (short summary phrase)
- "keyMatchups": (array of 3 distinct bullet points)
- "tacticalPrediction": (1-2 sentences on meter/speed)
- "favoredTeam": (team name)
- "winProbability": {"team1": number, "team2": number}`,
      () => generateProceduralMatchAnalysis(team1, team2, stage),
      cacheKey
    );

    return res.json(result);
  });

  // Live round commentary
  app.post('/api/commentary', async (req: Request, res: Response) => {
    const { fighter1, fighter2, lastAction, eventType, roundNumber, comboHits, damageDealt } = req.body;
    const actorShort = getShortFighterName(lastAction?.actorShortName || lastAction?.actorName);
    const targetShort = getShortFighterName(lastAction?.targetShortName || lastAction?.targetName);
    const shortMove = getSimplifiedMoveName(lastAction?.moveName);

    const result = await callGeminiSafe(
      `You are an authentic fighting game tournament play-by-play ring announcer.
Generate a VERY SHORT, NATURAL, and PUNCHY live reaction (strictly 3 to 7 words maximum).
Rules:
1. ONLY use short character names: Attacker="${actorShort}", Defender="${targetShort}". NEVER use full names (use "${actorShort}" instead of full names).
2. ONLY use the simplified move name: Move="${shortMove}".
3. Do NOT make long speeches. Keep it punchy and immediate.
4. Highlight context: ${eventType} (Damage: ${damageDealt || 0}, Hits: ${comboHits || 1}).

Examples of good style:
- "Huge hit by ${actorShort} with ${shortMove}!"
- "Incredible dodge by ${targetShort}!"
- "Massive Haki clash between ${actorShort} and ${targetShort}!"
- "Brutal counter from ${actorShort}!"
- "Down! ${actorShort} takes the round!"

Return JSON:
- "commentary": (string, 3-7 words max)
- "excitement": (integer 60-100)
- "highlightTag": (short uppercase tag, e.g. "HEAVY HIT", "FUTURE SIGHT", "HAKI CLASH")`,
      () => generateProceduralCommentary({
        ...req.body,
        actorShort,
        targetShort,
        shortMove
      })
    );

    return res.json(result);
  });

  // Character trash talk & pre-fight banter
  app.post('/api/trash-talk', async (req: Request, res: Response) => {
    const { fighter1, fighter2 } = req.body;
    const cacheKey = `talk_${fighter1?.name || 'f1'}_${fighter2?.name || 'f2'}`;

    const result = await callGeminiSafe(
      `Write authentic canon pre-duel dialogue banter before a KOF duel:
Fighter 1: ${fighter1?.name} (${fighter1?.title})
Fighter 2: ${fighter2?.name} (${fighter2?.title})

Return JSON:
- "fighter1Quote": (1 line spoken by Fighter 1)
- "fighter2Quote": (1 line comeback by Fighter 2)
- "clashContext": (1 sentence context)`,
      () => generateProceduralTrashTalk(fighter1, fighter2),
      cacheKey
    );

    return res.json(result);
  });

  // Post-match tactical recap
  app.post('/api/post-match-recap', async (req: Request, res: Response) => {
    const { winningTeam, mvpFighter, totalRounds, matchResult } = req.body;
    const cacheKey = `recap_${winningTeam || matchResult?.winnerName || 'win'}_${mvpFighter || 'mvp'}`;

    const result = await callGeminiSafe(
      `Write a post-fight recap for a KOF tournament match:
Winner: ${winningTeam || matchResult?.winnerName}
MVP: ${mvpFighter || matchResult?.mvpFighter}
Rounds: ${totalRounds || matchResult?.totalRounds || 3}

Return JSON:
- "recap": (2-3 sentences summarizing the finish)
- "recapText": (same as recap)
- "mvpPlayer": (name)
- "mvpReasoning": (reason)
- "tacticalInsight": (tactical factor)
- "tacticalDecidingFactor": (tactical factor)
- "bountyRewardEstimate": (creative string, e.g. "+฿ 180,000,000")`,
      () => generateProceduralRecap(req.body),
      cacheKey
    );

    return res.json(result);
  });

  // Character-specific victory quote endpoint
  app.post('/api/victory-quote', async (req: Request, res: Response) => {
    const { fighterName } = req.body;
    const cacheKey = `victory_quote_${fighterName || 'generic'}`;

    const result = await callGeminiSafe(
      `You are the official chronicler of One Piece battles.
Generate an epic, lore-accurate, canon-authentic victory quote spoken directly by:
Fighter: ${fighterName}

The quote must reflect their deep lore, their personality, and their specific dream (e.g. Luffy wanting to be Pirate King, Zoro being the strongest swordsman, Akainu enforcing Absolute Justice, Katakuri seeing the future, Blackbeard laughing Zehahaha).
Keep it short (1-2 sentences) and highly epic!

Return JSON:
- "quote": (string with quotation marks)`,
      () => generateProceduralVictoryQuote(fighterName || ''),
      cacheKey
    );

    return res.json(result);
  });

  // Procedural & Gemini-powered Fighter Tale Narration
  app.post('/api/fighter-tale', async (req: Request, res: Response) => {
    const { team1, team2, stage } = req.body;
    const cacheKey = `tale_${team1?.name || 't1'}_${team2?.name || 't2'}_${stage?.name || 'st'}`;

    const result = await callGeminiSafe(
      `You are an ancient Grand Line chronicler narration engine for a King of Fighters tournament battle.
Provide a dramatic, lore-rich "Fighter Tale" narration for this matchup:
Team 1 (${team1?.name}): ${team1?.fighters?.map((f: any) => `${f.name} (${f.title || 'Fighter'}) [Bounty: ${f.bounty}]`).join(', ')}
Team 2 (${team2?.name}): ${team2?.fighters?.map((f: any) => `${f.name} (${f.title || 'Fighter'}) [Bounty: ${f.bounty}]`).join(', ')}
Battlefield: ${stage?.name || 'Grand Line Arena'} (${stage?.location || 'New World'})

Analyze their deep One Piece lore, historical rivalries, faction clashes (e.g. Pirates vs Navy/Marines, Revolutionary Army vs World Government, Bounty Hunters vs Outlaws, Yonko vs Worst Generation, Swordsman Pride), or clash of convictions.

Return JSON:
- "title": (Dramatic Tale Title, e.g. "CHRONICLE OF INHERITED WILL & ABSOLUTE JUSTICE")
- "chapter": (e.g. "CHAPTER 1089: DESTINED CLASH AT MARINEFORD")
- "narrative": (A rich, 3-4 sentence dramatic scrolling story describing the lore backdrop, historical tensions, and the fate hanging on this fight)
- "rivalryType": (Short tag e.g. "HISTORICAL RIVALRY", "NAVY vs PIRATE", "YONKO CLASH", "REVOLUTIONARY WAR", "WORST GENERATION")
- "clashMotto": (A punchy 1-line quote/motto for the matchup)`,
      () => generateProceduralFighterTale(team1, team2, stage),
      cacheKey
    );

    return res.json(result);
  });
  app.post('/api/character-tts', async (req: Request, res: Response) => {
    const { text, character, intensity } = req.body;
    
    if (!process.env.GEMINI_API_KEY) {
       return res.status(503).json({ error: "Gemini API key missing for TTS." });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const isAnnouncer = character === 'TournamentAnnouncer' || character === 'Announcer' || character === 'Morgans';
      let promptText = `Say calmly and menacingly in a deep Japanese voice: ${text}`;
      
      if (isAnnouncer) {
        if (intensity === 'aggressive') {
          promptText = `Shout aggressively with electrifying excitement, maximum hype, and commanding fighting game ring authority: ${text}`;
        } else if (intensity === 'calm') {
          promptText = `Speak calmly, observationally, and analytically with quiet confidence as a fight commentator: ${text}`;
        } else {
          promptText = `Announce with fighting game ring authority and high energy: ${text}`;
        }
      }
      
      const voiceName = isAnnouncer ? 'Fenrir' : 'Charon';

      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: promptText }] }],
        config: {
          responseModalities: ["AUDIO"],
          speechConfig: {
            // 'Fenrir', 'Puck', 'Charon', 'Kore', 'Zephyr'
            voiceConfig: { prebuiltVoiceConfig: { voiceName } },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({ audioBase64: base64Audio, mimeType: 'audio/pcm;rate=24000' });
      } else {
        throw new Error("No audio returned from Gemini.");
      }
    } catch (error: any) {
      const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
      if (isQuotaError) {
        console.warn("Gemini TTS Quota exceeded. Returning graceful fallback flag.");
        return res.json({ fallback: true, error: "TTS Quota exceeded" });
      }
      console.error("Gemini TTS Error:", error);
      return res.status(500).json({ error: "Failed to generate TTS audio." });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Grand Line Fighter Arcade Server] Running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
