import React from 'react';
import { ZoomIn, BookOpen, TrendingUp, Cpu, Code, Image as ImageIcon, FileCode2, Globe, Sparkles } from 'lucide-react';
import { SampleContentType, SandboxTab } from '../types';

interface HeaderProps {
  currentTab: SandboxTab;
  onSelectTab: (tab: SandboxTab) => void;
  currentSample: SampleContentType;
  onSelectSample: (sample: SampleContentType) => void;
  lang: 'fa' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  currentSample,
  onSelectSample,
  lang,
  onToggleLang,
}) => {
  const sampleTabs: { id: SampleContentType; labelEn: string; labelFa: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'article', labelEn: 'Research Paper', labelFa: 'مقاله علمی', icon: BookOpen },
    { id: 'charts', labelEn: 'Market Analytics', labelFa: 'تحلیل داده و بورس', icon: TrendingUp },
    { id: 'blueprint', labelEn: 'PCB Blueprint', labelFa: 'نقشه الکترونیکی', icon: Cpu },
    { id: 'code', labelEn: 'Code & Diffs', labelFa: 'سورس کد و دیف', icon: Code },
  ];

  return (
    <header className="sticky top-0 z-[99990] bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Version Title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-black via-zinc-900 to-[#39FF14] border border-[#39FF14] flex items-center justify-center shadow-[0_0_12px_rgba(57,255,20,0.4)]">
              <ZoomIn className="w-4 h-4 text-[#39FF14]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight">Zoom Box Pro</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/40 font-semibold">
                  v8.0.0
                </span>
              </div>
              <p className="text-[10px] text-zinc-400">
                {lang === 'fa' ? 'افزونه زوم حرفه‌ای صفحه با کادر شناور' : 'Chrome Extension Interactive Web Sandbox'}
              </p>
            </div>
          </div>

          {/* Mobile Language Button */}
          <button
            onClick={onToggleLang}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-xs text-zinc-300 hover:text-white"
          >
            <Globe className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="font-mono">{lang.toUpperCase()}</span>
          </button>
        </div>

        {/* Navigation & Target Selectors */}
        <div className="flex flex-wrap items-center gap-1.5 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs overflow-x-auto max-w-full">
          {/* Main Tabs */}
          <button
            onClick={() => onSelectTab('sandbox')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'sandbox'
                ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'محیط آزمایش' : 'Test Scenarios'}</span>
          </button>

          <button
            onClick={() => onSelectTab('custom')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'custom'
                ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'محتوای دلخواه' : 'Custom Image'}</span>
          </button>

          <button
            onClick={() => onSelectTab('extension-files')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'extension-files'
                ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'فایل‌ها و راهنمای نصب' : 'Extension Files'}</span>
          </button>
        </div>

        {/* Right Tools & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white hover:border-[#39FF14] transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-[#39FF14]" />
            <span className="font-mono">{lang === 'fa' ? 'فارسی / EN' : 'English / فا'}</span>
          </button>
        </div>
      </div>

      {/* Sub-bar with scenario presets if in Sandbox tab */}
      {currentTab === 'sandbox' && (
        <div className="border-t border-zinc-800/80 bg-zinc-950/70 px-4 sm:px-6 py-2">
          <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto text-xs">
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider whitespace-nowrap">
              {lang === 'fa' ? 'نمونه تست:' : 'Test Target:'}
            </span>
            {sampleTabs.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.id}
                  onClick={() => onSelectSample(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    currentSample === s.id
                      ? 'bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/50 font-bold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{lang === 'fa' ? s.labelFa : s.labelEn}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
