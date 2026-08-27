import React from 'react';
import { ZoomSettings } from '../types';
import { ChevronDown, ChevronUp, Search, RotateCcw, Sliders, Eye, Sparkles, Layers } from 'lucide-react';

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
  const [panelPos, setPanelPos] = React.useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = React.useState(false);
  const dragStartRef = React.useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON') {
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
      
      const newX = Math.max(10, Math.min(window.innerWidth - 260, dragStartRef.current.startX - dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 300, dragStartRef.current.startY + dy));
      
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

  const t = {
    title: lang === 'fa' ? 'تنظیمات زوم (Zoom Box Pro)' : 'Zoom Box Pro Controls',
    activate: lang === 'fa' ? '🔍 فعال کردن زوم' : '🔍 Activate Zoom Box',
    activeDrawing: lang === 'fa' ? '✏️ در حال کشیدن کادر...' : '✏️ Drawing Box...',
    activeZoomed: lang === 'fa' ? '✅ زوم فعال است' : '✅ Zoom Active',
    reset: lang === 'fa' ? '❌ بازگشت به 100%' : '❌ Reset to 100%',
    zoomLevel: lang === 'fa' ? 'سطح زوم:' : 'Zoom Scale:',
    boxColor: lang === 'fa' ? 'رنگ کادر:' : 'Box Border Color:',
    overlayOpacity: lang === 'fa' ? 'شفافیت پس‌زمینه:' : 'Overlay Dimming:',
    presets: lang === 'fa' ? 'مقادیر سریع:' : 'Quick Presets:',
    lensMode: lang === 'fa' ? 'حالت ذره‌بین (Lens)' : 'Magnifier Lens Mode',
    shortcutsConfig: lang === 'fa' ? 'تنظیم کلید میانبر' : 'Custom Shortcut',
    keyPrompt: lang === 'fa' ? 'کلید میانبر فعال‌سازی:' : 'Activation Shortcut:',
    shortcutsHint: lang === 'fa' ? `میانبر فعال: ${[
      settings.shortcutCtrl ? 'Ctrl' : '',
      settings.shortcutShift ? 'Shift' : '',
      settings.shortcutAlt ? 'Alt' : '',
      settings.shortcutKey || 'Z'
    ].filter(Boolean).join(' + ')} / Esc` : `Shortcut: ${[
      settings.shortcutCtrl ? 'Ctrl' : '',
      settings.shortcutShift ? 'Shift' : '',
      settings.shortcutAlt ? 'Alt' : '',
      settings.shortcutKey || 'Z'
    ].filter(Boolean).join(' + ')} / Esc`,
  };

  if (!settings.showPanel) return null;

  return (
    <div
      id="zoom-controls"
      onMouseDown={handleMouseDown}
      style={{
        right: `${panelPos.x}px`,
        top: `${panelPos.y}px`,
        direction: lang === 'fa' ? 'rtl' : 'ltr',
        background: 'linear-gradient(135deg, #050505 0%, #121214 55%, #182c16 100%)',
        boxShadow: isActive ? '0 12px 48px rgba(57, 255, 20, 0.45)' : '0 10px 35px rgba(0, 0, 0, 0.6)',
      }}
      className={`fixed z-[999990] p-4 rounded-xl border-2 transition-all duration-200 select-none ${
        isActive ? 'border-[#39FF14]' : 'border-[#39FF14]/60 hover:border-[#39FF14]'
      } backdrop-blur-md min-w-[240px] max-w-[280px] text-zinc-100 ${
        isCollapsed ? 'min-w-0 p-2.5' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2 cursor-move pb-1 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#39FF14] animate-pulse" />
          {!isCollapsed && (
            <span className="text-xs font-bold text-[#87CEEB] tracking-wide">
              {t.title}
            </span>
          )}
        </div>
        
        <button
          id="zoom-toggle-panel-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          className="p-1 px-2 text-xs font-bold rounded border border-[#87CEEB]/60 bg-black text-[#39FF14] hover:bg-[#87CEEB] hover:text-black hover:border-[#39FF14] transition-all cursor-pointer"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <div id="zoom-settings-content" className="flex flex-col gap-2.5 pt-1">
          {/* Main Action Buttons */}
          <button
            id="zoom-activate-btn"
            onClick={onToggleActive}
            className={`w-full py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md cursor-pointer border-2 ${
              isActive
                ? 'bg-[#39FF14] text-black border-[#87CEEB] shadow-[0_0_15px_rgba(57,255,20,0.5)]'
                : 'bg-black text-[#39FF14] border-[#87CEEB] hover:bg-[#87CEEB] hover:text-black hover:border-[#39FF14]'
            }`}
          >
            {isDrawing ? t.activeDrawing : hasZoomedRegion ? t.activeZoomed : t.activate}
          </button>

          <button
            id="zoom-reset-btn"
            onClick={onResetZoom}
            className="w-full py-1.5 px-3 rounded-lg text-xs font-bold bg-zinc-950 text-rose-400 border border-rose-500/60 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.reset}
          </button>

          {/* Quick Zoom Presets */}
          <div className="flex flex-col gap-1 text-[11px] text-zinc-300">
            <span className="text-[#87CEEB] font-medium">{t.presets}</span>
            <div className="grid grid-cols-4 gap-1">
              {[150, 200, 300, 400].map((preset) => (
                <button
                  key={preset}
                  onClick={() => onUpdateSettings({ zoomLevel: preset })}
                  className={`py-1 rounded text-[10px] font-semibold border transition-all cursor-pointer ${
                    settings.zoomLevel === preset
                      ? 'bg-[#39FF14] text-black border-[#39FF14]'
                      : 'bg-black/60 text-zinc-300 border-zinc-700 hover:border-[#87CEEB] hover:text-[#87CEEB]'
                  }`}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Level Slider */}
          <div className="flex flex-col gap-1 text-xs">
            <div className="flex justify-between items-center text-[#87CEEB]">
              <label htmlFor="zoom-level" className="font-semibold">{t.zoomLevel}</label>
              <span id="zoom-level-display" className="px-1.5 py-0.5 rounded text-[11px] font-mono font-bold bg-[#39FF14]/20 text-[#39FF14] border border-[#87CEEB]/50">
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
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
            />
          </div>

          {/* Box Color & Opacity Controls */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="flex flex-col gap-1 text-[11px] text-[#87CEEB]">
              <label htmlFor="box-color" className="font-medium truncate">{t.boxColor}</label>
              <div className="flex items-center gap-1.5">
                <input
                  type="color"
                  id="box-color"
                  value={settings.boxColor}
                  onChange={(e) => onUpdateSettings({ boxColor: e.target.value })}
                  className="w-8 h-7 rounded border border-[#87CEEB] bg-black cursor-pointer p-0"
                />
                <span className="text-[10px] font-mono text-zinc-400">{settings.boxColor}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1 text-[11px] text-[#87CEEB]">
              <div className="flex justify-between">
                <label htmlFor="overlay-opacity" className="font-medium truncate">{t.overlayOpacity}</label>
                <span className="text-zinc-300 font-mono text-[10px]">{settings.opacity}%</span>
              </div>
              <input
                type="range"
                id="overlay-opacity"
                min="0"
                max="95"
                step="5"
                value={settings.opacity}
                onChange={(e) => onUpdateSettings({ opacity: parseInt(e.target.value, 10) })}
                className="w-full h-1.5 mt-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#87CEEB]"
              />
            </div>
          </div>

          {/* Keyboard Shortcut Customization UI */}
          <div className="flex flex-col gap-1.5 pt-2 border-t border-zinc-800/80 text-[11px]">
            <div className="flex items-center justify-between text-[#87CEEB] font-medium">
              <span>{t.shortcutsConfig}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[#39FF14]">
                {[
                  settings.shortcutCtrl ? 'Ctrl' : '',
                  settings.shortcutShift ? 'Shift' : '',
                  settings.shortcutAlt ? 'Alt' : '',
                  settings.shortcutKey || 'Z'
                ].filter(Boolean).join(' + ')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 bg-zinc-900/60 p-1.5 rounded-lg border border-zinc-800">
              <label className="flex items-center gap-1 text-[10px] text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shortcutCtrl ?? true}
                  onChange={(e) => onUpdateSettings({ shortcutCtrl: e.target.checked })}
                  className="accent-[#39FF14] w-3 h-3 cursor-pointer"
                />
                <span>Ctrl</span>
              </label>
              <label className="flex items-center gap-1 text-[10px] text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shortcutShift ?? true}
                  onChange={(e) => onUpdateSettings({ shortcutShift: e.target.checked })}
                  className="accent-[#39FF14] w-3 h-3 cursor-pointer"
                />
                <span>Shift</span>
              </label>
              <label className="flex items-center gap-1 text-[10px] text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shortcutAlt ?? false}
                  onChange={(e) => onUpdateSettings({ shortcutAlt: e.target.checked })}
                  className="accent-[#39FF14] w-3 h-3 cursor-pointer"
                />
                <span>Alt</span>
              </label>
            </div>

            <div className="flex items-center justify-between gap-2 mt-0.5">
              <span className="text-zinc-400 text-[10px]">{t.keyPrompt}</span>
              <select
                value={settings.shortcutKey || 'Z'}
                onChange={(e) => onUpdateSettings({ shortcutKey: e.target.value })}
                className="bg-black text-[#39FF14] border border-[#87CEEB]/60 rounded px-2 py-0.5 text-xs font-mono font-bold cursor-pointer"
              >
                {['Z', 'X', 'C', 'V', 'A', 'S', 'F', 'Q', 'E', 'R', 'B', 'K', 'L', '1', '2', '3'].map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Lens Mode Toggle */}
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-[11px]">
            <label className="text-zinc-300 flex items-center gap-1.5 cursor-pointer">
              <Eye className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>{t.lensMode}</span>
            </label>
            <input
              type="checkbox"
              checked={settings.lensMode}
              onChange={(e) => onUpdateSettings({ lensMode: e.target.checked })}
              className="accent-[#39FF14] w-4 h-4 cursor-pointer"
            />
          </div>

          {/* Footnote Shortcut */}
          <div className="text-[9px] text-zinc-400 text-center font-mono pt-1">
            {t.shortcutsHint}
          </div>
        </div>
      )}
    </div>
  );
};
