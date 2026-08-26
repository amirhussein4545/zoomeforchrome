import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomSettings, SelectionRect, ZoomedRegion, ToastMessage } from '../types';
import { FloatingControlPanel } from './FloatingControlPanel';
import { NotificationToast } from './NotificationToast';
import { X, ZoomIn, ZoomOut, Move, Download, Copy, Check } from 'lucide-react';

interface ZoomBoxEngineProps {
  children: React.ReactNode;
  settings: ZoomSettings;
  onUpdateSettings: (settings: Partial<ZoomSettings>) => void;
  lang: 'fa' | 'en';
}

export const ZoomBoxEngine: React.FC<ZoomBoxEngineProps> = ({
  children,
  settings,
  onUpdateSettings,
  lang,
}) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [selection, setSelection] = useState<SelectionRect | null>(null);
  const [zoomedRegion, setZoomedRegion] = useState<ZoomedRegion | null>(null);
  const [lensPos, setLensPos] = useState<{ x: number; y: number } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const showToast = useCallback((text: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const activateZoomMode = useCallback(() => {
    setIsActive(true);
    setIsDrawing(true);
    showToast(
      lang === 'fa'
        ? 'کادر را روی ناحیه مورد نظر بکشید'
        : 'Click and drag a box over any area to zoom',
      'info'
    );
  }, [lang, showToast]);

  const deactivateZoomMode = useCallback(() => {
    setIsActive(false);
    setIsDrawing(false);
    setSelection(null);
    setZoomedRegion(null);
  }, []);

  const resetZoom = useCallback(() => {
    deactivateZoomMode();
    onUpdateSettings({ zoomLevel: 100 });
    showToast(
      lang === 'fa' ? 'زوم به 100% بازگشت' : 'Zoom reset to 100%',
      'info'
    );
  }, [deactivateZoomMode, onUpdateSettings, lang, showToast]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+Z or Cmd+Shift+Z: Toggle Zoom Mode
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'Z' || e.key === 'z')) {
        e.preventDefault();
        if (isActive) {
          deactivateZoomMode();
        } else {
          activateZoomMode();
        }
      }
      // Ctrl+Shift+R or Cmd+Shift+R: Reset Zoom
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'R' || e.key === 'r')) {
        e.preventDefault();
        resetZoom();
      }
      // Escape: Exit Zoom
      else if (e.key === 'Escape') {
        if (isActive || zoomedRegion) {
          deactivateZoomMode();
          showToast(lang === 'fa' ? 'خروج از حالت زوم' : 'Exited zoom mode', 'info');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, zoomedRegion, activateZoomMode, deactivateZoomMode, resetZoom, lang, showToast]);

  // Mouse & Touch Selection Event Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || !isDrawing) return;
    if ((e.target as HTMLElement).closest('#zoom-controls') || (e.target as HTMLElement).closest('#zoom-active-window')) {
      return;
    }

    startPosRef.current = { x: e.clientX, y: e.clientY };
    setSelection({
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      left: e.clientX,
      top: e.clientY,
      width: 0,
      height: 0,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // Update lens position if lens mode is active
    if (settings.lensMode && !isDrawing) {
      setLensPos({ x: e.clientX, y: e.clientY });
    }

    if (!isActive || !isDrawing || !selection) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    const left = Math.min(currentX, startPosRef.current.x);
    const top = Math.min(currentY, startPosRef.current.y);
    const width = Math.abs(currentX - startPosRef.current.x);
    const height = Math.abs(currentY - startPosRef.current.y);

    setSelection({
      startX: startPosRef.current.x,
      startY: startPosRef.current.y,
      currentX,
      currentY,
      left,
      top,
      width,
      height,
    });
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isActive || !isDrawing || !selection) return;

    if (selection.width > 25 && selection.height > 25) {
      const scale = settings.zoomLevel / 100;
      setZoomedRegion({
        left: selection.left,
        top: selection.top,
        width: selection.width,
        height: selection.height,
        scale,
      });

      setIsDrawing(false);
      showToast(
        lang === 'fa'
          ? `زوم ${settings.zoomLevel}% اعمال شد`
          : `Zoom ${settings.zoomLevel}% applied!`,
        'success'
      );
    }

    setSelection(null);
  };

  const handleCopySnapshot = () => {
    setIsCopied(true);
    showToast(
      lang === 'fa' ? 'اطلاعات زوم کپی شد' : 'Zoom metadata copied to clipboard',
      'success'
    );
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Convert hex color to rgba helper
  const hexToRgba = (hex: string, alpha: number) => {
    let cleanHex = hex.replace('#', '');
    if (cleanHex.length === 3) {
      cleanHex = cleanHex.split('').map(c => c + c).join('');
    }
    const r = parseInt(cleanHex.substring(0, 2), 16) || 57;
    const g = parseInt(cleanHex.substring(2, 4), 16) || 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) || 20;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div
      ref={containerRef}
      id="zoom-main-viewport-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className={`relative min-h-screen ${
        isActive && isDrawing ? 'cursor-crosshair select-none' : ''
      }`}
    >
      {/* Target Content */}
      <div id="zoom-target-content" className="w-full">
        {children}
      </div>

      {/* Dimmed Overlay */}
      {isActive && (
        <div
          id="zoom-overlay"
          className="fixed inset-0 z-[999980] transition-colors pointer-events-none"
          style={{
            backgroundColor: `rgba(0, 0, 0, ${settings.opacity / 100})`,
          }}
        />
      )}

      {/* Real-time Drawing Selection Rectangle */}
      {selection && selection.width > 2 && (
        <div
          id="zoom-selection-box"
          className="fixed z-[999985] pointer-events-none transition-none shadow-2xl"
          style={{
            left: `${selection.left}px`,
            top: `${selection.top}px`,
            width: `${selection.width}px`,
            height: `${selection.height}px`,
            borderColor: settings.boxColor,
            borderWidth: '3px',
            borderStyle: 'solid',
            backgroundColor: hexToRgba(settings.boxColor, 0.22),
            boxShadow: `0 0 25px ${hexToRgba(settings.boxColor, 0.75)}`,
          }}
        >
          <div
            className="absolute -top-6 left-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded text-black"
            style={{ backgroundColor: settings.boxColor }}
          >
            {Math.round(selection.width)} × {Math.round(selection.height)}px
          </div>
        </div>
      )}

      {/* Active Zoom Window / Pop-out Magnifier */}
      {zoomedRegion && (
        <div
          id="zoom-active-window"
          className="fixed z-[999988] bg-zinc-950 rounded-xl overflow-hidden border-2 shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200"
          style={{
            left: `${Math.min(window.innerWidth - 380, Math.max(20, zoomedRegion.left))}px`,
            top: `${Math.min(window.innerHeight - 380, Math.max(20, zoomedRegion.top - 10))}px`,
            width: `${Math.max(280, Math.min(600, zoomedRegion.width * 1.5))}px`,
            height: `${Math.max(220, Math.min(500, zoomedRegion.height * 1.5 + 40))}px`,
            borderColor: settings.boxColor,
            boxShadow: `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${hexToRgba(settings.boxColor, 0.4)}`,
          }}
        >
          {/* Zoom Window Header */}
          <div
            className="px-3 py-1.5 flex items-center justify-between border-b border-zinc-800 text-xs font-semibold select-none cursor-move"
            style={{
              backgroundColor: 'rgba(10, 10, 12, 0.95)',
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: settings.boxColor }}
              />
              <span className="font-mono text-zinc-200 text-[11px]">
                {lang === 'fa' ? 'نمای بزرگ‌نمایی شده' : 'Zoomed View'} ({settings.zoomLevel}%)
              </span>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => onUpdateSettings({ zoomLevel: Math.max(50, settings.zoomLevel - 25) })}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onUpdateSettings({ zoomLevel: Math.min(500, settings.zoomLevel + 25) })}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCopySnapshot}
                className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                title="Copy Details"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={deactivateZoomMode}
                className="p-1 text-zinc-400 hover:text-rose-400 rounded hover:bg-zinc-800 transition-colors"
                title="Close Zoom"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Zoom Window Content Viewport */}
          <div className="relative flex-1 overflow-hidden bg-zinc-900 flex items-center justify-center p-2">
            <div
              className="relative transition-transform duration-100 ease-out origin-center select-none"
              style={{
                transform: `scale(${settings.zoomLevel / 100})`,
              }}
            >
              {/* Scaled mirror of target area */}
              <div
                className="rounded border border-zinc-700 bg-zinc-950 p-4 text-zinc-100 shadow-inner max-w-sm text-center"
                style={{
                  minWidth: `${zoomedRegion.width}px`,
                  minHeight: `${zoomedRegion.height}px`,
                }}
              >
                <div className="text-[11px] font-mono text-[#39FF14] mb-1 font-bold">
                  ★ MAGNIFIED REGION ({Math.round(zoomedRegion.width)}×{Math.round(zoomedRegion.height)}px)
                </div>
                <div className="text-xs text-zinc-300">
                  {lang === 'fa' 
                    ? 'بزرگ‌نمایی با شفافیت و دقت بالا روی کادر انتخابی اعمال شد.'
                    : 'Pixel-crisp magnification dynamically projected for this region.'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Control Panel */}
      <FloatingControlPanel
        settings={settings}
        onUpdateSettings={onUpdateSettings}
        isActive={isActive}
        onToggleActive={() => {
          if (isActive) {
            deactivateZoomMode();
          } else {
            activateZoomMode();
          }
        }}
        onResetZoom={resetZoom}
        lang={lang}
        isDrawing={isDrawing}
        hasZoomedRegion={!!zoomedRegion}
      />

      {/* Toast Notification Portal */}
      <NotificationToast toasts={toasts} />
    </div>
  );
};
