import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Search, Shield, Zap, Flame, Swords, Eye, Crown, TrendingUp, Sparkles, Scale, Info, Trophy } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { Fighter } from '../types/fighter';
import { calculateFighterTCP } from '../utils/combatEngine';
import { FighterAvatar } from './FighterAvatar';
import { VictoryPoseModal } from './VictoryPoseModal';
import { VictoryGalleryViewer } from './VictoryGalleryViewer';
import { HakiAuraCustomizerPanel } from './HakiAuraCustomizerPanel';
import { decorateFighterWithCustomAura } from '../utils/storage';

interface FighterEncyclopediaProps {
  onBack: () => void;
}

export const FighterEncyclopedia: React.FC<FighterEncyclopediaProps> = ({ onBack }) => {
  const [search, setSearch] = useState<string>('');
  const [selectedFighter, setSelectedFighter] = useState<Fighter>(decorateFighterWithCustomAura(CHARACTERS[0]));
  const [activeTab, setActiveTab] = useState<'moves' | 'haki' | 'victory_gallery' | 'aura'>('victory_gallery');
  const [isPoseModalOpen, setIsPoseModalOpen] = useState<boolean>(false);

  const decoratedCharacters = CHARACTERS.map(decorateFighterWithCustomAura);

  const filtered = decoratedCharacters.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.affiliation.toLowerCase().includes(search.toLowerCase()) ||
      f.epithet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative flex flex-col h-full w-full bg-zinc-950 text-zinc-100 overflow-y-auto font-sans p-4 sm:p-8">
      {/* Victory Pose Modal Overlay */}
      <VictoryPoseModal
        fighter={selectedFighter}
        isOpen={isPoseModalOpen}
        onClose={() => setIsPoseModalOpen(false)}
      />

      <div className="max-w-6xl mx-auto w-full my-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>BACK TO ROSTER</span>
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <span className="font-['Bebas_Neue'] text-lg tracking-wider text-amber-400">
              GRAND LINE FIGHTER CODEX & FRAME DATA
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search characters by name, bounty, or crew..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900 pl-9 pr-3 py-2 text-xs text-zinc-100 outline-none focus:border-amber-500"
          />
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* List (4 cols) */}
          <div className="md:col-span-4 space-y-2 max-h-[550px] overflow-y-auto pr-1">
            {filtered.map((fighter) => {
              const isSelected = selectedFighter.id === fighter.id;
              const tcp = calculateFighterTCP(fighter);

              return (
                <button
                  key={fighter.id}
                  onClick={() => setSelectedFighter(fighter)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition ${
                    isSelected
                      ? 'border-amber-400 bg-amber-950/40 shadow-md shadow-amber-500/20'
                      : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <FighterAvatar
                      avatarUrl={fighter.avatarUrl}
                      avatarIcon={fighter.avatarIcon}
                      name={fighter.name}
                      size="sm"
                      borderColor={fighter.themeColor}
                    />
                    <div>
                      <h3 className="font-['Cinzel'] text-sm font-bold text-white">{fighter.name}</h3>
                      <p className="text-[10px] text-zinc-400 font-mono">{fighter.affiliation}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono text-[10px] text-amber-400 font-bold">
                    TCP {tcp.toLocaleString()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Fighter Full Dossier (8 cols) */}
          <div className="md:col-span-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-4">
                <FighterAvatar
                  avatarUrl={selectedFighter.avatarUrl}
                  avatarIcon={selectedFighter.avatarIcon}
                  name={selectedFighter.name}
                  size="hero"
                  borderColor={selectedFighter.themeColor}
                />
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="font-['Cinzel'] text-2xl font-bold text-white">
                      {selectedFighter.name}
                    </h2>
                    <button
                      onClick={() => setActiveTab('victory_gallery')}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/40 text-amber-400 hover:bg-amber-500 hover:text-black transition-all group shadow-sm"
                    >
                      <Trophy className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold font-['Cinzel']">VICTORY GALLERY</span>
                    </button>
                  </div>
                  <p className="font-mono text-xs text-amber-400 font-semibold">{selectedFighter.epithet}</p>
                  <p className="font-mono text-xs text-zinc-400 mt-0.5">
                    {selectedFighter.affiliation} • {selectedFighter.rank} • {selectedFighter.fightingStyle}
                  </p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="text-[10px] text-zinc-400">BOUNTY</span>
                <p className="text-sm font-bold text-amber-300">
                  ฿ {selectedFighter.bounty.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Quote */}
            <p className="font-serif italic text-xs text-amber-200/90 border-l-2 border-amber-500 pl-3">
              "{selectedFighter.clashQuote}"
            </p>

            {/* Base Stats */}
            <div className="grid grid-cols-4 gap-3 text-center font-mono">
              <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-400">MAX HP</span>
                <p className="text-sm font-bold text-emerald-400">{selectedFighter.stats.maxHp}</p>
              </div>
              <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-400">ATTACK</span>
                <p className="text-sm font-bold text-red-400">{selectedFighter.stats.attack}</p>
              </div>
              <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-400">DEFENSE</span>
                <p className="text-sm font-bold text-blue-400">{selectedFighter.stats.defense}</p>
              </div>
              <div className="rounded-xl bg-zinc-950 p-2 border border-zinc-800">
                <span className="text-[9px] text-zinc-400">SPEED</span>
                <p className="text-sm font-bold text-amber-400">{selectedFighter.stats.speed}</p>
              </div>
            </div>

            {/* TAB SELECTION */}
            <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto">
              <button
                onClick={() => setActiveTab('victory_gallery')}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition shrink-0 ${
                  activeTab === 'victory_gallery'
                    ? 'border-amber-400 text-amber-400 bg-amber-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Trophy className="h-3.5 w-3.5 text-amber-400" />
                  VICTORY GALLERY & CLIPS
                </span>
              </button>
              <button
                onClick={() => setActiveTab('haki')}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition shrink-0 ${
                  activeTab === 'haki'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  HAKI MASTERY DOSSIER
                </span>
              </button>
              <button
                onClick={() => setActiveTab('moves')}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition shrink-0 ${
                  activeTab === 'moves'
                    ? 'border-red-400 text-red-400 bg-red-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Swords className="h-3.5 w-3.5" />
                  MOVES & FRAME DATA
                </span>
              </button>
              <button
                onClick={() => setActiveTab('aura')}
                className={`px-4 py-2.5 text-xs font-mono font-bold tracking-wider border-b-2 transition shrink-0 ${
                  activeTab === 'aura'
                    ? 'border-amber-500 text-amber-500 bg-amber-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/10'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  AURA CUSTOMIZATION
                </span>
              </button>
            </div>

            {/* CONTENT INNER PANEL */}
            {activeTab === 'victory_gallery' ? (
              <div className="pt-2">
                <VictoryGalleryViewer fighter={selectedFighter} />
              </div>
            ) : activeTab === 'moves' ? (
              <div>
                <span className="font-['Bebas_Neue'] text-xs tracking-wider text-amber-400 block mb-2">
                  COMPLETE MOVE FRAME DATA & METRICS
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {selectedFighter.moves.map((m) => (
                    <div
                      key={m.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950 p-2.5 text-xs font-mono gap-1"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-zinc-800 px-1 py-0.2 text-[9px] font-bold text-amber-400 uppercase">
                            {m.type}
                          </span>
                          <span className="font-bold text-zinc-100">{m.name}</span>
                          <span className="text-zinc-400 text-[11px]">({m.nameJP})</span>
                        </div>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{m.description}</p>
                      </div>

                      <div className="flex items-center gap-3 text-zinc-300 shrink-0">
                        <span className="text-amber-400 font-bold">{m.baseDamage} DMG</span>
                        <span>{m.missRate}% MISS</span>
                        <span>{m.guardDamage} GD</span>
                        {m.meterCost ? (
                          <span className="text-purple-400 font-bold">{m.meterCost} COST</span>
                        ) : (
                          <span className="text-cyan-400">+{m.meterGain} MTR</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : activeTab === 'haki' ? (
              <div className="space-y-4">
                {/* Master Details Intro */}
                <div className="flex items-center gap-2 rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-3 text-xs text-zinc-300">
                  <Info className="h-4 w-4 text-cyan-400 shrink-0" />
                  <p className="leading-relaxed">
                    Haki levels represent raw spiritual willpower. In battles, they directly influence critical variables including defense bypass, predictive dodging, and special damage scaling.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Observation */}
                  {(() => {
                    const val = selectedFighter.haki.observation;
                    const isAdv = val >= 90;
                    const isHigh = val >= 70;
                    const isStd = val >= 40;
                    const status = isAdv
                      ? { level: 'ADVANCED', term: 'Future Sight', desc: 'Can see several seconds into the future, fully anticipating moves.', color: 'text-cyan-400 bg-cyan-950/30 border-cyan-800/60' }
                      : isHigh
                      ? { level: 'HIGH', term: 'Foresight', desc: 'Capable of detecting opponent coordinates and movement intents.', color: 'text-emerald-400 bg-emerald-950/30 border-emerald-800/60' }
                      : isStd
                      ? { level: 'STANDARD', term: 'Awareness', desc: 'Recognizes general visual outlines and presence of auras.', color: 'text-zinc-300 bg-zinc-950/30 border-zinc-800/60' }
                      : { level: 'BASIC', term: 'Instinct', desc: 'Rudimentary reflexes and situational awareness under high stress.', color: 'text-zinc-500 bg-zinc-950/10 border-zinc-900' };

                    const evChance = (val / 100 * 8 * (isAdv ? 1.8 : 1)).toFixed(1);
                    const initBonus = (val * 0.25).toFixed(1);

                    return (
                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                            <span className="font-['Cinzel'] text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                              <Eye className="h-3.5 w-3.5 text-cyan-400" />
                              OBSERVATION
                            </span>
                            <span className="font-mono text-xs font-bold text-cyan-400">{val}/100</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>

                          <div className={`mt-2.5 rounded border px-2 py-1 text-[9px] font-mono leading-relaxed ${status.color}`}>
                            <span className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">
                              {status.level}: {status.term}
                            </span>
                            {status.desc}
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[9px] font-mono text-zinc-400 space-y-1 mt-1">
                          <div className="flex justify-between">
                            <span>EVASION RATE</span>
                            <span className="text-cyan-400 font-bold">+{evChance}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>INITIATIVE BONUS</span>
                            <span className="text-zinc-300">+{initBonus} PTS</span>
                          </div>
                          <div className="flex justify-between">
                            <span>PERFECT COUNTER</span>
                            <span className="text-amber-400 font-bold">ACTIVE (+35%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Armament */}
                  {(() => {
                    const val = selectedFighter.haki.armament;
                    const isAdv = val >= 90;
                    const isHigh = val >= 70;
                    const isStd = val >= 40;
                    const status = isAdv
                      ? { level: 'ADVANCED', term: 'Internal Destruction', desc: 'Channels haki deep inside target, bypassing exterior defenses entirely.', color: 'text-red-400 bg-red-950/30 border-red-800/60' }
                      : isHigh
                      ? { level: 'HIGH', term: 'Ryuo Projection', desc: 'Allows emitting kinetic force bursts outside of limbs/swords.', color: 'text-orange-400 bg-orange-950/30 border-orange-800/60' }
                      : isStd
                      ? { level: 'STANDARD', term: 'Koka Hardening', desc: 'Coats physical frame with bulletproof invisible body armor.', color: 'text-zinc-300 bg-zinc-950/30 border-zinc-800/60' }
                      : { level: 'BASIC', term: 'Partial Coating', desc: 'Brief and localized protection triggered by impact spikes.', color: 'text-zinc-500 bg-zinc-950/10 border-zinc-900' };

                    const isTechnician = selectedFighter.id === 'mihawk' || selectedFighter.id === 'law';
                    const bypass = (val / 100 * (isTechnician ? 50 : 35) * (isAdv ? 1.3 : 1)).toFixed(1);
                    const guardRed = (70 + (val / 100) * 8).toFixed(1);

                    return (
                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                            <span className="font-['Cinzel'] text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                              <Shield className="h-3.5 w-3.5 text-red-400" />
                              ARMAMENT
                            </span>
                            <span className="font-mono text-xs font-bold text-red-400">{val}/100</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>

                          <div className={`mt-2.5 rounded border px-2 py-1 text-[9px] font-mono leading-relaxed ${status.color}`}>
                            <span className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">
                              {status.level}: {status.term}
                            </span>
                            {status.desc}
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[9px] font-mono text-zinc-400 space-y-1 mt-1">
                          <div className="flex justify-between">
                            <span>ARMOR PENETRATION</span>
                            <span className="text-red-400 font-bold">+{bypass}% BYPASS</span>
                          </div>
                          <div className="flex justify-between">
                            <span>GUARD MITIGATION</span>
                            <span className="text-zinc-300">-{guardRed}% DMG</span>
                          </div>
                          <div className="flex justify-between">
                            <span>LOGIA BYPASS</span>
                            <span className={val >= 60 ? 'text-emerald-400' : 'text-zinc-500'}>
                              {val >= 60 ? 'ACTIVE (>=60)' : 'INSUFFICIENT'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Conqueror */}
                  {(() => {
                    const val = selectedFighter.haki.conqueror;
                    const isAdv = val >= 90;
                    const isHigh = val >= 60;
                    const isStd = val >= 1;
                    const status = isAdv
                      ? { level: 'ADVANCED', term: 'Haoshoku Infusion', desc: 'Injects supreme king power directly into attacks, releasing black lightning.', color: 'text-purple-400 bg-purple-950/30 border-purple-800/60' }
                      : isHigh
                      ? { level: 'HIGH', term: 'Domination Burst', desc: 'Emits localized mental pressure shockwaves to stun foes.', color: 'text-amber-500 bg-amber-950/30 border-amber-800/60' }
                      : isStd
                      ? { level: 'STANDARD', term: 'Latent discharge', desc: 'Brief emotional triggers spark unintentional aura bursts.', color: 'text-zinc-400 bg-zinc-950/30 border-zinc-800/60' }
                      : { level: 'NONE', term: 'Locked', desc: 'Lacks the lineage or willpower of a natural leader.', color: 'text-zinc-600 bg-zinc-950/10 border-zinc-900' };

                    const dmgBonus = (val / 100 * 45).toFixed(1);

                    return (
                      <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/40 p-3 space-y-2.5 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
                            <span className="font-['Cinzel'] text-[11px] font-bold text-zinc-200 flex items-center gap-1.5">
                              <Crown className="h-3.5 w-3.5 text-purple-400" />
                              CONQUEROR
                            </span>
                            <span className="font-mono text-xs font-bold text-purple-400">{val}/100</span>
                          </div>
                          
                          {/* Progress Bar */}
                          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden mt-1">
                            <div className="h-full bg-purple-500 rounded-full" style={{ width: `${val}%` }}></div>
                          </div>

                          <div className={`mt-2.5 rounded border px-2 py-1 text-[9px] font-mono leading-relaxed ${status.color}`}>
                            <span className="font-bold block uppercase text-[10px] tracking-wider mb-0.5">
                              {status.level}: {status.term}
                            </span>
                            {status.desc}
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-[9px] font-mono text-zinc-400 space-y-1 mt-1">
                          <div className="flex justify-between">
                            <span>HAKI DAMAGE BONUS</span>
                            <span className="text-purple-400 font-bold">+{dmgBonus}% ON SPECIALS</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SKY CLASH TRIGGER</span>
                            <span className={val >= 85 ? 'text-amber-400 font-bold' : 'text-zinc-500'}>
                              {val >= 85 ? 'ELIGIBLE (>=85)' : 'INELIGIBLE'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>STUN IMMUNITY</span>
                            <span className={val >= 60 ? 'text-emerald-400' : 'text-zinc-500'}>
                              {val >= 60 ? 'ACTIVE' : 'INACTIVE'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* HAKI POWER SCALING WEIGHTS AND TOTAL COMBAT POWER IMPACT */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-['Cinzel'] text-[10px] font-black tracking-wide text-amber-400 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
                      HAKI TOTAL COMBAT POWER (TCP) WEIGHT COMPOSITION
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      Total: {((selectedFighter.haki.conqueror * 12) + (selectedFighter.haki.armament * 10) + (selectedFighter.haki.observation * 9)).toLocaleString()} PTS
                    </span>
                  </div>

                  <p className="text-[10px] font-mono text-zinc-400 leading-normal">
                    Conqueror Haki exerts a <span className="text-purple-400">12x multiplier</span> (rare premium factor), Armament Haki is weighted at <span className="text-red-500">10x</span>, and Observation Haki is weighted at <span className="text-red-400">9x</span>.
                  </p>

                  <div className="space-y-1.5 pt-1 text-[9px] font-mono">
                    {/* Conqueror Scale */}
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-0.5">
                        <span>CONQUEROR (Haoshoku) WEIGHT (12x)</span>
                        <span className="text-purple-400">{(selectedFighter.haki.conqueror * 12)} / 1,200 pts</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded overflow-hidden">
                        <div className="h-full bg-purple-500 rounded" style={{ width: `${(selectedFighter.haki.conqueror * 12) / 12}%` }}></div>
                      </div>
                    </div>

                    {/* Armament Scale */}
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-0.5">
                        <span>ARMAMENT (Busoshoku) WEIGHT (10x)</span>
                        <span className="text-red-500">{(selectedFighter.haki.armament * 10)} / 1,000 pts</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded overflow-hidden">
                        <div className="h-full bg-red-600 rounded" style={{ width: `${(selectedFighter.haki.armament * 10) / 10}%` }}></div>
                      </div>
                    </div>

                    {/* Observation Scale */}
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-0.5">
                        <span>OBSERVATION (Kenbunshoku) WEIGHT (9x)</span>
                        <span className="text-red-400">{(selectedFighter.haki.observation * 9)} / 900 pts</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-900 rounded overflow-hidden">
                        <div className="h-full bg-red-500 rounded" style={{ width: `${(selectedFighter.haki.observation * 9) / 9}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <HakiAuraCustomizerPanel
                fighter={selectedFighter}
                onAuraSaved={(updated) => {
                  setSelectedFighter(updated);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
