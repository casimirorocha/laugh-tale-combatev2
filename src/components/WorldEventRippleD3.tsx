import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { StageInfo } from '../types/fighter';
import { BATTLE_STAGES } from '../data/stages';
import { Compass, ShieldAlert, Award, Radio } from 'lucide-react';

interface WorldEventRippleD3Props {
  selectedStage: StageInfo;
  onSelectStage: (stage: StageInfo) => void;
  className?: string;
}

interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  color: string;
  hasActiveEvent: boolean;
  eventTitle?: string;
  location: string;
}

export const WorldEventRippleD3: React.FC<WorldEventRippleD3Props> = React.memo(({
  selectedStage,
  onSelectStage,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  // Map coordinates matching Grand Line sectors
  const mapNodes: MapNode[] = [
    {
      id: 'stage_marineford',
      name: 'Marineford',
      x: 80,
      y: 95,
      color: '#38bdf8',
      hasActiveEvent: true,
      eventTitle: 'CROSS GUILD RAID',
      location: 'Navy Headquarters',
    },
    {
      id: 'stage_onigashima',
      name: 'Onigashima',
      x: 180,
      y: 45,
      color: '#a855f7',
      hasActiveEvent: true,
      eventTitle: 'EMPEROR SUMMIT',
      location: 'Wano Land',
    },
    {
      id: 'stage_egghead',
      name: 'Egghead',
      x: 55,
      y: 40,
      color: '#06b6d4',
      hasActiveEvent: true,
      eventTitle: 'BUSTER CALL OUTBREAK',
      location: 'Future Island',
    },
    {
      id: 'stage_laugh_tale',
      name: 'Laugh Tale',
      x: 235,
      y: 115,
      color: '#f59e0b',
      hasActiveEvent: false,
      location: 'End of Grand Line',
    },
    {
      id: 'stage_wholecake',
      name: 'Whole Cake',
      x: 145,
      y: 125,
      color: '#ec4899',
      hasActiveEvent: false,
      location: 'Totto Land',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    // Remove existing SVG
    d3.select(containerRef.current).selectAll('*').remove();

    const width = 290;
    const height = 160;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'overflow: visible; background: #020204; border-radius: 12px; border: 1px solid #1f2937;');

    // 1. Draw radar sweep grid
    const radialGrids = [35, 75, 120, 160];
    svg.selectAll('.radar-grid')
      .data(radialGrids)
      .enter()
      .append('circle')
      .attr('cx', width / 2)
      .attr('cy', height / 2)
      .attr('r', d => d)
      .attr('fill', 'none')
      .attr('stroke', '#111827')
      .attr('stroke-width', 1.0);

    // Grid crosshairs
    svg.append('line')
      .attr('x1', 10)
      .attr('y1', height / 2)
      .attr('x2', width - 10)
      .attr('y2', height / 2)
      .attr('stroke', '#111827')
      .attr('stroke-width', 1.0);

    svg.append('line')
      .attr('x1', width / 2)
      .attr('y1', 10)
      .attr('x2', width / 2)
      .attr('y2', height - 10)
      .attr('stroke', '#111827')
      .attr('stroke-width', 1.0);

    // 2. Draw active world map locations & event ripple rings (D3 Transition Chain Loop)
    mapNodes.forEach((node) => {
      const isSelected = selectedStage.id === node.id;

      // Pulse background glow for selection
      if (isSelected) {
        svg.append('circle')
          .attr('cx', node.x)
          .attr('cy', node.y)
          .attr('r', 16)
          .attr('fill', node.color)
          .attr('opacity', 0.18);
      }

      // Draw D3 concentric ripples for active events
      if (node.hasActiveEvent) {
        const rippleCount = 3;
        for (let r = 0; r < rippleCount; r++) {
          const rRing = svg.append('circle')
            .attr('cx', node.x)
            .attr('cy', node.y)
            .attr('r', 5)
            .attr('fill', 'none')
            .attr('stroke', node.color)
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.8);

          // Animate pulsing ripple outward recursively
          const pulse = () => {
            rRing
              .attr('r', 5)
              .attr('opacity', 0.8)
              .transition()
              .duration(2000 + r * 400)
              .ease(d3.easeLinear)
              .attr('r', 25)
              .attr('opacity', 0)
              .on('end', pulse);
          };
          pulse();
        }
      }

      // Main interactive node point
      const pin = svg.append('circle')
        .attr('cx', node.x)
        .attr('cy', node.y)
        .attr('r', isSelected ? 6.5 : 4.5)
        .attr('fill', isSelected ? '#ffffff' : node.color)
        .attr('stroke', isSelected ? node.color : '#000000')
        .attr('stroke-width', 1.5)
        .attr('cursor', 'pointer');

      // Click/hover handlers
      pin.on('mouseover', () => {
        setHoveredNode(node);
        pin.transition().duration(150).attr('r', 8.5);
      });

      pin.on('mouseout', () => {
        setHoveredNode(null);
        pin.transition().duration(150).attr('r', isSelected ? 6.5 : 4.5);
      });

      pin.on('click', () => {
        const found = BATTLE_STAGES.find(s => s.id === node.id);
        if (found) onSelectStage(found);
      });
    });

    // 3. Dynamic sweep scan animation line
    const sweep = svg.append('line')
      .attr('x1', width / 2)
      .attr('y1', height / 2)
      .attr('x2', width / 2)
      .attr('y2', 0)
      .attr('stroke', '#22c55e')
      .attr('stroke-width', 1.5)
      .attr('opacity', 0.25);

    const animateSweep = () => {
      sweep
        .transition()
        .duration(4000)
        .ease(d3.easeLinear)
        .attrTween('transform', () => {
          return (t) => `rotate(${t * 360}, ${width / 2}, ${height / 2})`;
        })
        .on('end', animateSweep);
    };
    animateSweep();

  }, [selectedStage, onSelectStage]);

  return (
    <div className={`rounded-xl border border-zinc-800 bg-zinc-950 p-3 flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Compass className="h-4 w-4 text-emerald-400 animate-spin-slow" />
          <span className="font-['Bebas_Neue'] tracking-widest text-[11px]">GRAND LINE TACTICAL MAP</span>
        </div>

        <div className="flex items-center gap-1 text-[9px] text-red-400 bg-red-950/40 border border-red-500/20 px-2 py-0.5 rounded-full animate-pulse">
          <Radio className="w-3 h-3" />
          <span className="font-bold">LIVE EVENT BEACONS</span>
        </div>
      </div>

      {/* SVG Canvas Map node */}
      <div ref={containerRef} className="mx-auto select-none overflow-hidden rounded-lg shadow-inner shadow-zinc-900/80" />

      {/* Dynamic Navigational Hover HUD info panel */}
      <div className="min-h-[44px] bg-zinc-900/60 border border-zinc-800 rounded-lg p-2 flex items-center justify-between transition-all">
        {hoveredNode ? (
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-black text-white">{hoveredNode.name.toUpperCase()}</span>
              {hoveredNode.hasActiveEvent && (
                <span className="text-[8px] bg-red-500/20 text-red-300 font-bold px-1.5 py-0.5 rounded border border-red-500/30">
                  {hoveredNode.eventTitle}
                </span>
              )}
            </div>
            <span className="text-[9px] text-zinc-400">{hoveredNode.location}</span>
          </div>
        ) : (
          <div className="flex flex-col text-left">
            <span className="text-[11px] font-black text-zinc-300">CURRENT FOCUS: {selectedStage.name.split(':')[0].toUpperCase()}</span>
            <span className="text-[9px] text-zinc-500">{selectedStage.location}</span>
          </div>
        )}

        <div className="text-right flex flex-col">
          <span className="text-[8px] text-zinc-500 font-mono">SECTOR STAGE</span>
          <span className="text-[10px] font-black text-emerald-400 font-mono">ONLINE</span>
        </div>
      </div>
    </div>
  );
});

WorldEventRippleD3.displayName = 'WorldEventRippleD3';
export default WorldEventRippleD3;
