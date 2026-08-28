import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const ResearchPaperView: React.FC<Props> = ({ lang }) => {
  return (
    <div className="max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-10 shadow-xl space-y-8 my-6">
      {/* Paper Header */}
      <div className="border-b border-zinc-800 pb-6 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#39FF14] uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>IEEE Trans. Pattern Analysis & Machine Intelligence • Vol. 48, No. 4</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
          Sub-Pixel Coordinate Mapping & Adaptive Viewport Transformation in Real-Time Browser Compositing
        </h1>
        <p className="text-xs text-zinc-400 font-mono">
          Dr. A. Hussein, Dr. M. Rezaei, & Dr. S. K. Vance • Laboratory of Advanced Computer Vision & Human-Computer Interaction
        </p>
      </div>

      {/* Abstract */}
      <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 sm:p-5 space-y-2">
        <h3 className="text-xs font-bold font-mono uppercase text-[#87CEEB] tracking-widest flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#39FF14]" />
          Abstract & Executive Synopsis
        </h3>
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          Dynamic magnification of localized arbitrary document object model (DOM) nodes poses distinct spatial fidelity challenges. 
          When client-side selection geometries <code>(x₀, y₀, w, h)</code> are projected to affine transformation matrices, hardware-accelerated 
          rasterization must prevent anti-aliasing artifacts and preserve baseline readability under scaling factors ranging from 1.5× to 5.0×.
        </p>
      </div>

      {/* Mathematical Formulation Grid (Ideal for Zoom Testing) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono font-bold text-amber-400">EQ. 1 — Normalized Affine Transform Matrix</span>
          <div className="p-3 bg-zinc-900/90 rounded border border-zinc-700/60 font-mono text-xs text-emerald-400 overflow-x-auto">
            {"T(s, θ) = \n[ s·cos(θ)  -s·sin(θ)  Δx ]\n[ s·sin(θ)   s·cos(θ)  Δy ]\n[    0          0       1 ]"}
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Where <code>s ∈ [0.5, 5.0]</code> represents the radial zoom factor and <code>Δx, Δy</code> define viewport displacement offsets.
          </p>
        </div>

        <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
          <span className="text-[11px] font-mono font-bold text-sky-400">EQ. 2 — Bilinear Interpolation Filter</span>
          <div className="p-3 bg-zinc-900/90 rounded border border-zinc-700/60 font-mono text-xs text-cyan-300 overflow-x-auto">
            {"f(x,y) ≈ [1-x, x] · \n[ f(Q₁₁)  f(Q₁₂) ] · \n[ 1-y ]\n[   y   ]"}
          </div>
          <p className="text-[11px] text-zinc-400 leading-normal">
            Calculates high-order sub-pixel luminance values inside the localized selection box bounding envelope.
          </p>
        </div>
      </div>

      {/* Fine-Print Micro Data Table (High-Density Zoom Target) */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span>Table 1: Benchmark Latencies across Browser Viewports</span>
          <span className="text-[10px] font-mono text-zinc-500">Tip: Drag Zoom Box over tiny numbers</span>
        </h3>
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-left text-[11px] border-collapse bg-zinc-950/60">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900 text-zinc-300 font-mono">
                <th className="py-2.5 px-3">Viewport ID</th>
                <th className="py-2.5 px-3">Resolution (px)</th>
                <th className="py-2.5 px-3">FPS (60Hz)</th>
                <th className="py-2.5 px-3">Matrix Time (μs)</th>
                <th className="py-2.5 px-3">Sub-Pixel Error</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-zinc-400">
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2 px-3 font-semibold text-white">VP-001-A</td>
                <td className="py-2 px-3">3840 × 2160</td>
                <td className="py-2 px-3 text-emerald-400">59.98</td>
                <td className="py-2 px-3">142.18 ± 0.04</td>
                <td className="py-2 px-3">0.00012%</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">OPTIMAL</td>
              </tr>
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2 px-3 font-semibold text-white">VP-002-B</td>
                <td className="py-2 px-3">2560 × 1440</td>
                <td className="py-2 px-3 text-emerald-400">60.00</td>
                <td className="py-2 px-3">94.32 ± 0.02</td>
                <td className="py-2 px-3">0.00008%</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">OPTIMAL</td>
              </tr>
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2 px-3 font-semibold text-white">VP-003-C</td>
                <td className="py-2 px-3">1920 × 1080</td>
                <td className="py-2 px-3 text-emerald-400">60.00</td>
                <td className="py-2 px-3">51.10 ± 0.01</td>
                <td className="py-2 px-3">0.00004%</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">OPTIMAL</td>
              </tr>
              <tr className="hover:bg-zinc-900/50">
                <td className="py-2 px-3 font-semibold text-white">VP-004-D</td>
                <td className="py-2 px-3">1440 × 900</td>
                <td className="py-2 px-3 text-emerald-400">60.00</td>
                <td className="py-2 px-3">38.45 ± 0.01</td>
                <td className="py-2 px-3">0.00002%</td>
                <td className="py-2 px-3 text-emerald-400 font-bold">OPTIMAL</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Tiny Footnotes & Citation Stamps */}
      <div className="pt-4 border-t border-zinc-800/80 text-[10px] text-zinc-500 font-mono space-y-1">
        <p>¹ Ref: ISO/IEC 14496-10:2020 High Efficiency Video Coding & Vector Graphics Transformation Specification.</p>
        <p>² Tested in Chrome V8 Engine version 128.0.6613 with hardware rasterization acceleration flag enabled.</p>
      </div>
    </div>
  );
};
