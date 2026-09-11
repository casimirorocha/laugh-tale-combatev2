import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  CheckCircle2,
  Image as ImageIcon,
  Volume2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';
import { PredictivePreloadState } from '../utils/predictiveMediaLoader';

interface PredictiveMediaLoaderHUDProps {
  state: PredictivePreloadState;
}

export const PredictiveMediaLoaderHUD: React.FC<PredictiveMediaLoaderHUDProps> = ({ state }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // If completely idle with no predicted opponent, don't show
  if (!state || (state.status === 'idle' && !state.predictedOpponent)) {
    return null;
  }

  const isComplete = state.status === 'ready';
  const isDownloading = state.status === 'downloading' || state.status === 'analyzing';

  return (
    <div
      id="predictive-media-loader-hud"
      className="fixed bottom-4 left-4 z-40 max-w-sm pointer-events-auto select-none"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="rounded-xl border border-cyan-500/40 bg-zinc-950/90 backdrop-blur-md shadow-2xl shadow-cyan-950/40 overflow-hidden font-sans"
      >
        {/* Header Bar */}
        <div
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer hover:bg-zinc-900/60 transition"
        >
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              {isDownloading ? (
                <Cpu className="h-4 w-4 text-cyan-400 animate-spin" />
              ) : isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              ) : (
                <Zap className="h-4 w-4 text-amber-400" />
              )}
              {isDownloading && (
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              )}
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-['Bebas_Neue'] text-xs tracking-wider text-cyan-300">
                  PREDICTIVE MEDIA LOADER
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold ${
                    isComplete
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 animate-pulse'
                  }`}
                >
                  {isComplete ? 'READY' : `${state.progress}%`}
                </span>
              </div>

              {state.predictedOpponent && (
                <div className="flex items-center gap-1 text-[11px] text-zinc-300 truncate max-w-[210px]">
                  <span>{state.predictedOpponent.crestEmoji || '👑'}</span>
                  <span className="font-semibold text-zinc-100 truncate">
                    {state.predictedOpponent.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded transition"
            aria-label="Toggle Details"
          >
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* Mini progress line */}
        <div className="w-full bg-zinc-800 h-1 overflow-hidden">
          <motion.div
            className={`h-full ${
              isComplete
                ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${state.progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Expandable Details Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="px-3 py-2.5 bg-zinc-900/80 border-t border-zinc-800 text-xs space-y-2 max-h-60 overflow-y-auto"
            >
              {state.rivalryTitle && (
                <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{state.rivalryTitle}</span>
                </div>
              )}

              {state.rivalryReason && (
                <p className="text-[11px] text-zinc-400 italic leading-relaxed">
                  "{state.rivalryReason}"
                </p>
              )}

              {state.predictedStage && (
                <div className="rounded bg-zinc-950/70 border border-zinc-800/80 p-1.5 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-zinc-400">Predicted Arena:</span>
                  <span className="text-cyan-300 font-bold">{state.predictedStage.name}</span>
                </div>
              )}

              {/* Cached Counts */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="flex items-center gap-1.5 rounded bg-zinc-950/60 px-2 py-1 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  <ImageIcon className="h-3 w-3 text-cyan-400" />
                  <span>Visuals: {state.cachedImageCount} cached</span>
                </div>
                <div className="flex items-center gap-1.5 rounded bg-zinc-950/60 px-2 py-1 border border-zinc-800 text-[10px] font-mono text-zinc-300">
                  <Volume2 className="h-3 w-3 text-amber-400" />
                  <span>Audio: {state.cachedAudioCount} cached</span>
                </div>
              </div>

              {/* Asset List Preview */}
              {(state?.assetNames?.length || 0) > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                    Preloaded Stream Queue ({state.loadedAssets}/{state.totalAssets})
                  </span>
                  <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                    {(state.assetNames || []).slice(0, 10).map((asset, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-[10px] text-zinc-400 font-mono py-0.5 border-b border-zinc-800/40"
                      >
                        <div className="flex items-center gap-1 truncate max-w-[190px]">
                          {asset.type === 'image' ? (
                            <ImageIcon className="h-2.5 w-2.5 text-cyan-400 shrink-0" />
                          ) : (
                            <Volume2 className="h-2.5 w-2.5 text-amber-400 shrink-0" />
                          )}
                          <span className="truncate">{asset.name}</span>
                        </div>
                        <span
                          className={`text-[9px] ${
                            asset.cached ? 'text-emerald-400' : 'text-zinc-600'
                          }`}
                        >
                          {asset.cached ? 'CACHED' : 'FETCHING'}
                        </span>
                      </div>
                    ))}
                    {(state.assetNames?.length || 0) > 10 && (
                      <div className="text-[9px] text-zinc-500 font-mono text-center pt-1">
                        + {(state.assetNames?.length || 0) - 10} additional combat assets
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
