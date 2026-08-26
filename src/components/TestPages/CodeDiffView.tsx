import React from 'react';
import { Code, FileCode2, Terminal } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const CodeDiffView: React.FC<Props> = ({ lang }) => {
  const codeLines = [
    { num: 1, type: 'ctx', text: '// Chrome Extension Content Script: Sub-pixel Coordinate Transform' },
    { num: 2, type: 'ctx', text: 'class ZoomBox {' },
    { num: 3, type: 'del', text: '-   applyZoomLegacy(startX, startY, scale) {' },
    { num: 4, type: 'del', text: '-     document.body.style.zoom = scale;' },
    { num: 5, type: 'del', text: '-   }' },
    { num: 6, type: 'add', text: '+   applyZoomSubPixel(rect, scale) {' },
    { num: 7, type: 'add', text: '+     const clone = originalElement.cloneNode(true);' },
    { num: 8, type: 'add', text: '+     clone.style.transformOrigin = `${rect.left}px ${rect.top}px`;' },
    { num: 9, type: 'add', text: '+     clone.style.transform = `matrix3d(${scale}, 0, 0, 0, 0, ${scale}, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)`;' },
    { num: 10, type: 'add', text: '+     clone.style.filter = "contrast(1.05) brightness(1.02)";' },
    { num: 11, type: 'add', text: '+     document.body.appendChild(clone);' },
    { num: 12, type: 'ctx', text: '    }' },
    { num: 13, type: 'ctx', text: '}' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 my-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2 font-mono">
            <Code className="w-5 h-5 text-emerald-400" />
            zoom-extension-v2 / content.js (Diff & Hex Inspector)
          </h2>
          <p className="text-xs text-zinc-400 font-mono mt-0.5">
            Git Commit: 8c4f92a • feat(zoom): matrix3d GPU accelerated compositing
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono bg-zinc-950 px-3 py-1.5 rounded-lg border border-zinc-800 text-emerald-400">
          <Terminal className="w-3.5 h-3.5" />
          <span>V8 TurboFan JIT</span>
        </div>
      </div>

      {/* Code Editor Mock */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl font-mono text-xs">
        {/* Editor Tab Bar */}
        <div className="bg-zinc-900/90 px-4 py-2 border-b border-zinc-800 flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-950 rounded-t-lg border-t border-x border-zinc-700 text-zinc-200 text-[11px]">
            <FileCode2 className="w-3.5 h-3.5 text-[#39FF14]" />
            <span>content.js (v8.0.0)</span>
          </div>
        </div>

        {/* Code Lines */}
        <div className="p-4 overflow-x-auto divide-y divide-transparent">
          {codeLines.map((line) => (
            <div
              key={line.num}
              className={`flex items-center gap-4 py-1 px-2 rounded font-mono text-[11.5px] ${
                line.type === 'add'
                  ? 'bg-emerald-950/40 text-emerald-300'
                  : line.type === 'del'
                  ? 'bg-rose-950/40 text-rose-300'
                  : 'text-zinc-400 hover:bg-zinc-900/40'
              }`}
            >
              <span className="w-6 text-right select-none text-zinc-600 text-[10px]">{line.num}</span>
              <pre className="flex-1 whitespace-pre">{line.text}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* Micro-Hex Dump Box (Great for precision zoom testing) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-2 font-mono">
        <div className="flex justify-between items-center text-xs text-zinc-300">
          <span className="font-bold text-[#87CEEB]">Raw Byte Stream Dump (0x0000 - 0x0040)</span>
          <span className="text-[10px] text-zinc-500">ASCII / HEX View</span>
        </div>
        <div className="p-3 bg-zinc-950 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 space-y-1 overflow-x-auto leading-relaxed">
          <div>00000000  63 6f 6e 74 65 6e 74 2e  6a 73 20 2d 20 5a 6f 6f  |content.js - Zoo|</div>
          <div>00000010  6d 20 42 6f 78 20 50 72  6f 20 76 38 2e 30 2e 30  |m Box Pro v8.0.0|</div>
          <div>00000020  20 6d 61 6e 69 66 65 73  74 5f 76 65 72 73 69 6f  | manifest_versio|</div>
          <div>00000030  6e 20 33 2e 30 20 63 68  72 6f 6d 65 2e 73 74 6f  |n 3.0 chrome.sto|</div>
        </div>
      </div>
    </div>
  );
};
