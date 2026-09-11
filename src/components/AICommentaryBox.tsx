import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Radio, Sparkles } from 'lucide-react';
import { ActionLog, Fighter, BattleFighterState } from '../types/fighter';
import {
  battleAnnouncer,
  AnnouncerLanguage,
  formatStrictNarration,
} from '../utils/soundEffects';

interface CommentaryReaction {
  en: string;
  ja: string;
  pt: string;
}

export function getHighTensionCommentary(
  log: ActionLog,
  activeT1State?: BattleFighterState,
  activeT2State?: BattleFighterState,
  lang: 'en' | 'ja' | 'pt' = 'en'
): string | null {
  if (!activeT1State || !activeT2State) return null;

  const isT1 = log.actorSide === 'team1';
  const actorState = isT1 ? activeT1State : activeT2State;
  const targetState = isT1 ? activeT2State : activeT1State;

  const actorHpRatio = actorState.currentHp / actorState.maxHp;
  const targetHpRatio = targetState.currentHp / targetState.maxHp;

  // 1. Clash of Kings (Haki Clash)
  if (log.isHakiClash) {
    const lines: CommentaryReaction[] = [
      {
        en: "A clash of Kings! The sky is splitting apart under their Conqueror's Haki!",
        ja: "覇王色の激突！彼らの衝突で天が真っ二つに裂ける！",
        pt: "Colisão de Reis! O céu está se dividindo sob o Haki do Conquistador!"
      },
      {
        en: "Incredible collision of pure willpower! Neither side is backing down!",
        ja: "凄まじい意志の衝突！どちらも一歩も譲らない！",
        pt: "Colisão incrível de pura força de vontade! Nenhum dos lados recua!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  // 2. Perfect Future Sight Dodge
  if (log.isDodged) {
    const lines: CommentaryReaction[] = [
      {
        en: "Perfect dodge! Future sight is absolutely flawless!",
        ja: "完璧な未来視回避！相手の攻撃を完全に見切っている！",
        pt: "Esquiva perfeita! A visão do futuro é absolutamente impecável!"
      },
      {
        en: "Untouchable! He saw the future and slipped away like a ghost!",
        ja: "神回避！未来を予知し、幽霊のようにすり抜けた！",
        pt: "Intocável! Ele previu o futuro e se esquivou como um fantasma!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  // 3. Guard Crush
  if (log.isGuardCrush) {
    const lines: CommentaryReaction[] = [
      {
        en: "Guard Crushed! His defense is blown completely wide open!",
        ja: "ガードクラッシュ！鉄壁の防御が完全に打ち砕かれた！",
        pt: "Guarda Estourada! Sua postura defensiva foi completamente estraçalhada!"
      },
      {
        en: "A shattering strike! The barrier has collapsed!",
        ja: "粉砕の一撃！ディフェンスが完全に崩壊した！",
        pt: "Um golpe esmagador! A barreira defensiva desmoronou!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  // 4. Ultimate Finisher (Super)
  if (log.moveType === 'super') {
    const lines: CommentaryReaction[] = [
      {
        en: "Supreme Technique Unleashed! The arena is shaking with sheer force!",
        ja: "奥義炸裂！フィールドが凄まじい破壊力で揺れている！",
        pt: "Técnica Suprema Liberada! A arena está tremendo com pura força!"
      },
      {
        en: "He gathers all his strength for a catastrophic ultimate strike!",
        ja: "すべての力を込めた破滅的な究極の一撃が放たれる！",
        pt: "Ele reúne todas as suas forças para um golpe supremo devastador!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  // 5. Epic Comeback (Attacker is low HP, target is high HP, attacker lands critical or counter)
  if (actorHpRatio <= 0.30 && targetHpRatio > 0.55 && (log.isCrit || log.isCounter)) {
    const lines: CommentaryReaction[] = [
      {
        en: "What a comeback! Sensational retaliation, fighting on pure willpower!",
        ja: "信じられない大逆転の兆しだ！不屈の闘志で立ち向かう！",
        pt: "Que reviravolta épica! Contra-ataque sensacional, lutando por pura força de vontade!"
      },
      {
        en: "Unbelievable clutch performance! Against all odds, he delivers a huge strike!",
        ja: "起死回生の一撃！絶体絶命の危機から、凄まじい反撃を叩き込む！",
        pt: "Performance espetacular! Contra todas as expectativas, ele desfere um golpe colossal!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  // 6. Max Tension (Both are extremely low HP <= 30%)
  if (actorHpRatio <= 0.30 && targetHpRatio <= 0.30 && (log.isCrit || log.isCounter || log.damage > 12)) {
    const lines: CommentaryReaction[] = [
      {
        en: "Maximum tension! Both fighters are on the brink of collapse!",
        ja: "極限の緊張状態！両者限界突破！次の攻撃が勝負を分ける！",
        pt: "Tensão máxima de tirar o fôlego! Ambos os lutadores estão no limite total!"
      },
      {
        en: "Who will claim victory?! The next move decides the entire match!",
        ja: "勝利を手にするのはどちらだ？！次の一手ですべてが決まる！",
        pt: "Quem conquistará a vitória?! O próximo movimento decide toda a partida!"
      }
    ];
    return lines[Math.floor(Math.random() * lines.length)][lang];
  }

  return null;
}

interface AICommentaryBoxProps {
  lastLog?: ActionLog;
  fighter1?: Fighter;
  fighter2?: Fighter;
  activeT1State?: BattleFighterState;
  activeT2State?: BattleFighterState;
  roundNumber: number;
  isGameOver?: boolean;
  winnerName?: string;
}

export const AICommentaryBox: React.FC<AICommentaryBoxProps> = React.memo(({
  lastLog,
  fighter1,
  fighter2,
  activeT1State,
  activeT2State,
  roundNumber,
  isGameOver,
}) => {
  const [commentary, setCommentary] = useState<string>(
    'Luffy unleashes Match Start'
  );
  const [highlightTag, setHighlightTag] = useState<string>('MATCH_START');
  const [announcerLang, setAnnouncerLang] = useState<AnnouncerLanguage>('ja'); // Japanese by default
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const lastProcessedLogId = useRef<string>('');
  const lastNetworkCallTime = useRef<number>(0);

  // Sync announcer settings
  useEffect(() => {
    battleAnnouncer.setLanguage(announcerLang);
  }, [announcerLang]);

  // Handle action announcements
  useEffect(() => {
    if (!lastLog || lastLog.id === lastProcessedLogId.current) return;
    lastProcessedLogId.current = lastLog.id;

    let actionCategory:
      | 'attack'
      | 'crit'
      | 'super'
      | 'dodge'
      | 'guard'
      | 'miss'
      | 'counter'
      | 'taunt'
      | 'ko'
      | 'clash'
      | 'guard_crush' = 'attack';
    let eventType = 'STRIKE';

    if (isGameOver) {
      actionCategory = 'ko';
      eventType = 'KO';
    } else if (lastLog.isHakiClash) {
      actionCategory = 'clash';
      eventType = 'HAKI_CLASH';
    } else if (lastLog.isCounter) {
      actionCategory = 'counter';
      eventType = 'COUNTER';
    } else if (lastLog.isTaunt) {
      actionCategory = 'taunt';
      eventType = 'TAUNT';
    } else if (lastLog.isDodged) {
      actionCategory = 'dodge';
      eventType = 'DODGE';
    } else if (lastLog.isMiss) {
      actionCategory = 'miss';
      eventType = 'MISS';
    } else if (lastLog.isGuardCrush) {
      actionCategory = 'guard_crush';
      eventType = 'GUARD_CRUSH';
    } else if (lastLog.isBlocked) {
      actionCategory = 'guard';
      eventType = 'GUARD';
    } else if (lastLog.moveType === 'super') {
      actionCategory = 'super';
      eventType = 'SUPER_HIT';
    } else if (lastLog.isCrit) {
      actionCategory = 'crit';
      eventType = 'CRITICAL_HIT';
    }

    // Always generate strictly formatted [Character Short Name] [Action Verb] [Attack Short Name]
    const strictFormat = formatStrictNarration(
      lastLog.actorName,
      lastLog.moveName,
      lastLog.moveNameJP,
      actionCategory,
      announcerLang
    );

    const reactionText = getHighTensionCommentary(lastLog, activeT1State, activeT2State, announcerLang);
    if (reactionText) {
      setCommentary(`${strictFormat.text} — "${reactionText}"`);
      setHighlightTag('HIGH TENSION');
    } else {
      setCommentary(strictFormat.text);
      setHighlightTag(eventType);
    }

    const now = Date.now();
    const timeSinceLastApi = now - lastNetworkCallTime.current;

    // Trigger AI commentary analysis for major events if eligible
    const shouldQueryAI =
      (isGameOver || lastLog.isHakiClash || lastLog.moveType === 'super') &&
      timeSinceLastApi > 18000;

    if (shouldQueryAI) {
      lastNetworkCallTime.current = now;
      setIsLoadingAI(true);
      fetch('/api/commentary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fighter1,
          fighter2,
          lastAction: {
            actorName: lastLog.actorName,
            targetName: lastLog.targetName,
            moveName: lastLog.moveName,
            moveType: lastLog.moveType,
            isCrit: lastLog.isCrit,
            isBlocked: lastLog.isBlocked,
            isDodged: lastLog.isDodged,
            isMiss: lastLog.isMiss,
            isCounter: lastLog.isCounter,
          },
          eventType,
          roundNumber,
          comboHits: lastLog.comboCount,
          damageDealt: lastLog.damage,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.commentary && data.commentary?.length < 250) {
            // Keep it punchy and short
            setCommentary(data.commentary);
            setHighlightTag(data.highlightTag || eventType);
          }
        })
        .catch(() => {
          // Keep strict format on error
        })
        .finally(() => {
          setIsLoadingAI(false);
        });
    }
  }, [lastLog, isGameOver, announcerLang]);



  const switchLanguage = (lang: AnnouncerLanguage) => {
    setAnnouncerLang(lang);
    battleAnnouncer.setLanguage(lang);
    if (lastLog) {
      let cat: 'attack' | 'crit' | 'super' | 'dodge' | 'guard' | 'miss' | 'counter' | 'taunt' | 'ko' | 'clash' | 'guard_crush' = 'attack';
      if (lastLog.isDodged) cat = 'dodge';
      else if (lastLog.isMiss) cat = 'miss';
      else if (lastLog.isCounter) cat = 'counter';
      else if (lastLog.isBlocked) cat = 'guard';
      else if (lastLog.isGuardCrush) cat = 'guard_crush';
      else if (lastLog.isCrit) cat = 'crit';
      else if (lastLog.moveType === 'super') cat = 'super';
      const formatted = formatStrictNarration(lastLog.actorName, lastLog.moveName, lastLog.moveNameJP, cat, lang);
      setCommentary(formatted.text);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border transition-all duration-500 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-2 sm:p-2.5 shadow-lg ${
      highlightTag === 'HIGH TENSION'
        ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] bg-red-950/10'
        : 'border-amber-500/30 shadow-black/60'
    }`}>
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400">
            <Radio className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-pulse text-amber-400" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-['Bebas_Neue'] text-xs sm:text-sm tracking-wider text-amber-400">
              WORLD ECONOMIC JOURNAL • BATTLE NARRATION
            </span>
            <span className="rounded bg-red-950/80 px-1 py-0.2 font-['Press_Start_2P'] text-[7px] text-red-400 uppercase">
              LIVE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {isLoadingAI && (
            <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-amber-400/80">
              <Sparkles className="h-2.5 w-2.5 animate-spin" /> AI Analyzing...
            </span>
          )}

          {/* Announcer Language Selector */}
          <div className="flex items-center bg-zinc-900 rounded border border-zinc-800 p-0.5 text-[9px] font-mono">
            <button
              onClick={() => switchLanguage('ja')}
              className={`px-1.5 py-0.5 rounded transition ${
                announcerLang === 'ja' ? 'bg-red-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Japanese Male Announcer (Default)"
            >
              🇯🇵 日本語
            </button>
            <button
              onClick={() => switchLanguage('en')}
              className={`px-1.5 py-0.5 rounded transition ${
                announcerLang === 'en' ? 'bg-amber-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="English Announcer"
            >
              🇺🇸 EN
            </button>
            <button
              onClick={() => switchLanguage('pt')}
              className={`px-1.5 py-0.5 rounded transition ${
                announcerLang === 'pt' ? 'bg-emerald-600 text-white font-bold' : 'text-zinc-400 hover:text-zinc-200'
              }`}
              title="Português Announcer"
            >
              🇧🇷 PT
            </button>
          </div>


        </div>
      </div>

      {/* Main Broadcast text */}
      <div className="mt-1.5 flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-amber-500/40 bg-zinc-800/80 text-sm shadow-inner">
          🎙️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-['Montserrat'] text-[9px] sm:text-[10px] font-bold text-amber-300">
              NARRATION:
            </span>
            <span className={`rounded px-1.5 py-0.5 font-mono text-[8px] uppercase transition-all duration-300 font-bold ${
              highlightTag === 'HIGH TENSION'
                ? 'bg-red-600 text-white animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                : 'bg-zinc-800 text-zinc-400'
            }`}>
              {highlightTag.replace(/_/g, ' ')}
            </span>
          </div>
          {/* Strictly formatted [Character Short Name] [Action Verb] [Attack Short Name] with no text overflow */}
          <p className="mt-0.5 font-['Montserrat'] text-xs sm:text-sm font-semibold tracking-wide text-zinc-100 line-clamp-3">
            {commentary}
          </p>
        </div>
      </div>
    </div>
  );
});
