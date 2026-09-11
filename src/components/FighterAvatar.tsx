import React from 'react';

interface FighterAvatarProps {
  avatarUrl?: string;
  avatarIcon?: string;
  name: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  borderColor?: string;
  showScanlines?: boolean;
  glowEffect?: boolean;
  currentHp?: number;
  maxHp?: number;
}

export const FighterAvatar: React.FC<FighterAvatarProps> = React.memo(({
  avatarUrl,
  avatarIcon = '⚔️',
  name,
  className = '',
  size = 'md',
  borderColor,
  showScanlines = false,
  glowEffect = false,
  currentHp,
  maxHp,
}) => {
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs rounded-md',
    sm: 'w-10 h-10 text-base rounded-lg',
    md: 'w-14 h-14 text-2xl rounded-xl',
    lg: 'w-20 h-20 text-3xl rounded-xl',
    xl: 'w-28 h-28 text-4xl rounded-2xl',
    hero: 'w-36 sm:w-44 h-36 sm:h-44 text-5xl rounded-2xl',
  }[size];

  const borderStyle = borderColor ? { borderColor } : {};

  const hpRatio = (currentHp !== undefined && maxHp !== undefined && maxHp > 0) ? Math.max(0, Math.min(1, currentHp / maxHp)) : 1.0;

  const isKo = hpRatio <= 0;
  const isCritical = hpRatio > 0 && hpRatio <= 0.25;
  const isModerate = hpRatio > 0.25 && hpRatio <= 0.50;
  const isWear = hpRatio > 0.50 && hpRatio <= 0.75;

  const damageFilterClass = isKo
    ? 'grayscale-[0.9] brightness-[0.5] contrast-[1.3]'
    : isCritical
    ? 'sepia-[0.4] hue-rotate-[-20deg] brightness-[0.75] saturate-[1.3] animate-pulse'
    : isModerate
    ? 'sepia-[0.3] hue-rotate-[-10deg] brightness-[0.85] saturate-[1.15]'
    : isWear
    ? 'sepia-[0.15] brightness-[0.95] contrast-[1.05]'
    : '';

  return (
    <div
      style={borderStyle}
      className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-zinc-900 border-2 border-amber-500/50 shadow-md ${sizeClasses} ${className} ${
        glowEffect ? 'shadow-[0_0_15px_rgba(245,158,11,0.4)]' : ''
      } ${damageFilterClass}`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // If image fails, fallback to emoji
            const target = e.currentTarget;
            target.style.display = 'none';
            if (target.parentElement) {
              const span = document.createElement('span');
              span.innerText = avatarIcon;
              target.parentElement.appendChild(span);
            }
          }}
        />
      ) : (
        <span className="select-none">{avatarIcon}</span>
      )}

      {/* Visible Damage Overlays based on HP Thresholds */}
      {isWear && (
        <div className="absolute inset-0 bg-amber-950/20 pointer-events-none mix-blend-multiply" />
      )}

      {isModerate && (
        <div className="absolute inset-0 bg-gradient-to-t from-purple-950/50 via-red-950/30 to-transparent pointer-events-none mix-blend-color-burn" />
      )}

      {isCritical && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-900/80 via-red-950/40 to-transparent pointer-events-none mix-blend-hard-light">
          {/* Blood splatter / scratch visual simulation */}
          <div className="absolute bottom-1 right-1 w-3/4 h-1/2 bg-red-600/40 blur-[2px] rounded-full transform -rotate-12" />
          <div className="absolute top-2 left-2 w-1/2 h-1/3 bg-red-700/50 blur-[1px] rounded-full transform rotate-45" />
        </div>
      )}

      {isKo && (
        <div className="absolute inset-0 bg-zinc-950/80 flex items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-red-950/40 mix-blend-color" />
          <span className="font-['Press_Start_2P'] text-red-600 font-black text-xs sm:text-sm tracking-widest rotate-[-15deg] border-2 border-red-600 px-2 py-1 bg-black/80 shadow-2xl">
            K.O.
          </span>
        </div>
      )}

      {/* Arcade scanlines overlay */}
      {showScanlines && (
        <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.4)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40 mix-blend-overlay" />
      )}

      {/* Corner metallic clips */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t-2 border-r-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b-2 border-l-2 border-amber-400/80 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b-2 border-r-2 border-amber-400/80 pointer-events-none" />
    </div>
  );
});
