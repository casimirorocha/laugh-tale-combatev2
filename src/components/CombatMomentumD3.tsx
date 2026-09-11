import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { centralAnimationLoop } from '../utils/centralAnimationLoop';
import { Zap, Flame, ShieldAlert, Activity, Sparkles } from 'lucide-react';

interface CombatMomentumD3Props {
  team1Name?: string;
  team2Name?: string;
  team1CritCount?: number;
  team2CritCount?: number;
  team1HakiCount?: number;
  team2HakiCount?: number;
  team1ComboCount?: number;
  team2ComboCount?: number;
  team1DamageDealt?: number;
  team2DamageDealt?: number;
  className?: string;
}

interface DataPoint {
  time: number;
  t1Val: number;
  t2Val: number;
}

export const CombatMomentumD3: React.FC<CombatMomentumD3Props> = React.memo(({
  team1Name = 'Team 1',
  team2Name = 'Team 2',
  team1CritCount = 0,
  team2CritCount = 0,
  team1HakiCount = 0,
  team2HakiCount = 0,
  team1ComboCount = 0,
  team2ComboCount = 0,
  team1DamageDealt = 0,
  team2DamageDealt = 0,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const historyRef = useRef<DataPoint[]>([]);
  const phaseRef = useRef<number>(0);
  const instanceIdRef = useRef<string>(`momentum_d3_${Math.random().toString(36).substring(2, 9)}`);

  const [t1Pct, setT1Pct] = useState<number>(50);
  const [t2Pct, setT2Pct] = useState<number>(50);

  // Calculate live momentum scores
  const t1Score = Math.max(10, team1CritCount * 15 + team1HakiCount * 20 + team1ComboCount * 8 + Math.min(60, team1DamageDealt / 25));
  const t2Score = Math.max(10, team2CritCount * 15 + team2HakiCount * 20 + team2ComboCount * 8 + Math.min(60, team2DamageDealt / 25));

  const totalScore = t1Score + t2Score || 1;
  const currentT1Ratio = Math.round((t1Score / totalScore) * 100);
  const currentT2Ratio = 100 - currentT1Ratio;

  useEffect(() => {
    setT1Pct(currentT1Ratio);
    setT2Pct(currentT2Ratio);
  }, [currentT1Ratio, currentT2Ratio]);

  useEffect(() => {
    const instanceId = instanceIdRef.current;
    const maxPoints = 35;

    // Initialize history buffer
    if (historyRef.current.length === 0) {
      historyRef.current = d3.range(maxPoints).map((i) => ({
        time: i,
        t1Val: 50,
        t2Val: 50,
      }));
    }

    const unsubscribe = centralAnimationLoop.subscribe(instanceId, (dt) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width || 320;
      const height = rect.height || 60;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      phaseRef.current += dt * 3.0;

      // Update tail point with noise + live intensity
      const history = historyRef.current;
      const noise1 = Math.sin(phaseRef.current * 1.8) * 8 + Math.cos(phaseRef.current * 2.5) * 6;
      const noise2 = Math.cos(phaseRef.current * 2.1) * 8 + Math.sin(phaseRef.current * 1.9) * 6;

      const targetT1 = Math.min(85, Math.max(15, currentT1Ratio + noise1));
      const targetT2 = Math.min(85, Math.max(15, currentT2Ratio + noise2));

      // Push and shift history
      history.shift();
      history.push({
        time: (history[history.length - 1]?.time || 0) + 1,
        t1Val: targetT1,
        t2Val: targetT2,
      });

      // D3 Scales
      const xScale = d3.scaleLinear()
        .domain([0, maxPoints - 1])
        .range([10, width - 10]);

      const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - 6, 6]);

      // 1. Draw Grid Lines
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2. D3 Wave Area & Contour Line for Team 1 (Cyan/Gold)
      const t1AreaGen = d3.area<DataPoint>()
        .x((_, i) => xScale(i))
        .y0(height)
        .y1((d) => yScale(d.t1Val))
        .curve(d3.curveBasis)
        .context(ctx);

      const t1LineGen = d3.line<DataPoint>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.t1Val))
        .curve(d3.curveBasis)
        .context(ctx);

      const grad1 = ctx.createLinearGradient(0, 0, 0, height);
      grad1.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      grad1.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.fillStyle = grad1;
      ctx.beginPath();
      t1AreaGen(history);
      ctx.fill();

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      t1LineGen(history);
      ctx.stroke();

      // 3. D3 Wave Area & Contour Line for Team 2 (Crimson/Rose)
      const t2LineGen = d3.line<DataPoint>()
        .x((_, i) => xScale(i))
        .y((d) => yScale(d.t2Val))
        .curve(d3.curveBasis)
        .context(ctx);

      const t2AreaGen = d3.area<DataPoint>()
        .x((_, i) => xScale(i))
        .y0(height)
        .y1((d) => yScale(d.t2Val))
        .curve(d3.curveBasis)
        .context(ctx);

      const grad2 = ctx.createLinearGradient(0, 0, 0, height);
      grad2.addColorStop(0, 'rgba(244, 63, 94, 0.35)');
      grad2.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

      ctx.fillStyle = grad2;
      ctx.beginPath();
      t2AreaGen(history);
      ctx.fill();

      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      t2LineGen(history);
      ctx.stroke();

      // Leading pulse node
      const lastPoint = history[history.length - 1];
      if (lastPoint) {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(xScale(maxPoints - 1), yScale(lastPoint.t1Val), 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(xScale(maxPoints - 1), yScale(lastPoint.t2Val), 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });

    return () => {
      unsubscribe();
    };
  }, [currentT1Ratio, currentT2Ratio]);

  const momentumStatus =
    t1Pct >= 65
      ? `${team1Name.substring(0, 8)} DOMINATING`
      : t2Pct >= 65
      ? `${team2Name.substring(0, 8)} DOMINATING`
      : t1Pct >= 55
      ? `${team1Name.substring(0, 8)} SURGE`
      : t2Pct >= 55
      ? `${team2Name.substring(0, 8)} SURGE`
      : 'EVEN MOMENTUM CLASH';

  return (
    <div className={`relative bg-zinc-950/90 border border-zinc-800 rounded-xl p-2 flex flex-col gap-1 shadow-xl backdrop-blur-md select-none overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between text-[10px] font-mono px-1">
        <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
          <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span className="truncate max-w-[80px]">{team1Name}</span>
          <span className="text-[9px] bg-cyan-950 px-1 rounded border border-cyan-500/40">{t1Pct}%</span>
        </div>

        <div className="flex items-center gap-1 text-[9px] font-black tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-500/50 shadow-sm animate-pulse">
          <Activity className="w-3 h-3 text-amber-400" />
          <span>{momentumStatus}</span>
        </div>

        <div className="flex items-center gap-1.5 text-rose-400 font-bold">
          <span className="text-[9px] bg-rose-950 px-1 rounded border border-rose-500/40">{t2Pct}%</span>
          <span className="truncate max-w-[80px]">{team2Name}</span>
          <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
        </div>
      </div>

      {/* D3 Wave Canvas */}
      <div className="relative w-full h-12 rounded bg-zinc-900/80 border border-zinc-800 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full object-cover pointer-events-none"
        />
      </div>

      {/* Metrics Row: Criticals & Haki Frequency */}
      <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1 pt-0.5 border-t border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-amber-300">
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            CRITS: {team1CritCount}
          </span>
          <span className="flex items-center gap-0.5 text-purple-300">
            <ShieldAlert className="w-2.5 h-2.5 text-purple-400" />
            HAKI: {team1HakiCount}
          </span>
        </div>

        <span className="text-[8px] text-zinc-500 font-sans uppercase">REAL-TIME D3 ENGINE</span>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-0.5 text-purple-300">
            HAKI: {team2HakiCount}
            <ShieldAlert className="w-2.5 h-2.5 text-purple-400" />
          </span>
          <span className="flex items-center gap-0.5 text-amber-300">
            CRITS: {team2CritCount}
            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          </span>
        </div>
      </div>
    </div>
  );
});

CombatMomentumD3.displayName = 'CombatMomentumD3';
export default CombatMomentumD3;
