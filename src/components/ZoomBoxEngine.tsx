import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ZoomSettings, SelectionRect, ZoomedRegion, ToastMessage } from '../types';
import { FloatingControlPanel } from './FloatingControlPanel';
import { NotificationToast } from './NotificationToast';

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
  const [lockedBox, setLockedBox] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
    fading: boolean;
  } | null>(null);
  const [zoomedRegion, setZoomedRegion] = useState<ZoomedRegion | null>(null);
  const [lastOrigin, setLastOrigin] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExitingZoom, setIsExitingZoom] = useState<boolean>(false);
  const [lensPos, setLensPos] = useState<{ x: number; y: number } | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

    if (selection.width > 15 && selection.height > 15) {
      const currentSel = { ...selection };
      const scale = settings.zoomLevel / 100;
      const originX = currentSel.left + currentSel.width / 2 + window.scrollX;
      const originY = currentSel.top + currentSel.height / 2 + window.scrollY;

      // Lock the selection box for a smooth visual confirmation transition
      setLockedBox({
        left: currentSel.left,
        top: currentSel.top,
        width: currentSel.width,
        height: currentSel.height,
        fading: false,
      });

      setLastOrigin({ x: originX, y: originY });
      setZoomedRegion({
        left: currentSel.left,
        top: currentSel.top,
        width: currentSel.width,
        height: currentSel.height,
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

      // Trigger smooth fade-out / expansion of the focus box
      setTimeout(() => {
        setLockedBox((prev) => prev ? { ...prev, fading: true } : null);
      }, 80);

      setTimeout(() => {
        setLockedBox(null);
      }, 420);
    } else {
      // Single-click zoom: zoom directly centered on the clicked position
      const clickX = selection.startX;
      const clickY = selection.startY;
      const boxW = 160;
      const boxH = 120;
      const left = Math.max(0, clickX - boxW / 2);
      const top = Math.max(0, clickY - boxH / 2);
      const scale = settings.zoomLevel / 100;
      const originX = clickX + window.scrollX;
      const originY = clickY + window.scrollY;

      setLockedBox({
        left,
        top,
        width: boxW,
        height: boxH,
        fading: false,
      });

      setLastOrigin({ x: originX, y: originY });
      setZoomedRegion({
        left,
        top,
        width: boxW,
        height: boxH,
        scale,
        originX,
        originY,
      });

      setIsDrawing(false);
      showToast(
        lang === 'fa'
          ? `زوم ${settings.zoomLevel}% در نقطه کلیک اعمال شد`
          : `Full-page zoom ${settings.zoomLevel}% applied to clicked area!`,
        'success'
      );

      setTimeout(() => {
        setLockedBox((prev) => prev ? { ...prev, fading: true } : null);
      }, 80);

      setTimeout(() => {
        setLockedBox(null);
      }, 420);
    }

    setSelection(null);
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

      {/* Real-time Drawing Selection Rectangle with Smooth Appearance & Precision Reticle */}
      {selection && selection.width > 2 && (
        <div
          id="zoom-selection-box"
          className="fixed z-[999985] pointer-events-none transition-[left,top,width,height] duration-75 ease-out rounded-sm zbp-anim-pop"
          style={{
            left: `${selection.left}px`,
            top: `${selection.top}px`,
            width: `${selection.width}px`,
            height: `${selection.height}px`,
            borderColor: settings.boxColor,
            borderWidth: '2px',
            borderStyle: 'dashed',
            backgroundColor: hexToRgba(settings.boxColor, 0.16),
            boxShadow: `0 0 22px ${hexToRgba(settings.boxColor, 0.65)}, inset 0 0 15px ${hexToRgba(settings.boxColor, 0.2)}`,
          }}
        >
          {/* 4 Precision Corner Targeting Markers */}
          <div
            className="absolute -top-[2px] -left-[2px] w-3 h-3 border-t-2 border-l-2"
            style={{ borderColor: settings.boxColor }}
          />
          <div
            className="absolute -top-[2px] -right-[2px] w-3 h-3 border-t-2 border-r-2"
            style={{ borderColor: settings.boxColor }}
          />
          <div
            className="absolute -bottom-[2px] -left-[2px] w-3 h-3 border-b-2 border-l-2"
            style={{ borderColor: settings.boxColor }}
          />
          <div
            className="absolute -bottom-[2px] -right-[2px] w-3 h-3 border-b-2 border-r-2"
            style={{ borderColor: settings.boxColor }}
          />

          {/* Center Precision Target Crosshair */}
          {selection.width > 50 && selection.height > 50 && (
            <div className="absolute inset-0 flex items-center justify-center opacity-40 pointer-events-none">
              <div className="w-3 h-0.5" style={{ backgroundColor: settings.boxColor }} />
              <div className="w-0.5 h-3 -ml-[7px]" style={{ backgroundColor: settings.boxColor }} />
            </div>
          )}

          {/* High-Precision Dimension Tag */}
          <div
            className="absolute -top-7 left-0 text-[11px] font-mono font-bold px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1.5 backdrop-blur-md zbp-anim-fade"
            style={{
              backgroundColor: '#09090b',
              color: settings.boxColor,
              border: `1px solid ${hexToRgba(settings.boxColor, 0.6)}`,
              boxShadow: `0 2px 10px rgba(0,0,0,0.5), 0 0 12px ${hexToRgba(settings.boxColor, 0.4)}`,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: settings.boxColor }} />
            <span>{Math.round(selection.width)} × {Math.round(selection.height)}px</span>
          </div>
        </div>
      )}

      {/* Smooth Zoom-Start Focus Lock Transition */}
      {lockedBox && (
        <div
          id="zoom-locked-focus-box"
          className={`fixed z-[999986] pointer-events-none rounded-sm transition-all duration-300 ease-out ${
            lockedBox.fading ? 'opacity-0 scale-105 blur-[1px]' : 'opacity-100 scale-100'
          }`}
          style={{
            left: `${lockedBox.left}px`,
            top: `${lockedBox.top}px`,
            width: `${lockedBox.width}px`,
            height: `${lockedBox.height}px`,
            borderColor: '#ffffff',
            borderWidth: '2px',
            borderStyle: 'solid',
            backgroundColor: hexToRgba(settings.boxColor, 0.28),
            boxShadow: `0 0 35px ${hexToRgba(settings.boxColor, 0.95)}, 0 0 70px ${hexToRgba(settings.boxColor, 0.45)}`,
          }}
        />
      )}

      {/* Full-Page Zoom Active Floating Bar */}
      {zoomedRegion && (
        <div
          id="zoom-full-status-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999988] bg-zinc-950 border-2 rounded-full px-5 py-2.5 shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-4 text-xs font-mono zbp-anim-slide-up"
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

      {/* Interactive Magnifier Lens Mode HUD when enabled and cursor moves */}
      {settings.lensMode && lensPos && !isDrawing && !zoomedRegion && (
        <div
          id="zoom-lens-indicator"
          className="fixed z-[999984] pointer-events-none rounded-full border-2 transition-transform duration-75 shadow-2xl flex items-center justify-center backdrop-contrast-125"
          style={{
            left: `${lensPos.x - 90}px`,
            top: `${lensPos.y - 90}px`,
            width: '180px',
            height: '180px',
            borderColor: settings.boxColor,
            boxShadow: `0 0 25px ${hexToRgba(settings.boxColor, 0.6)}, inset 0 0 20px ${hexToRgba(settings.boxColor, 0.2)}`,
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
          }}
        >
          <div
            className="absolute top-1 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full text-black"
            style={{ backgroundColor: settings.boxColor }}
          >
            LENS {settings.zoomLevel}%
          </div>
          {/* Lens crosshairs */}
          <div className="w-4 h-0.5 opacity-60" style={{ backgroundColor: settings.boxColor }} />
          <div className="w-0.5 h-4 opacity-60 -ml-2" style={{ backgroundColor: settings.boxColor }} />
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
