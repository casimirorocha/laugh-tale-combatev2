import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ActionLog } from '../types/fighter';

interface MomentumSparklineD3Props {
  logs: ActionLog[];
  className?: string;
}

export const MomentumSparklineD3: React.FC<MomentumSparklineD3Props> = React.memo(({ logs = [], className = '' }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous SVG elements
    d3.select(containerRef.current).selectAll('*').remove();

    // Prepare data sequence from combat logs
    let currentMomentum = 50; // Neutral baseline
    const sparkData = [{ index: 0, momentum: 50, isCrit: false, side: 'team1' }];

    logs.forEach((log, i) => {
      let shift = 0;
      if (log.damage) {
        // Higher damage shifts momentum more aggressively
        shift = Math.min(25, log.damage / 24);
      }
      if (log.isCrit) shift += 12;
      if (log.isHakiClash) shift += 18;

      if (log.actorSide === 'team1') {
        currentMomentum = Math.min(95, currentMomentum + shift);
      } else {
        currentMomentum = Math.max(5, currentMomentum - shift);
      }

      sparkData.push({
        index: i + 1,
        momentum: currentMomentum,
        isCrit: log.isCrit,
        side: log.actorSide,
      });
    });

    // Dimensions and spacing rules
    const width = 280;
    const height = 75;
    const padding = { top: 10, right: 12, bottom: 10, left: 12 };

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'overflow: visible;');

    // 1. Scales
    const xScale = d3.scaleLinear()
      .domain([0, sparkData.length - 1])
      .range([padding.left, width - padding.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - padding.bottom, padding.top]);

    // 2. Grid/Baseline Indicator
    svg.append('line')
      .attr('x1', padding.left)
      .attr('y1', yScale(50))
      .attr('x2', width - padding.right)
      .attr('y2', yScale(50))
      .attr('stroke', '#3f3f46')
      .attr('stroke-dasharray', '3,3')
      .attr('stroke-width', 1.0);

    // 3. Line Generator
    const lineGen = d3.line<typeof sparkData[0]>()
      .x((d) => xScale(d.index))
      .y((d) => yScale(d.momentum))
      .curve(d3.curveMonotoneX);

    // Dynamic gradient shader for the wave path
    const gradId = `spark-grad-${Math.random().toString(36).substring(2, 9)}`;
    const defs = svg.append('defs');
    const linearGradient = defs.append('linearGradient')
      .attr('id', gradId)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    linearGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4'); // Cyan

    linearGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#f43f5e'); // Rose

    // Render path sparkline
    svg.append('path')
      .datum(sparkData)
      .attr('fill', 'none')
      .attr('stroke', `url(#${gradId})`)
      .attr('stroke-width', 2.2)
      .attr('d', lineGen);

    // 4. Critical density dots
    svg.selectAll('.crit-dot')
      .data(sparkData.filter(d => d.isCrit))
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.index))
      .attr('cy', d => yScale(d.momentum))
      .attr('r', 3.8)
      .attr('fill', d => d.side === 'team1' ? '#22d3ee' : '#f43f5e')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1)
      .style('filter', d => `drop-shadow(0px 0px 4px ${d.side === 'team1' ? '#06b6d4' : '#f43f5e'})`);

  }, [logs]);

  return (
    <div className={`flex flex-col gap-2 p-3 bg-zinc-950/60 border border-zinc-800 rounded-xl ${className}`}>
      <div className="flex items-center justify-between font-mono text-[9px] text-zinc-400">
        <span className="text-cyan-400 font-bold uppercase">⚡ Player Momentum</span>
        <span className="text-rose-400 font-bold uppercase">Opponent ⚡</span>
      </div>
      
      {/* SVG Container element mapped with ref */}
      <div ref={containerRef} className="mx-auto flex justify-center items-center" />

      <div className="flex justify-between items-center text-[8px] font-mono text-zinc-500">
        <span>● CRIT DENSITY</span>
        <span className="text-[9px] text-zinc-400">FINAL BATTLE SHIFT</span>
      </div>
    </div>
  );
});

MomentumSparklineD3.displayName = 'MomentumSparklineD3';
export default MomentumSparklineD3;
