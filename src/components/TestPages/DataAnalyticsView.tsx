import React from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Activity, DollarSign } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const DataAnalyticsView: React.FC<Props> = ({ lang }) => {
  const assets = [
    { ticker: 'BTC/USDT', price: '96,420.50', change: '+4.28%', vol: '$38.4B', high: '97,100.00', low: '92,340.10', depth: '0.84' },
    { ticker: 'ETH/USDT', price: '3,840.12', change: '+2.14%', vol: '$19.2B', high: '3,910.00', low: '3,720.00', depth: '1.12' },
    { ticker: 'SOL/USDT', price: '218.45', change: '+7.89%', vol: '$8.4B', high: '224.50', low: '201.20', depth: '2.40' },
    { ticker: 'NVDA/USD', price: '142.80', change: '-1.05%', vol: '$42.1B', high: '145.20', low: '141.00', depth: '0.45' },
    { ticker: 'TSLA/USD', price: '254.10', change: '+3.40%', vol: '$14.9B', high: '258.90', low: '246.50', depth: '0.92' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 my-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>24h Global Volume</span>
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono mt-2">$148,924,192,800.45</div>
          <div className="text-[10px] text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +12.4% vs previous 24h
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>Market Heat Index</span>
            <TrendingUp className="w-3.5 h-3.5 text-[#39FF14]" />
          </div>
          <div className="text-xl font-bold text-[#39FF14] font-mono mt-2">78.4 / 100 [BULLISH]</div>
          <div className="text-[10px] text-zinc-400 font-mono mt-1">Order book liquidity depth +4.8%</div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400 text-xs font-mono">
            <span>Settlement Gas Price</span>
            <DollarSign className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono mt-2">14.2 Gwei ($0.42)</div>
          <div className="text-[10px] text-sky-400 font-mono mt-1">Optimal execution latency: 42ms</div>
        </div>
      </div>

      {/* High Density Order Book / Depth Matrix (Great Zoom Target) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14]" />
            <h3 className="text-sm font-bold text-white font-mono">High-Frequency Market Depth & Spread Matrix</h3>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">Live 10ms stream</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-zinc-400 border-b border-zinc-800 text-[11px]">
                <th className="pb-2 px-2">Instrument</th>
                <th className="pb-2 px-2">Last Price ($)</th>
                <th className="pb-2 px-2">24h Net</th>
                <th className="pb-2 px-2">24h High ($)</th>
                <th className="pb-2 px-2">24h Low ($)</th>
                <th className="pb-2 px-2">Turnover</th>
                <th className="pb-2 px-2">Spread Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {assets.map((a, i) => (
                <tr key={i} className="hover:bg-zinc-800/40">
                  <td className="py-2.5 px-2 font-bold text-white">{a.ticker}</td>
                  <td className="py-2.5 px-2 text-zinc-100 font-semibold">{a.price}</td>
                  <td className={`py-2.5 px-2 font-bold ${a.change.startsWith('+') ? 'text-[#39FF14]' : 'text-rose-400'}`}>
                    {a.change}
                  </td>
                  <td className="py-2.5 px-2 text-zinc-400">{a.high}</td>
                  <td className="py-2.5 px-2 text-zinc-400">{a.low}</td>
                  <td className="py-2.5 px-2 text-sky-400">{a.vol}</td>
                  <td className="py-2.5 px-2 text-amber-400">{a.depth} bps</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Candlestick / Micro Chart Matrix */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
        <h4 className="text-xs font-mono font-bold text-zinc-300">Micro-Ticks & Order Flow Heatmap</h4>
        <div className="h-28 bg-zinc-950 rounded-lg border border-zinc-800 p-3 flex items-end justify-between gap-1 overflow-x-auto">
          {Array.from({ length: 48 }).map((_, idx) => {
            const height = Math.floor(Math.sin(idx * 0.4) * 35 + 50);
            const isUp = idx % 3 !== 0;
            return (
              <div key={idx} className="flex-1 min-w-[6px] flex flex-col items-center gap-0.5 group relative">
                <div
                  className={`w-full rounded-sm transition-all ${
                    isUp ? 'bg-emerald-500/80 hover:bg-[#39FF14]' : 'bg-rose-500/80 hover:bg-rose-400'
                  }`}
                  style={{ height: `${height}%` }}
                />
                <div className="w-0.5 h-1.5 bg-zinc-600" />
                <span className="opacity-0 group-hover:opacity-100 absolute -top-6 text-[9px] font-mono bg-black px-1 rounded text-white border border-zinc-700 pointer-events-none">
                  {height * 10}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
