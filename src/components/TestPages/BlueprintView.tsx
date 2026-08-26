import React from 'react';
import { Cpu, Zap, Compass, Maximize2 } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const BlueprintView: React.FC<Props> = ({ lang }) => {
  return (
    <div className="max-w-5xl mx-auto space-y-6 my-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#39FF14]" />
            High-Density Micro-Schematic & PCB Topology
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Drawing Reference: CAD-REV-8.4.12 • Ultra-Fine Traces (0.15mm pitch)
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-[#87CEEB]">
          <Compass className="w-3.5 h-3.5" />
          <span>Layer: TOP_COPPER_TRACE</span>
        </div>
      </div>

      {/* SVG Blueprint Canvas */}
      <div className="bg-[#040810] border-2 border-sky-950 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        {/* Blueprint Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px), linear-gradient(to right, #0369a1 1px, transparent 1px), linear-gradient(to bottom, #0369a1 1px, transparent 1px)`,
            backgroundSize: '20px 20px, 100px 100px, 100px 100px',
          }}
        />

        <div className="relative z-10 space-y-4">
          <div className="flex justify-between items-center text-[11px] font-mono text-sky-400 border-b border-sky-900/60 pb-2">
            <span>GRID SPACING: 1.27mm / PIN DENSITY: 1200 DPI</span>
            <span>ZOOM BOX TARGET: IC-U108 & CAPACITOR ARRAY C41-C68</span>
          </div>

          <svg viewBox="0 0 800 400" className="w-full h-auto bg-slate-950/80 rounded-xl border border-sky-800/40">
            {/* Bus lines */}
            <g stroke="#0284c7" strokeWidth="1.5" fill="none">
              <path d="M 50 100 H 250 V 180 H 450 V 120 H 750" />
              <path d="M 50 120 H 230 V 200 H 430 V 140 H 750" />
              <path d="M 50 140 H 210 V 220 H 410 V 160 H 750" />
              <path d="M 50 160 H 190 V 240 H 390 V 180 H 750" />
            </g>

            {/* Micro Integrated Circuit U1 */}
            <g transform="translate(300, 150)">
              <rect x="-60" y="-40" width="120" height="80" rx="4" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <text x="0" y="-15" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">ARM-CORTEX-M7</text>
              <text x="0" y="0" fill="#94a3b8" fontSize="7" fontFamily="monospace" textAnchor="middle">STM32H743ZI / 480MHz</text>
              <text x="0" y="15" fill="#39FF14" fontSize="6" fontFamily="monospace" textAnchor="middle">VOLTAGE: 1.8V ± 0.02V</text>
              <text x="0" y="27" fill="#f59e0b" fontSize="5.5" fontFamily="monospace" textAnchor="middle">PACKAGE: LQFP-144 (0.5mm)</text>

              {/* Pins Top/Bottom */}
              {Array.from({ length: 16 }).map((_, i) => (
                <React.Fragment key={i}>
                  <line x1={-50 + i * 6.5} y1="-40" x2={-50 + i * 6.5} y2="-50" stroke="#38bdf8" strokeWidth="1" />
                  <line x1={-50 + i * 6.5} y1="40" x2={-50 + i * 6.5} y2="50" stroke="#38bdf8" strokeWidth="1" />
                </React.Fragment>
              ))}
            </g>

            {/* Micro Resistor / Capacitor array */}
            <g transform="translate(540, 160)">
              <rect x="-40" y="-30" width="80" height="60" rx="2" fill="#030712" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="2 2" />
              <text x="0" y="-12" fill="#e2e8f0" fontSize="8" fontFamily="monospace" textAnchor="middle">FILTER ARRAY</text>
              <text x="0" y="2" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">C41: 100nF / 50V (0402)</text>
              <text x="0" y="12" fill="#38bdf8" fontSize="6" fontFamily="monospace" textAnchor="middle">R18: 4.7kΩ ± 0.1% (0201)</text>
              <text x="0" y="22" fill="#10b981" fontSize="5.5" fontFamily="monospace" textAnchor="middle">ESR: 0.004Ω @ 100kHz</text>
            </g>

            {/* Test Points (Micro size for high zoom tests) */}
            <circle cx="120" cy="110" r="4" fill="#f59e0b" />
            <text x="120" y="98" fill="#f59e0b" fontSize="6" fontFamily="monospace" textAnchor="middle">TP1_CLK</text>

            <circle cx="120" cy="150" r="4" fill="#10b981" />
            <text x="120" y="166" fill="#10b981" fontSize="6" fontFamily="monospace" textAnchor="middle">TP2_GND</text>

            <circle cx="680" cy="130" r="4" fill="#39FF14" />
            <text x="680" y="118" fill="#39FF14" fontSize="6" fontFamily="monospace" textAnchor="middle">TP3_TX_DIFF_P</text>
          </svg>

          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>TOLERANCE: IPC-A-610 CLASS 3 HIGH RELIABILITY</span>
            <span className="text-[#39FF14]">★ Use Zoom Box to inspect microscopic pin labels</span>
          </div>
        </div>
      </div>
    </div>
  );
};
