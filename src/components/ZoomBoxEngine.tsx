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
  const [lastOrigin, setLastOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExitingZoom, setIsExitingZoom] = useState<boolean>(false);
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
    setIsExitingZoom(true);
    setZoomedRegion(null);

    setTimeout(() => {
      setIsExitingZoom(false);
    }, 650);
  }, []);

  const resetZoom = useCallback(() => {
    deactivateZoomMode();
    onUpdateSettings({ zoomLevel: 100 });
    showToast(
      lang === 'fa' ? 'زوم با انیمیشن نرم به حالت عادی (۱۰۰٪) بازگشت' : 'Smoothly zoomed out to 100%',
      'info'
    );
  }, [deactivateZoomMode, onUpdateSettings, lang, showToast]);

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const targetKey = settings.shortcutKey || 'Z';
      const matchesKey = e.key.toUpperCase() === targetKey.toUpperCase() || e.code === `Key${targetKey.toUpperCase()}`;
      const matchesCtrl = (e.ctrlKey || e.metaKey) === (settings.shortcutCtrl ?? true);
      const matchesShift = e.shiftKey === (settings.shortcutShift ?? true);
      const matchesAlt = e.altKey === (settings.shortcutAlt ?? false);

      // Custom configurable shortcut: Toggle Zoom Mode
      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        e.preventDefault();
        if (isActive) {
          deactivateZoomMode();
        } else {
          activateZoomMode();
        }
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
  }, [isActive, zoomedRegion, activateZoomMode, deactivateZoomMode, resetZoom, lang, showToast, settings.shortcutKey, settings.shortcutCtrl, settings.shortcutShift, settings.shortcutAlt]);

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
      const originX = selection.left + selection.width / 2 + window.scrollX;
      const originY = selection.top + selection.height / 2 + window.scrollY;

      setLastOrigin({ x: originX, y: originY });
      setZoomedRegion({
        left: selection.left,
        top: selection.top,
        width: selection.width,
        height: selection.height,
        scale,
        originX,
        originY,
      });

      setIsDrawing(false);
      showToast(
        lang === 'fa'
          ? `زوم کامل صفحه ${settings.zoomLevel}% روی ناحیه اعمال شد`
          : `Full-page zoom ${settings.zoomLevel}% applied to selected region!`,
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
      {/* Target Content with Full-Page Transform Zoom & Smooth Zoom-Out */}
      <div 
        id="zoom-target-content" 
        className="w-full will-change-transform"
        style={{
          transform: zoomedRegion ? `scale(${settings.zoomLevel / 100})` : 'scale(1)',
          transformOrigin: zoomedRegion
            ? `${zoomedRegion.originX}px ${zoomedRegion.originY}px`
            : lastOrigin.x !== 0
            ? `${lastOrigin.x}px ${lastOrigin.y}px`
            : 'center center',
          transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
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
          className="fixed z-[999985] pointer-events-none transition-all duration-75 ease-out shadow-2xl"
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

      {/* Full-Page Zoom Active Floating Bar */}
      {zoomedRegion && (
        <div
          id="zoom-full-status-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999988] bg-zinc-950 border-2 rounded-full px-5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4 text-xs font-mono animate-in fade-in slide-in-from-bottom-6 duration-200"
          style={{ borderColor: settings.boxColor }}
        >
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: settings.boxColor }} />
            <span className="text-white font-bold">
              {lang === 'fa' ? `زوم کامل صفحه (${settings.zoomLevel}%)` : `Full-Page Zoom (${settings.zoomLevel}%)`}
            </span>
          </div>

          <div className="flex items-center gap-2 border-l border-zinc-800 pl-4">
            <button
              onClick={() => {
                const newLevel = Math.max(50, settings.zoomLevel - 25);
                onUpdateSettings({ zoomLevel: newLevel });
                setZoomedRegion(prev => prev ? { ...prev, scale: newLevel / 100 } : null);
              }}
              className="px-2 py-1 bg-zinc-900 rounded border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            >
              -
            </button>
            <span className="text-[#39FF14] font-bold">{settings.zoomLevel}%</span>
            <button
              onClick={() => {
                const newLevel = Math.min(500, settings.zoomLevel + 25);
                onUpdateSettings({ zoomLevel: newLevel });
                setZoomedRegion(prev => prev ? { ...prev, scale: newLevel / 100 } : null);
              }}
              className="px-2 py-1 bg-zinc-900 rounded border border-zinc-700 text-zinc-300 hover:text-white cursor-pointer"
            >
              +
            </button>
            <button
              onClick={deactivateZoomMode}
              className="ml-2 px-3 py-1 bg-[#39FF14] text-black font-bold rounded-full hover:bg-white transition-colors cursor-pointer"
            >
              {lang === 'fa' ? 'بازنشانی (Reset)' : 'Reset 100%'}
            </button>
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
