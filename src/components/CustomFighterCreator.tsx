import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft, Sparkles, Plus, Trash2, Check, Save, Shield, Swords, Zap, Flame, RefreshCw, CheckCircle2 } from 'lucide-react';
import { Fighter, Move, DevilFruitInfo, HakiAuraConfig, CustomFighterDraft } from '../types/fighter';
import { saveCustomFighter, getCustomFighterDraft, saveCustomFighterDraft, clearCustomFighterDraft } from '../utils/storage';
import { HakiAuraEditor } from './HakiAuraEditor';

interface CustomFighterCreatorProps {
  onBack: () => void;
  onFighterCreated: (fighter: Fighter) => void;
}

const DEFAULT_MOVES: Move[] = [
  {
    id: 'custom_m1',
    name: 'Tempest Mirage Strike',
    nameJP: '暴風・幻影撃',
    type: 'basic',
    baseDamage: 75,
    missRate: 4,
    critBonus: 5,
    meterCost: 0,
    guardDamage: 14,
    meterGain: 25,
    cooldown: 0,
    description: 'Rapid high-speed wind blade thrust.',
  },
  {
    id: 'custom_m2',
    name: 'Ryuo Gale Cutter',
    nameJP: '竜王・疾風斬',
    type: 'special',
    baseDamage: 125,
    missRate: 6,
    critBonus: 10,
    meterCost: 0,
    guardDamage: 24,
    meterGain: 35,
    cooldown: 1,
    hakiInfused: true,
    description: 'Armament-hardened vortex slice that shreds armor.',
  },
  {
    id: 'custom_m3',
    name: 'Sky-Splitter Cyclone Thrust',
    nameJP: '裂空・旋風突',
    type: 'command',
    baseDamage: 155,
    missRate: 8,
    critBonus: 15,
    meterCost: 0,
    guardDamage: 32,
    meterGain: 40,
    cooldown: 2,
    hakiInfused: true,
    description: 'Infuses Conqueror Haki with high-pressure air pressure.',
  },
  {
    id: 'custom_m4',
    name: 'EX Hurricane Overdrive',
    nameJP: 'EX・颶風暴撃',
    type: 'ex',
    baseDamage: 210,
    missRate: 5,
    critBonus: 20,
    guardDamage: 45,
    meterGain: 10,
    meterCost: 100,
    cooldown: 2,
    hakiInfused: true,
    description: 'EX Cancel move that launches opponent into a vacuum tornado.',
  },
  {
    id: 'custom_m5',
    name: 'MAX: Void Typhoon Cataclysm',
    nameJP: '極大・虚空台風天変地異',
    type: 'super',
    baseDamage: 360,
    missRate: 2,
    critBonus: 25,
    guardDamage: 75,
    meterGain: 0,
    meterCost: 200,
    cooldown: 3,
    hakiInfused: true,
    cutinEffect: 'Atmosphere tears with black lightning vortex',
    description: 'Unleashes the full power of Awakened Wind and Conqueror Supremacy.',
  },
];

const DEFAULT_HAKI_AURA: HakiAuraConfig = {
  color: '#38bdf8',
  secondaryColor: '#0284c7',
  sparkEffect: 'Lightning',
  particleIntensity: 75,
  particleSpeed: 1.1,
  auraRadius: 105,
  auraOpacity: 0.8,
  pulseSpeed: 1.1,
  conquerorLightningColor: '#a855f7',
  armamentArmorTexture: 'ryuo_glow',
  observationPulseStyle: 'future_sight_red',
  specialEdgeFlashColor: 'purple',
  visualStyle: 'modern_glow',
};

export const CustomFighterCreator: React.FC<CustomFighterCreatorProps> = ({
  onBack,
  onFighterCreated,
}) => {
  // Check for auto-saved cached draft
  const cachedDraft = useRef<CustomFighterDraft | null>(getCustomFighterDraft()).current;
  const [isDraftRestored, setIsDraftRestored] = useState<boolean>(Boolean(cachedDraft));
  const [saveStatus, setSaveStatus] = useState<string>(cachedDraft ? 'Draft restored from cache' : 'Auto-save ready');
  const isInitialMount = useRef<boolean>(true);

  const [name, setName] = useState<string>(cachedDraft?.name ?? 'Silver Fox Jin');
  const [epithet, setEpithet] = useState<string>(cachedDraft?.epithet ?? 'Shadow Blade of Elbaf');
  const [affiliation, setAffiliation] = useState<string>(cachedDraft?.affiliation ?? 'Revolutionary Army');
  const [rank, setRank] = useState<string>(cachedDraft?.rank ?? 'Commander');
  const [role, setRole] = useState<string>(cachedDraft?.role ?? 'Swordsman');
  const [fightingStyle, setFightingStyle] = useState<string>(cachedDraft?.fightingStyle ?? 'Black Lightning Dual Blade');
  const [bounty, setBounty] = useState<number>(cachedDraft?.bounty ?? 1450000000);
  const [age, setAge] = useState<number>(cachedDraft?.age ?? 27);
  const [experienceYears, setExperienceYears] = useState<number>(cachedDraft?.experienceYears ?? 12);
  const [avatarIcon, setAvatarIcon] = useState<string>(cachedDraft?.avatarIcon ?? '⚡');
  const [themeColor, setThemeColor] = useState<string>(cachedDraft?.themeColor ?? '#38bdf8');
  const [quote, setQuote] = useState<string>(cachedDraft?.quote ?? 'The tides of destiny cannot be chained!');

  // Voice & Audio
  const [voiceLang, setVoiceLang] = useState<'ja' | 'en' | 'pt'>(cachedDraft?.voiceLang ?? 'ja');
  const [voicePitch, setVoicePitch] = useState<number>(cachedDraft?.voicePitch ?? 1.0);
  const [voiceRate, setVoiceRate] = useState<number>(cachedDraft?.voiceRate ?? 1.0);
  const [customClips, setCustomClips] = useState<Record<string, string>>(cachedDraft?.customClips ?? {});
  const [tauntPT, setTauntPT] = useState<string>(cachedDraft?.tauntPT ?? 'Sinta o poder do meu Haki!');

  // Stats
  const [maxHp, setMaxHp] = useState<number>(cachedDraft?.maxHp ?? 950);
  const [attack, setAttack] = useState<number>(cachedDraft?.attack ?? 92);
  const [defense, setDefense] = useState<number>(cachedDraft?.defense ?? 85);
  const [speed, setSpeed] = useState<number>(cachedDraft?.speed ?? 94);
  const [critRate, setCritRate] = useState<number>(cachedDraft?.critRate ?? 18);

  // Haki
  const [conqueror, setConqueror] = useState<number>(cachedDraft?.conqueror ?? 88);
  const [armament, setArmament] = useState<number>(cachedDraft?.armament ?? 92);
  const [observation, setObservation] = useState<number>(cachedDraft?.observation ?? 95);
  
  // Haki Aura Customization
  const [hakiAura, setHakiAura] = useState<HakiAuraConfig>(cachedDraft?.hakiAura ?? DEFAULT_HAKI_AURA);

  // Devil Fruit
  const [hasFruit, setHasFruit] = useState<boolean>(cachedDraft?.hasFruit ?? true);
  const [fruitName, setFruitName] = useState<string>(cachedDraft?.fruitName ?? 'Kaze Kaze no Mi (Wind Fruit)');
  const [fruitType, setFruitType] = useState<'Paramecia' | 'Logia' | 'Zoan' | 'Ancient Zoan' | 'Mythical Zoan'>(
    cachedDraft?.fruitType ?? 'Logia'
  );
  const [fruitAwakening, setFruitAwakening] = useState<'None' | 'Partial' | 'Awakened'>(
    cachedDraft?.fruitAwakening ?? 'Awakened'
  );
  const [fruitPerk, setFruitPerk] = useState<string>(
    cachedDraft?.fruitPerk ?? 'Wind intangibility and razor atmospheric slicing.'
  );

  // Moveset (5 moves)
  const [moves, setMoves] = useState<Move[]>(cachedDraft?.moves ?? DEFAULT_MOVES);

  // Build current draft object snapshot
  const buildCurrentDraft = useCallback((): CustomFighterDraft => ({
    name,
    epithet,
    affiliation,
    rank,
    role,
    fightingStyle,
    bounty,
    age,
    experienceYears,
    avatarIcon,
    themeColor,
    quote,
    voiceLang,
    voicePitch,
    voiceRate,
    customClips,
    tauntPT,
    maxHp,
    attack,
    defense,
    speed,
    critRate,
    conqueror,
    armament,
    observation,
    hakiAura,
    hasFruit,
    fruitName,
    fruitType,
    fruitAwakening,
    fruitPerk,
    moves,
  }), [
    name, epithet, affiliation, rank, role, fightingStyle, bounty, age, experienceYears,
    avatarIcon, themeColor, quote, voiceLang, voicePitch, voiceRate, customClips, tauntPT,
    maxHp, attack, defense, speed, critRate, conqueror, armament, observation, hakiAura,
    hasFruit, fruitName, fruitType, fruitAwakening, fruitPerk, moves
  ]);

  // Sync draft to browser cache (localStorage) automatically
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      const draft = buildCurrentDraft();
      saveCustomFighterDraft(draft);
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSaveStatus(`Auto-saved (${timeStr})`);
    }, 400);

    return () => clearTimeout(timer);
  }, [buildCurrentDraft]);

  // Window beforeunload safety sync: ensure last-second keystrokes are committed
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveCustomFighterDraft(buildCurrentDraft());
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [buildCurrentDraft]);

  const handleResetDraft = () => {
    clearCustomFighterDraft();
    setIsDraftRestored(false);
    setName('Silver Fox Jin');
    setEpithet('Shadow Blade of Elbaf');
    setAffiliation('Revolutionary Army');
    setRank('Commander');
    setRole('Swordsman');
    setFightingStyle('Black Lightning Dual Blade');
    setBounty(1450000000);
    setAge(27);
    setExperienceYears(12);
    setAvatarIcon('⚡');
    setThemeColor('#38bdf8');
    setQuote('The tides of destiny cannot be chained!');
    setVoiceLang('ja');
    setVoicePitch(1.0);
    setVoiceRate(1.0);
    setCustomClips({});
    setTauntPT('Sinta o poder do meu Haki!');
    setMaxHp(950);
    setAttack(92);
    setDefense(85);
    setSpeed(94);
    setCritRate(18);
    setConqueror(88);
    setArmament(92);
    setObservation(95);
    setHakiAura(DEFAULT_HAKI_AURA);
    setHasFruit(true);
    setFruitName('Kaze Kaze no Mi (Wind Fruit)');
    setFruitType('Logia');
    setFruitAwakening('Awakened');
    setFruitPerk('Wind intangibility and razor atmospheric slicing.');
    setMoves(DEFAULT_MOVES);
    setSaveStatus('Draft reset to default');
  };

  const ICONS = ['⚡', '⚔️', '🔥', '🐉', '🌪️', '❄️', '🥊', '🦅', '🐺', '👑', '💀'];

  const handleSaveFighter = () => {
    const newFighter: Fighter = {
      id: `custom_${Date.now()}`,
      name,
      epithet,
      japaneseName: 'カスタム海賊',
      affiliation: affiliation as any,
      rank: rank as any,
      role,
      fightingStyle: fightingStyle as any,
      bounty,
      age,
      experienceYears,
      winRecord: { wins: 0, losses: 0, draws: 0 },
      haki: {
        conqueror,
        armament,
        observation,
      },
      hakiAura,
      devilFruit: hasFruit
        ? {
            name: fruitName,
            japaneseName: '風の能力',
            type: fruitType,
            awakening: fruitAwakening,
            passivePerk: fruitPerk,
          }
        : null,
      stats: {
        maxHp,
        attack,
        defense,
        speed,
        critRate,
      },
      moves,
      clashQuote: quote,
      winQuote: 'The dawn of a new era is unstoppable!',
      loseQuote: 'This is not where my journey ends...',
      themeColor,
      secondaryColor: '#0284c7',
      avatarIcon,
      isCustom: true,
      voiceProfile: {
        language: voiceLang,
        pitch: voicePitch,
        rate: voiceRate,
        isSynthesized: true,
        customClips: customClips,
      },
      tauntQuotePT: tauntPT,
    };

    saveCustomFighter(newFighter);
    clearCustomFighterDraft();
    onFighterCreated(newFighter);
  };

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-y-auto font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto w-full my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ROSTER</span>
          </button>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Local Storage Sync Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-700/80 text-[11px] text-zinc-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-emerald-400 font-semibold">{saveStatus}</span>
            </div>

            {isDraftRestored && (
              <button
                onClick={handleResetDraft}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-zinc-800/80 hover:bg-zinc-700 border border-zinc-700 text-[11px] text-zinc-400 hover:text-amber-300 transition"
                title="Discard cached draft and reset to default template"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Reset Draft</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              <span className="font-['Bebas_Neue'] text-lg tracking-wider text-emerald-400">
                CUSTOM GRAND LINE FIGHTER WORKSHOP
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Identity & Lore */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 shadow-xl space-y-4">
          <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400 block">
            1. FIGHTER IDENTITY & DOSSIER
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Fighter Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs font-bold text-white outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Epithet / Title</label>
              <input
                type="text"
                value={epithet}
                onChange={(e) => setEpithet(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Affiliation / Crew</label>
              <input
                type="text"
                value={affiliation}
                onChange={(e) => setAffiliation(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Rank / Grade</label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Bounty (฿ Berries)</label>
              <input
                type="number"
                value={bounty}
                onChange={(e) => setBounty(Number(e.target.value))}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-amber-300 font-bold outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400">Fighting Style</label>
              <input
                type="text"
                value={fightingStyle}
                onChange={(e) => setFightingStyle(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-200 outline-none"
              />
            </div>
          </div>

          {/* Avatar Icon Selector */}
          <div>
            <label className="text-[10px] font-mono text-zinc-400 block mb-1">Avatar Crest</label>
            <div className="flex items-center gap-2 flex-wrap">
              {ICONS?.map((ico) => (
                <button
                  key={ico}
                  onClick={() => setAvatarIcon(ico)}
                  className={`h-9 w-9 rounded-xl border text-xl flex items-center justify-center transition ${
                    avatarIcon === ico
                      ? 'border-emerald-400 bg-emerald-950/60 scale-105 shadow-md shadow-emerald-500/30'
                      : 'border-zinc-800 bg-zinc-950'
                  }`}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Combat Stats & Haki */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Base Stats */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
            <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block">
              2. COMBAT ATTRIBUTE ALLOCATION
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-zinc-300">
                  <span>MAX HP:</span>
                  <span className="text-emerald-400 font-bold">{maxHp}</span>
                </div>
                <input
                  type="range"
                  min="700"
                  max="1200"
                  value={maxHp}
                  onChange={(e) => setMaxHp(Number(e.target.value))}
                  className="w-full accent-emerald-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300">
                  <span>ATTACK POWER:</span>
                  <span className="text-red-400 font-bold">{attack}</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="115"
                  value={attack}
                  onChange={(e) => setAttack(Number(e.target.value))}
                  className="w-full accent-red-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300">
                  <span>DEFENSE GUARD:</span>
                  <span className="text-blue-400 font-bold">{defense}</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="115"
                  value={defense}
                  onChange={(e) => setDefense(Number(e.target.value))}
                  className="w-full accent-blue-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-zinc-300">
                  <span>SPEED AGILITY:</span>
                  <span className="text-amber-400 font-bold">{speed}</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="115"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Haki Grades */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3">
            <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block">
              3. HAKI PROFICIENCY
            </span>
            <div className="space-y-2 text-xs font-mono">
              <div>
                <div className="flex justify-between text-red-300">
                  <span>Conqueror's (Haoshoku):</span>
                  <span className="font-bold">{conqueror}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={conqueror}
                  onChange={(e) => setConqueror(Number(e.target.value))}
                  className="w-full accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-purple-300">
                  <span>Armament (Busoshoku Ryuo):</span>
                  <span className="font-bold">{armament}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={armament}
                  onChange={(e) => setArmament(Number(e.target.value))}
                  className="w-full accent-purple-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-cyan-300">
                  <span>Observation (Future Sight):</span>
                  <span className="font-bold">{observation}/100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={observation}
                  onChange={(e) => setObservation(Number(e.target.value))}
                  className="w-full accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section 3.5: Dedicated Haki Aura & Idle Stance Studio */}
        <HakiAuraEditor
          value={hakiAura}
          onChange={setHakiAura}
          fighterName={name}
          fighterIcon={avatarIcon}
          epithet={epithet}
          bounty={bounty}
          themeColor={themeColor}
        />

        {/* Section 3: Devil Fruit Assignment */}
        <div className="rounded-2xl border border-purple-800/40 bg-purple-950/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-['Bebas_Neue'] text-sm tracking-wider text-purple-400">
              4. DEVIL FRUIT POWER SYSTEM
            </span>
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300 cursor-pointer">
              <input
                type="checkbox"
                checked={hasFruit}
                onChange={(e) => setHasFruit(e.target.checked)}
                className="accent-purple-500"
              />
              <span>Has Devil Fruit Ability</span>
            </label>
          </div>

          {hasFruit && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] font-mono text-zinc-400">Fruit Name</label>
                <input
                  type="text"
                  value={fruitName}
                  onChange={(e) => setFruitName(e.target.value)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-purple-200 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400">Fruit Type</label>
                <select
                  value={fruitType}
                  onChange={(e) => setFruitType(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-purple-200 outline-none"
                >
                  <option value="Paramecia">Paramecia</option>
                  <option value="Logia">Logia</option>
                  <option value="Zoan">Zoan</option>
                  <option value="Ancient Zoan">Ancient Zoan</option>
                  <option value="Mythical Zoan">Mythical Zoan</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400">Awakening Status</label>
                <select
                  value={fruitAwakening}
                  onChange={(e) => setFruitAwakening(e.target.value as any)}
                  className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-purple-200 outline-none"
                >
                  <option value="None">None</option>
                  <option value="Partial">Partial</option>
                  <option value="Awakened">Awakened</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Voice & Audio Customization */}
        <div className="rounded-2xl border border-blue-800/40 bg-blue-950/10 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="font-['Bebas_Neue'] text-sm tracking-wider text-blue-400">
              5. VOICE & AUDIO ENGINE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] font-mono text-zinc-400 mb-1 block uppercase tracking-tighter">Native Language</label>
              <select
                value={voiceLang}
                onChange={(e) => setVoiceLang(e.target.value as any)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs font-bold text-zinc-100 outline-none focus:border-blue-400"
              >
                <option value="ja">JAPANESE (ORIGINAL ANIME)</option>
                <option value="en">ENGLISH (GLOBAL)</option>
                <option value="pt">PORTUGUESE (BR)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 mb-1 block uppercase tracking-tighter">Pitch Modulation ({voicePitch.toFixed(1)}x)</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voicePitch}
                onChange={(e) => setVoicePitch(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-zinc-400 mb-1 block uppercase tracking-tighter">Speaking Rate ({voiceRate.toFixed(1)}x)</label>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(Number(e.target.value))}
                className="w-full accent-blue-500"
              />
            </div>
          </div>

          <div>
             <label className="text-[10px] font-mono text-zinc-400 mb-1 block uppercase tracking-tighter">Taunt Quote (Portuguese / Provocação)</label>
             <input
                type="text"
                placeholder="Ex: Você nunca vai me vencer!"
                value={tauntPT}
                onChange={(e) => setTauntPT(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 p-2 text-xs text-zinc-300 outline-none focus:border-blue-400"
             />
          </div>

          <div className="pt-2 border-t border-zinc-800">
             <label className="text-[10px] font-mono text-zinc-400 mb-2 block uppercase tracking-tighter">Custom Move Audio Clips (URLs)</label>
             <div className="space-y-2">
               {moves.map((move) => (
                 <div key={move.id} className="flex items-center gap-3 bg-zinc-950 p-2 rounded-lg border border-zinc-900">
                    <span className="text-[9px] font-black text-blue-400 w-24 shrink-0 truncate uppercase">{move.name}</span>
                    <input
                      type="text"
                      placeholder="Audio URL (.mp3 / .wav)"
                      value={customClips[move.id] || ''}
                      onChange={(e) => setCustomClips(prev => ({ ...prev, [move.id]: e.target.value }))}
                      className="flex-1 bg-transparent border-none text-[10px] text-zinc-500 outline-none italic"
                    />
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* Section 5: Move Workshop Overview */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5 space-y-3">
          <span className="font-['Bebas_Neue'] text-sm tracking-wider text-amber-400 block">
            6. MOVE ARSENAL WORKSHOP ({moves?.length} MOVES CONFIGURED)
          </span>
          <div className="space-y-2">
            {moves?.map((m, idx) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs font-mono"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold text-amber-400 uppercase">
                    {m.type}
                  </span>
                  <span className="text-zinc-100 font-semibold">{m.name}</span>
                </div>
                <div className="flex items-center gap-3 text-zinc-400">
                  <span>{m.baseDamage} DMG</span>
                  <span>{m.missRate}% MISS</span>
                  {m.meterCost && <span className="text-amber-400 font-bold">{m.meterCost} COST</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT SAVE FIGHTER BUTTON */}
        <button
          onClick={handleSaveFighter}
          className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 py-3.5 text-sm font-black text-black tracking-wider shadow-lg shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 transition"
        >
          <Save className="h-4 w-4" />
          <span>SAVE CUSTOM FIGHTER & ADD TO GRAND LINE ROSTER</span>
        </button>
      </div>
    </div>
  );
};
