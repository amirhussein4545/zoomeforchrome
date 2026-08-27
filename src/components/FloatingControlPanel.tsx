import React from 'react';
import { ZoomSettings } from '../types';
import { ChevronDown, ChevronUp, Search, RotateCcw, Eye, Check } from 'lucide-react';

interface FloatingControlPanelProps {
  settings: ZoomSettings;
  onUpdateSettings: (newSettings: Partial<ZoomSettings>) => void;
  isActive: boolean;
  onToggleActive: () => void;
  onResetZoom: () => void;
  lang: 'fa' | 'en';
  isDrawing: boolean;
  hasZoomedRegion: boolean;
}

export const FloatingControlPanel: React.FC<FloatingControlPanelProps> = ({
  settings,
  onUpdateSettings,
  isActive,
  onToggleActive,
  onResetZoom,
  lang,
  isDrawing,
  hasZoomedRegion,
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [panelPos, setPanelPos] = React.useState({ x: 24, y: 24 });
  const [isDragging, setIsDragging] = React.useState(false);
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const dragStartRef = React.useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON' || (e.target as HTMLElement).tagName === 'SELECT') {
      return;
    }
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: panelPos.x,
      startY: panelPos.y,
    };
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;
      
      const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.startX - dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 400, dragStartRef.current.startY + dy));
      
      setPanelPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const shortcutText = [
    settings.shortcutCtrl ? 'Ctrl' : '',
    settings.shortcutShift ? 'Shift' : '',
    settings.shortcutAlt ? 'Alt' : '',
    settings.shortcutKey || 'Z',
  ].filter(Boolean).join(' + ');

  const t = {
    title: lang === 'fa' ? 'تنظیمات زوم (Zoom Box Pro)' : 'Zoom Box Pro Settings',
    activate: lang === 'fa' ? '🔍 فعال کردن زوم' : '🔍 Activate Zoom Box',
    activeDrawing: lang === 'fa' ? '✏️ در حال کشیدن کادر...' : '✏️ Drawing Box...',
    activeZoomed: lang === 'fa' ? '✅ زوم فعال است' : '✅ Zoom Active',
    reset: lang === 'fa' ? '🔄 ❌ بازگشت به 100%' : '🔄 ❌ Reset to 100%',
    presets: lang === 'fa' ? 'مقادیر سریع:' : 'Quick Presets:',
    zoomLevel: lang === 'fa' ? 'سطح زوم:' : 'Zoom Level:',
    boxColor: lang === 'fa' ? 'رنگ کادر:' : 'Box Color:',
    overlayOpacity: lang === 'fa' ? 'شفافیت پس‌زمینه:' : 'Background Dimming:',
    shortcutTitle: lang === 'fa' ? 'تنظیم کلید میانبر' : 'Shortcut Settings',
    shortcutKeyLabel: lang === 'fa' ? 'کلید میانبر فعال‌سازی:' : 'Activation Key:',
    lensMode: lang === 'fa' ? 'حالت ذره‌بین (Lens)' : 'Magnifier Lens (Lens)',
    footerHint: lang === 'fa' ? `میانبر فعال: ${shortcutText} / Esc` : `Active Shortcut: ${shortcutText} / Esc`,
  };

  if (!settings.showPanel) return null;

  return (
    <div
      id="zoom-controls"
      onMouseDown={handleMouseDown}
      style={{
        right: `${panelPos.x}px`,
        top: `${panelPos.y}px`,
        direction: 'rtl',
      }}
      className={`fixed z-[999990] w-[310px] bg-[#090d0b]/95 backdrop-blur-xl rounded-[20px] border-2 border-[#39FF14] shadow-[0_12px_45px_rgba(0,0,0,0.8),0_0_20px_rgba(57,255,20,0.25)] transition-all duration-200 select-none text-zinc-100 p-4 ${
        isCollapsed ? 'w-[280px] p-3' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 cursor-move border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#39FF14] shadow-[0_0_10px_#39FF14] inline-block animate-pulse" />
          <span className="text-[13px] font-bold text-[#7dd3fc] tracking-wide">
            {t.title}
          </span>
        </div>

        <button
          id="zoom-toggle-panel-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#38bdf8]/80 bg-black text-[#39FF14] hover:bg-[#38bdf8]/20 transition-all cursor-pointer shadow-sm"
          title={isCollapsed ? 'باز کردن پنل' : 'کوچک کردن پنل'}
        >
          {isCollapsed ? <ChevronDown className="w-4 h-4 text-[#39FF14]" /> : <ChevronUp className="w-4 h-4 text-[#39FF14]" />}
        </button>
      </div>

      {!isCollapsed && (
        <div id="zoom-settings-content" className="flex flex-col gap-3 pt-3">
          {/* Main Action Button 1: فعال کردن زوم */}
          <button
            id="zoom-activate-btn"
            onClick={onToggleActive}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border-2 ${
              isActive
                ? 'bg-[#39FF14] text-black border-[#38bdf8] shadow-[0_0_20px_rgba(57,255,20,0.6)]'
                : 'bg-black text-[#39FF14] border-[#38bdf8] hover:bg-[#38bdf8]/15 hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]'
            }`}
          >
            {isDrawing ? t.activeDrawing : hasZoomedRegion ? t.activeZoomed : t.activate}
          </button>

          {/* Main Action Button 2: بازگشت به 100% */}
          <button
            id="zoom-reset-btn"
            onClick={onResetZoom}
            className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[#140507] text-[#fb7185] border-[1.5px] border-[#e11d48]/80 hover:bg-[#e11d48]/20 hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {t.reset}
          </button>

          {/* Quick Presets (مقادیر سریع) */}
          <div className="flex flex-col gap-1.5 pt-1">
            <span className="text-[#7dd3fc] text-xs font-bold">{t.presets}</span>
            <div className="grid grid-cols-4 gap-1.5">
              {[150, 200, 300, 400].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateSettings({ zoomLevel: preset })}
                  className={`py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                    settings.zoomLevel === preset
                      ? 'bg-[#39FF14]/20 text-[#39FF14] border-[#39FF14] shadow-[0_0_8px_rgba(57,255,20,0.4)]'
                      : 'bg-zinc-900/90 text-zinc-300 border-zinc-700/80 hover:border-[#7dd3fc] hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Level Slider (سطح زوم) */}
          <div className="flex flex-col gap-1.5 pt-1">
            <div className="flex justify-between items-center">
              <span className="text-[#7dd3fc] text-xs font-bold">{t.zoomLevel}</span>
              <span
                id="zoom-level-display"
                className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-[#39FF14]/15 text-[#39FF14] border border-[#39FF14]/50 shadow-sm"
              >
                {settings.zoomLevel}%
              </span>
            </div>
            <input
              type="range"
              id="zoom-level"
              min="50"
              max="500"
              step="25"
              value={settings.zoomLevel}
              onChange={(e) => onUpdateSettings({ zoomLevel: parseInt(e.target.value, 10) })}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
            />
          </div>

          {/* Box Color & Background Dimming Controls (رنگ کادر و شفافیت پس‌زمینه) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            {/* Right: رنگ کادر */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[#7dd3fc] text-xs font-bold">{t.boxColor}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className="w-9 h-8 rounded-lg border-2 border-white/60 shadow-md cursor-pointer transition-transform hover:scale-105"
                  style={{ backgroundColor: settings.boxColor }}
                  title="انتخاب رنگ کادر"
                />
                <input
                  ref={colorInputRef}
                  type="color"
                  value={settings.boxColor}
                  onChange={(e) => onUpdateSettings({ boxColor: e.target.value })}
                  className="sr-only"
                />
                <span className="text-[11px] font-mono text-zinc-300 font-semibold uppercase">
                  {settings.boxColor}
                </span>
              </div>
            </div>

            {/* Left: شفافیت پس‌زمینه */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[#7dd3fc] text-xs font-bold">{t.overlayOpacity}</span>
                <span className="text-zinc-300 font-mono text-[11px] font-bold">{settings.opacity}%</span>
              </div>
              <input
                type="range"
                id="overlay-opacity"
                min="0"
                max="95"
                step="5"
                value={settings.opacity}
                onChange={(e) => onUpdateSettings({ opacity: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 mt-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
          </div>

          {/* Shortcut Settings (تنظیم کلید میانبر) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-zinc-800/80">
            <div className="flex items-center justify-between">
              <span className="text-[#7dd3fc] text-xs font-bold">{t.shortcutTitle}</span>
              <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-black border border-[#38bdf8]/60 text-[#39FF14] font-bold">
                {shortcutText}
              </span>
            </div>

            {/* Modifier Checkboxes in an enclosed container */}
            <div className="grid grid-cols-3 gap-1 bg-zinc-950/80 p-2 rounded-xl border border-zinc-800/90">
              {/* Ctrl */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ shortcutCtrl: !settings.shortcutCtrl })}
                className="flex items-center justify-center gap-1.5 cursor-pointer text-xs text-zinc-200 font-semibold"
              >
                <span>Ctrl</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    settings.shortcutCtrl ? 'bg-[#39FF14] text-black' : 'border border-zinc-600 bg-zinc-900'
                  }`}
                >
                  {settings.shortcutCtrl && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Shift */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ shortcutShift: !settings.shortcutShift })}
                className="flex items-center justify-center gap-1.5 cursor-pointer text-xs text-zinc-200 font-semibold"
              >
                <span>Shift</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    settings.shortcutShift ? 'bg-[#39FF14] text-black' : 'border border-zinc-600 bg-zinc-900'
                  }`}
                >
                  {settings.shortcutShift && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>

              {/* Alt */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ shortcutAlt: !settings.shortcutAlt })}
                className="flex items-center justify-center gap-1.5 cursor-pointer text-xs text-zinc-200 font-semibold"
              >
                <span>Alt</span>
                <div
                  className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                    settings.shortcutAlt ? 'bg-[#39FF14] text-black' : 'border border-zinc-500 bg-zinc-900'
                  }`}
                >
                  {settings.shortcutAlt && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>
              </button>
            </div>

            {/* Activation Key Selector */}
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-zinc-300 text-xs font-semibold">{t.shortcutKeyLabel}</span>
              <div className="relative">
                <select
                  value={settings.shortcutKey || 'Z'}
                  onChange={(e) => onUpdateSettings({ shortcutKey: e.target.value })}
                  className="appearance-none bg-black text-[#39FF14] border border-[#38bdf8]/70 rounded-lg px-3 py-1 pr-6 text-xs font-mono font-bold cursor-pointer hover:border-[#39FF14] focus:outline-none"
                >
                  {['Z', 'X', 'C', 'V', 'A', 'S', 'F', 'Q', 'E', 'R', 'B', 'K', 'L', '1', '2', '3'].map((k) => (
                    <option key={k} value={k} className="bg-zinc-900 text-white">
                      {k}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#39FF14] absolute left-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Lens Mode Toggle (حالت ذره‌بین) */}
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#39FF14]" />
              <span className="text-zinc-200 text-xs font-bold">{t.lensMode}</span>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ lensMode: !settings.lensMode })}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all cursor-pointer ${
                settings.lensMode
                  ? 'bg-[#39FF14] text-black shadow-[0_0_8px_#39FF14]'
                  : 'border border-zinc-600 bg-zinc-900'
              }`}
            >
              {settings.lensMode && <Check className="w-4 h-4 stroke-[3]" />}
            </button>
          </div>

          {/* Footer Shortcut Hint */}
          <div className="text-[11px] text-zinc-400 text-center font-mono pt-1">
            {t.footerHint}
          </div>
        </div>
      )}
    </div>
  );
};

