import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Chrome, ShieldCheck, FolderCheck, Flame, Layers, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';

interface Props {
  lang: 'fa' | 'en';
}

export const ExtensionViewer: React.FC<Props> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<'content' | 'manifest' | 'popupHtml' | 'popupJs' | 'background' | 'readme'>('content');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'firefox' | 'chrome'>('firefox');

  const files = {
    content: {
      name: 'content.js',
      desc: 'اسکریپت تزریقی صفحه: Shadow DOM ایزوله، رسم کادر، انیمیشن زوم، Lens و Pan',
      code: `/**
 * Zoom Box Pro - Content Script (v8.6.2)
 * سیستم پیشرفته زوم تمام‌صفحه با رسم کادر و ایزولاسیون کامل با Shadow DOM
 * سازگاری ۱۰۰٪ تضمین‌شده با فایرفاکس (Firefox)، گوگل کروم، بریو و اج
 */
(function () {
  'use strict';
  if (window.__ZOOM_BOX_PRO_INSTANCE__) {
    return;
  }

  const browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  class ZoomBoxProController {
    constructor() {
      this.isDrawingMode = false;
      this.isDragging = false;
      this.isPanning = false;
      this.panStartX = 0;
      this.panStartY = 0;
      this.startX = 0;
      this.startY = 0;
      this.isZoomed = false;
      this.lastOriginX = window.innerWidth / 2;
      this.lastOriginY = window.innerHeight / 2;

      this.settings = {
        zoomLevel: 200,
        boxColor: '#39FF14',
        opacity: 50,
        shortcutKey: 'Z',
        shortcutCtrl: true,
        shortcutShift: true,
        shortcutAlt: false,
        extensionEnabled: true,
        lensMode: false
      };

      this.rootContainer = null;
      this.shadowRoot = null;
      this.overlay = null;
      this.selectionBox = null;
      this.floatingPanel = null;
      this.statusBar = null;
      this.lensHUD = null;

      this.init();
    }

    async init() {
      await this.loadSettings();
      this.injectHostGlobalStyles();
      this.buildShadowDOM();
      this.bindListeners();
      this.updateStyles();
    }

    async loadSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
          const stored = await browserAPI.storage.local.get(null);
          if (stored && stored.zoomLevel !== undefined) {
            this.settings = { ...this.settings, ...stored };
            this.applyPanelValues();
          }
        }
      } catch (e) {
        console.warn('ZBP storage load fallback:', e);
      }
    }

    async saveSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
          await browserAPI.storage.local.set(this.settings);
        }
      } catch (e) {
        console.warn('ZBP storage save error:', e);
      }
    }

    injectHostGlobalStyles() {
      const existing = (document.getElementById && document.getElementById('zbp-host-styles')) || 
                       (document.head && document.head.querySelector && document.head.querySelector('#zbp-host-styles'));
      if (existing) return;

      const style = document.createElement('style');
      style.id = 'zbp-host-styles';
      style.textContent = \`
        html {
          transform-origin: 0 0;
        }
        body {
          transform-origin: 0 0;
        }
        #zbp-root-host {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          width: 0 !important;
          height: 0 !important;
          z-index: 2147483645 !important;
          pointer-events: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        #zbp-root-host.zbp-host-active {
          width: 100vw !important;
          height: 100vh !important;
          pointer-events: auto !important;
        }
      \`;
      (document.head || document.documentElement).appendChild(style);
    }

    buildShadowDOM() {
      if (this.rootContainer && this.shadowRoot) return;

      this.rootContainer = document.createElement('div');
      this.rootContainer.id = 'zbp-root-host';
      this.shadowRoot = this.rootContainer.attachShadow({ mode: 'open' });

      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = \`
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Vazirmatn, Tahoma, sans-serif !important;
          direction: rtl !important;
        }
        * {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        #zbp-overlay {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          width: 100vw !important;
          height: 100vh !important;
          z-index: 2147483641 !important;
          background: rgba(0, 0, 0, 0.45) !important;
          cursor: crosshair !important;
          display: none;
          user-select: none !important;
          -webkit-user-select: none !important;
          touch-action: none !important;
          pointer-events: auto !important;
        }
        .zbp-overlay-tip {
          position: absolute !important;
          top: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(9, 9, 11, 0.95) !important;
          color: #39FF14 !important;
          border: 1px solid rgba(57, 255, 20, 0.6) !important;
          padding: 10px 22px !important;
          border-radius: 9999px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          box-shadow: 0 4px 25px rgba(0,0,0,0.7), 0 0 15px rgba(57,255,20,0.35) !important;
          pointer-events: none !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        @keyframes zbp-box-pulse {
          0%, 100% {
            box-shadow: 0 0 18px rgba(57, 255, 20, 0.6), inset 0 0 10px rgba(57, 255, 20, 0.15) !important;
          }
          50% {
            box-shadow: 0 0 28px rgba(57, 255, 20, 0.9), inset 0 0 18px rgba(57, 255, 20, 0.3) !important;
          }
        }
        @keyframes zbp-zoom-lock {
          0% {
            transform: scale(1) !important;
            opacity: 1 !important;
            border-color: #ffffff !important;
            box-shadow: 0 0 35px rgba(57, 255, 20, 1), 0 0 70px rgba(57, 255, 20, 0.5) !important;
          }
          60% {
            transform: scale(1.04) !important;
            opacity: 0.9 !important;
          }
          100% {
            transform: scale(1.08) !important;
            opacity: 0 !important;
            filter: blur(2px) !important;
          }
        }
        #zbp-selection-box {
          position: fixed !important;
          border: 2px dashed #39FF14 !important;
          background: rgba(57, 255, 20, 0.16) !important;
          box-shadow: 0 0 20px rgba(57, 255, 20, 0.65), inset 0 0 12px rgba(57, 255, 20, 0.2) !important;
          z-index: 2147483642 !important;
          display: none;
          pointer-events: none !important;
          border-radius: 3px !important;
          animation: zbp-box-pulse 2s ease-in-out infinite !important;
        }
        .zbp-corner {
          position: absolute !important;
          width: 8px !important;
          height: 8px !important;
          border-color: #39FF14 !important;
          pointer-events: none !important;
        }
        .zbp-corner-tl { top: -2px !important; left: -2px !important; border-top: 2px solid #39FF14 !important; border-left: 2px solid #39FF14 !important; }
        .zbp-corner-tr { top: -2px !important; right: -2px !important; border-top: 2px solid #39FF14 !important; border-right: 2px solid #39FF14 !important; }
        .zbp-corner-bl { bottom: -2px !important; left: -2px !important; border-bottom: 2px solid #39FF14 !important; border-left: 2px solid #39FF14 !important; }
        .zbp-corner-br { bottom: -2px !important; right: -2px !important; border-bottom: 2px solid #39FF14 !important; border-right: 2px solid #39FF14 !important; }
        .zbp-dimensions-badge {
          position: absolute !important;
          top: -28px !important;
          left: 0 !important;
          background: #09090b !important;
          color: #39FF14 !important;
          border: 1px solid rgba(57, 255, 20, 0.6) !important;
          font-family: monospace !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          padding: 2px 8px !important;
          border-radius: 9999px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.6), 0 0 10px rgba(57,255,20,0.3) !important;
          white-space: nowrap !important;
          display: flex !important;
          align-items: center !important;
          gap: 4px !important;
        }
        .zbp-focus-lock {
          animation: zbp-zoom-lock 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
        }
        #zbp-lens-hud {
          position: fixed !important;
          width: 170px !important;
          height: 170px !important;
          border: 2px solid #39FF14 !important;
          border-radius: 50% !important;
          pointer-events: none !important;
          z-index: 2147483643 !important;
          box-shadow: 0 0 25px rgba(57, 255, 20, 0.45), inset 0 0 15px rgba(57, 255, 20, 0.15) !important;
          display: none;
          transform: translate(-50%, -50%) !important;
          backdrop-filter: contrast(1.1) !important;
        }
        .zbp-lens-cross-h {
          position: absolute !important;
          top: 50% !important;
          left: 10px !important;
          right: 10px !important;
          height: 1px !important;
          background: rgba(57, 255, 20, 0.6) !important;
        }
        .zbp-lens-cross-v {
          position: absolute !important;
          left: 50% !important;
          top: 10px !important;
          bottom: 10px !important;
          width: 1px !important;
          background: rgba(57, 255, 20, 0.6) !important;
        }
        .zbp-lens-label {
          position: absolute !important;
          bottom: -24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: #09090b !important;
          color: #39FF14 !important;
          border: 1px solid rgba(57, 255, 20, 0.7) !important;
          padding: 2px 8px !important;
          border-radius: 9999px !important;
          font-family: monospace !important;
          font-size: 10px !important;
          font-weight: 700 !important;
          white-space: nowrap !important;
        }
        #zbp-floating-panel {
          position: fixed !important;
          bottom: 24px !important;
          right: 24px !important;
          width: 290px !important;
          background: #090d0b !important;
          color: #f4f4f5 !important;
          border: 2px solid #39FF14 !important;
          border-radius: 16px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(57, 255, 20, 0.2) !important;
          z-index: 2147483643 !important;
          padding: 14px !important;
          user-select: none !important;
          display: none;
          pointer-events: auto !important;
          direction: rtl !important;
        }
        .zbp-panel-header {
          display: flex !important;
          align-items: center !important;
          justify-content: space-between !important;
          border-bottom: 1px solid rgba(39, 39, 42, 0.8) !important;
          padding-bottom: 8px !important;
          margin-bottom: 12px !important;
        }
        .zbp-panel-title {
          font-size: 13px !important;
          font-weight: 700 !important;
          color: #7dd3fc !important;
          display: flex !important;
          align-items: center !important;
          gap: 6px !important;
        }
        .zbp-close-btn {
          background: #000000 !important;
          border: 1px solid rgba(56, 189, 248, 0.8) !important;
          color: #39FF14 !important;
          cursor: pointer !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          padding: 4px 8px !important;
          border-radius: 6px !important;
          transition: all 0.2s ease !important;
        }
        .zbp-close-btn:hover {
          background: rgba(56, 189, 248, 0.2) !important;
        }
        .zbp-btn {
          width: 100% !important;
          padding: 9px 12px !important;
          border-radius: 10px !important;
          font-size: 12px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          gap: 6px !important;
          transition: all 0.2s ease !important;
          margin-bottom: 8px !important;
        }
        .zbp-btn-primary {
          background: #000000 !important;
          color: #39FF14 !important;
          border: 2px solid #38bdf8 !important;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.2) !important;
        }
        .zbp-btn-primary:hover {
          background: rgba(56, 189, 248, 0.15) !important;
        }
        .zbp-btn-active {
          background: #39FF14 !important;
          color: #000000 !important;
          border-color: #39FF14 !important;
        }
        .zbp-slider-wrap {
          margin-top: 8px !important;
        }
        .zbp-slider-header {
          display: flex !important;
          justify-content: space-between !important;
          font-size: 12px !important;
          color: #7dd3fc !important;
          font-weight: 700 !important;
          margin-bottom: 6px !important;
        }
        .zbp-slider-val {
          color: #39FF14 !important;
          font-family: monospace !important;
        }
        .zbp-range {
          width: 100% !important;
          height: 6px !important;
          background: #27272a !important;
          border-radius: 4px !important;
          accent-color: #39FF14 !important;
          cursor: pointer !important;
        }
        #zbp-status-bar {
          position: fixed !important;
          bottom: 24px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: #09090b !important;
          border: 2px solid #39FF14 !important;
          border-radius: 9999px !important;
          padding: 8px 18px !important;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(57, 255, 20, 0.3) !important;
          z-index: 2147483644 !important;
          display: none;
          align-items: center !important;
          gap: 12px !important;
          font-family: monospace !important;
          font-size: 12px !important;
          color: #ffffff !important;
          pointer-events: auto !important;
          direction: ltr !important;
        }
        .zbp-status-text {
          font-weight: 700 !important;
          color: #7dd3fc !important;
          direction: rtl !important;
        }
        .zbp-status-val {
          color: #39FF14 !important;
          font-weight: 700 !important;
        }
        .zbp-bar-btn {
          background: #18181b !important;
          border: 1px solid #3f3f46 !important;
          color: #f4f4f5 !important;
          padding: 3px 8px !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          font-weight: 700 !important;
          transition: all 0.2s ease !important;
        }
        .zbp-bar-btn:hover {
          background: #27272a !important;
          color: #39FF14 !important;
        }
        .zbp-bar-btn-reset {
          background: rgba(225, 29, 72, 0.2) !important;
          color: #fb7185 !important;
          border-color: rgba(225, 29, 72, 0.5) !important;
          padding: 3px 10px !important;
          border-radius: 9999px !important;
        }
        .zbp-bar-btn-reset:hover {
          background: rgba(225, 29, 72, 0.4) !important;
          color: #ffffff !important;
        }
      \`;
      this.shadowRoot.appendChild(shadowStyle);

      this.overlay = document.createElement('div');
      this.overlay.id = 'zbp-overlay';
      this.overlay.innerHTML = \`
        <div class="zbp-overlay-tip">
          <span>🎯</span>
          <span>با درگ کردن موس، کادر زوم را رسم کنید (کلید Esc برای لغو)</span>
        </div>
      \`;
      this.shadowRoot.appendChild(this.overlay);

      this.selectionBox = document.createElement('div');
      this.selectionBox.id = 'zbp-selection-box';
      this.selectionBox.innerHTML = \`
        <div class="zbp-corner zbp-corner-tl"></div>
        <div class="zbp-corner zbp-corner-tr"></div>
        <div class="zbp-corner zbp-corner-bl"></div>
        <div class="zbp-corner zbp-corner-br"></div>
        <div class="zbp-dimensions-badge" id="zbp-dim-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:#39FF14;display:inline-block;"></span>
          <span id="zbp-dim-text">0 × 0px</span>
        </div>
      \`;
      this.shadowRoot.appendChild(this.selectionBox);

      this.lensHUD = document.createElement('div');
      this.lensHUD.id = 'zbp-lens-hud';
      this.lensHUD.innerHTML = \`
        <div class="zbp-lens-cross-h"></div>
        <div class="zbp-lens-cross-v"></div>
        <div class="zbp-lens-label" id="zbp-lens-label">LENS \${this.settings.zoomLevel}%</div>
      \`;
      this.shadowRoot.appendChild(this.lensHUD);

      this.floatingPanel = document.createElement('div');
      this.floatingPanel.id = 'zbp-floating-panel';
      this.floatingPanel.innerHTML = \`
        <div class="zbp-panel-header">
          <div class="zbp-panel-title">
            <span>🔍</span>
            <span>Zoom Box Pro</span>
          </div>
          <button id="zbp-close-panel" class="zbp-close-btn" title="بستن پنل">✕</button>
        </div>
        <button id="zbp-toggle-draw" class="zbp-btn zbp-btn-primary">
          ✏️ شروع انتخاب محدوده زوم
        </button>
        <div class="zbp-slider-wrap">
          <div class="zbp-slider-header">
            <span>درصد بزرگ‌نمایی:</span>
            <span id="zbp-level-val" class="zbp-slider-val">\${this.settings.zoomLevel}%</span>
          </div>
          <input type="range" id="zbp-zoom-slider" class="zbp-range" min="125" max="500" step="25" value="\${this.settings.zoomLevel}">
        </div>
      \`;
      this.shadowRoot.appendChild(this.floatingPanel);

      this.statusBar = document.createElement('div');
      this.statusBar.id = 'zbp-status-bar';
      this.statusBar.innerHTML = \`
        <span class="zbp-status-text">بزرگ‌نمایی فعال:</span>
        <span id="zbp-bar-val" class="zbp-status-val">\${this.settings.zoomLevel}%</span>
        <button id="zbp-bar-dec" class="zbp-bar-btn" title="کاهش">-</button>
        <button id="zbp-bar-inc" class="zbp-bar-btn" title="افزایش">+</button>
        <button id="zbp-bar-reset" class="zbp-bar-btn zbp-bar-btn-reset">بازگشت (Esc)</button>
      \`;
      this.shadowRoot.appendChild(this.statusBar);

      (document.documentElement || document.body).appendChild(this.rootContainer);
    }

    updateStyles() {
      if (!this.shadowRoot) return;
      let styleEl = this.shadowRoot.querySelector('#zbp-dynamic-style');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'zbp-dynamic-style';
        this.shadowRoot.appendChild(styleEl);
      }

      const c = this.settings.boxColor || '#39FF14';
      let r = 57, g = 255, b = 20;
      if (c.match(/^#([0-9a-f]{6})$/i)) {
        r = parseInt(c.slice(1, 3), 16);
        g = parseInt(c.slice(3, 5), 16);
        b = parseInt(c.slice(5, 7), 16);
      }

      styleEl.textContent = \`
        .zbp-overlay-tip, .zbp-dimensions-badge, #zbp-lens-hud, .zbp-lens-label {
          color: \${c} !important;
          border-color: rgba(\${r}, \${g}, \${b}, 0.6) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(\${r}, \${g}, \${b}, 0.35) !important;
        }
        #zbp-dim-badge span {
          background: \${c} !important;
        }
        .zbp-lens-cross-h, .zbp-lens-cross-v {
          background: rgba(\${r}, \${g}, \${b}, 0.6) !important;
        }
        #zbp-selection-box {
          border-color: \${c} !important;
          background: rgba(\${r}, \${g}, \${b}, 0.16) !important;
          box-shadow: 0 0 20px rgba(\${r}, \${g}, \${b}, 0.65), inset 0 0 12px rgba(\${r}, \${g}, \${b}, 0.2) !important;
        }
        .zbp-corner {
          border-color: \${c} !important;
        }
      \`;

      if (this.isZoomed) {
        let dimOverlay = this.shadowRoot.querySelector('#zbp-dim-overlay');
        if (!dimOverlay) {
          dimOverlay = document.createElement('div');
          dimOverlay.id = 'zbp-dim-overlay';
          dimOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483640;transition:opacity 0.65s;';
          this.shadowRoot.insertBefore(dimOverlay, this.shadowRoot.firstChild);
        }
        dimOverlay.style.backgroundColor = \`rgba(0,0,0,\${this.settings.opacity / 100})\`;
        dimOverlay.style.opacity = '1';
      } else {
        const dimOverlay = this.shadowRoot.querySelector('#zbp-dim-overlay');
        if (dimOverlay) {
          dimOverlay.style.opacity = '0';
        }
      }
    }

    applyPanelValues() {
      if (!this.shadowRoot) return;
      const levelVal = this.shadowRoot.querySelector('#zbp-level-val');
      const slider = this.shadowRoot.querySelector('#zbp-zoom-slider');
      const lensLabel = this.shadowRoot.querySelector('#zbp-lens-label');
      if (levelVal) levelVal.textContent = \`\${this.settings.zoomLevel}%\`;
      if (slider) slider.value = this.settings.zoomLevel;
      if (lensLabel) lensLabel.textContent = \`LENS \${this.settings.zoomLevel}%\`;
    }

    bindListeners() {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
        browserAPI.runtime.onMessage.addListener((req, sender, sendResponse) => {
          if (!req) return;
          if (req.action === 'toggleExtensionUI') {
            this.togglePanel();
          } else if (req.action === 'startDrawingMode') {
            this.startDrawingMode();
          } else if (req.action === 'updateZoomLevel') {
            if (req.zoomLevel) {
              this.settings.zoomLevel = req.zoomLevel;
              this.applyPanelValues();
              if (this.isZoomed) this.updateZoomScale();
            }
          } else if (req.action === 'updateSettings') {
            if (req.settings) {
              this.settings = { ...this.settings, ...req.settings };
              this.applyPanelValues();
              this.updateStyles();
              if (this.isZoomed) this.updateZoomScale();
            }
          } else if (req.action === 'resetZoom') {
            this.zoomOutSmoothly();
          }
          if (typeof sendResponse === 'function') {
            sendResponse({ success: true, isZoomed: this.isZoomed });
          }
          return true;
        });
      }

      if (this.shadowRoot) {
        const closeBtn = this.shadowRoot.querySelector('#zbp-close-panel');
        if (closeBtn) {
          closeBtn.addEventListener('click', () => {
            if (this.floatingPanel) this.floatingPanel.style.display = 'none';
          });
        }

        const drawBtn = this.shadowRoot.querySelector('#zbp-toggle-draw');
        if (drawBtn) {
          drawBtn.addEventListener('click', () => {
            if (this.isDrawingMode) {
              this.cancelDrawing();
            } else {
              this.startDrawingMode();
            }
          });
        }

        const slider = this.shadowRoot.querySelector('#zbp-zoom-slider');
        if (slider) {
          slider.addEventListener('input', async (e) => {
            this.settings.zoomLevel = parseInt(e.target.value, 10);
            const levelVal = this.shadowRoot.querySelector('#zbp-level-val');
            if (levelVal) levelVal.textContent = \`\${this.settings.zoomLevel}%\`;
            await this.saveSettings();
            if (this.isZoomed) {
              this.updateZoomScale();
            }
          });
        }

        const decBtn = this.shadowRoot.querySelector('#zbp-bar-dec');
        if (decBtn) {
          decBtn.addEventListener('click', async () => {
            this.settings.zoomLevel = Math.max(50, this.settings.zoomLevel - 25);
            this.applyPanelValues();
            this.updateZoomScale();
            await this.saveSettings();
          });
        }

        const incBtn = this.shadowRoot.querySelector('#zbp-bar-inc');
        if (incBtn) {
          incBtn.addEventListener('click', async () => {
            this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
            this.applyPanelValues();
            this.updateZoomScale();
            await this.saveSettings();
          });
        }

        const resetBtn = this.shadowRoot.querySelector('#zbp-bar-reset');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.zoomOutSmoothly();
          });
        }
      }

      // Keyboard Controls
      window.addEventListener('keydown', (e) => {
        const tag = e.target.tagName ? e.target.tagName.toLowerCase() : '';
        if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;

        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;
        const key = e.key ? e.key.toUpperCase() : '';
        const code = e.code ? e.code.replace('Key', '').toUpperCase() : '';

        const matchCtrl = this.settings.shortcutCtrl ? isCtrl : !isCtrl;
        const matchShift = this.settings.shortcutShift ? isShift : !isShift;
        const matchAlt = this.settings.shortcutAlt ? isAlt : !isAlt;
        const matchKey = (key === this.settings.shortcutKey.toUpperCase()) || (code === this.settings.shortcutKey.toUpperCase());

        if (matchCtrl && matchShift && matchAlt && matchKey) {
          e.preventDefault();
          e.stopPropagation();
          if (this.isDrawingMode) {
            this.cancelDrawing();
          } else {
            this.startDrawingMode();
          }
        } else if (e.key === 'Escape') {
          if (this.isDrawingMode) {
            this.cancelDrawing();
          } else if (this.isZoomed) {
            this.zoomOutSmoothly();
          }
        } else if (this.isZoomed && !this.isDrawingMode) {
          if (e.key === '+' || e.key === '=') {
            e.preventDefault();
            this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
            this.applyPanelValues();
            this.updateZoomScale();
          } else if (e.key === '-' || e.key === '_') {
            e.preventDefault();
            this.settings.zoomLevel = Math.max(50, this.settings.zoomLevel - 25);
            this.applyPanelValues();
            this.updateZoomScale();
          } else if (e.key === '0') {
            e.preventDefault();
            this.zoomOutSmoothly();
          }
        }
      }, true);

      // Lens Mode Cursor Follower
      window.addEventListener('mousemove', (e) => {
        if (this.settings.lensMode && !this.isDrawingMode && !this.isZoomed && this.lensHUD) {
          this.lensHUD.style.display = 'block';
          this.lensHUD.style.left = \`\${e.clientX}px\`;
          this.lensHUD.style.top = \`\${e.clientY}px\`;
        } else if (this.lensHUD) {
          this.lensHUD.style.display = 'none';
        }
      }, { passive: true });

      // Drawing Overlay Start
      const startDraw = (clientX, clientY) => {
        this.isDragging = true;
        this.startX = clientX;
        this.startY = clientY;
        if (this.selectionBox) {
          this.selectionBox.classList.remove('zbp-focus-lock');
          this.selectionBox.style.display = 'block';
          this.selectionBox.style.left = \`\${this.startX}px\`;
          this.selectionBox.style.top = \`\${this.startY}px\`;
          this.selectionBox.style.width = '0px';
          this.selectionBox.style.height = '0px';
        }
      };

      if (this.overlay) {
        this.overlay.addEventListener('mousedown', (e) => {
          if (e.button !== 0) return;
          startDraw(e.clientX, e.clientY);
          e.preventDefault();
          e.stopPropagation();
        });

        this.overlay.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) {
            startDraw(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
          }
        }, { passive: false });
      }

      // Drawing Overlay Drag Move
      const moveDraw = (clientX, clientY) => {
        if (!this.isDragging || !this.isDrawingMode || !this.selectionBox) return;
        const currentX = Math.max(0, Math.min(window.innerWidth, clientX));
        const currentY = Math.max(0, Math.min(window.innerHeight, clientY));
        const left = Math.min(currentX, this.startX);
        const top = Math.min(currentY, this.startY);
        const width = Math.abs(currentX - this.startX);
        const height = Math.abs(currentY - this.startY);

        this.selectionBox.style.left = \`\${left}px\`;
        this.selectionBox.style.top = \`\${top}px\`;
        this.selectionBox.style.width = \`\${width}px\`;
        this.selectionBox.style.height = \`\${height}px\`;

        const dimText = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-dim-text') : null;
        if (dimText) {
          dimText.textContent = \`\${Math.round(width)} × \${Math.round(height)}px\`;
        }
      };

      window.addEventListener('mousemove', (e) => {
        if (this.isDragging && this.isDrawingMode) {
          moveDraw(e.clientX, e.clientY);
          e.preventDefault();
        }
      }, { passive: false });

      window.addEventListener('touchmove', (e) => {
        if (this.isDragging && this.isDrawingMode && e.touches && e.touches[0]) {
          moveDraw(e.touches[0].clientX, e.touches[0].clientY);
          e.preventDefault();
        }
      }, { passive: false });

      // Drawing Overlay End / Apply Zoom
      const endDraw = () => {
        if (!this.isDragging || !this.isDrawingMode || !this.selectionBox) return;
        this.isDragging = false;
        const rect = this.selectionBox.getBoundingClientRect();

        this.selectionBox.classList.add('zbp-focus-lock');
        setTimeout(() => {
          if (this.selectionBox) {
            this.selectionBox.style.display = 'none';
            this.selectionBox.classList.remove('zbp-focus-lock');
          }
        }, 380);

        this.cancelDrawing();

        if (rect.width >= 15 && rect.height >= 15) {
          this.applyFullPageZoom(rect);
        } else {
          // Single-click zoom: centered 160x120 around click point
          this.applyFullPageZoom({
            left: Math.max(0, this.startX - 80),
            top: Math.max(0, this.startY - 60),
            width: 160,
            height: 120
          });
        }
      };

      window.addEventListener('mouseup', (e) => {
        if (this.isDragging && this.isDrawingMode) {
          endDraw();
        }
      });

      window.addEventListener('touchend', (e) => {
        if (this.isDragging && this.isDrawingMode) {
          endDraw();
        }
      });

      // Pan support when zoomed (Middle click or Space+Drag)
      window.addEventListener('mousedown', (e) => {
        if (this.isZoomed && (e.button === 1 || (e.button === 0 && e.spaceKey))) {
          this.isPanning = true;
          this.panStartX = e.clientX;
          this.panStartY = e.clientY;
          e.preventDefault();
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isPanning && this.isZoomed) {
          const dx = e.clientX - this.panStartX;
          const dy = e.clientY - this.panStartY;
          this.panStartX = e.clientX;
          this.panStartY = e.clientY;
          this.lastOriginX -= dx;
          this.lastOriginY -= dy;
          const target = document.body || document.documentElement;
          target.style.transition = 'none';
          target.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
        }
      });

      window.addEventListener('mouseup', (e) => {
        if (this.isPanning) {
          this.isPanning = false;
        }
      });
    }

    togglePanel() {
      if (!this.floatingPanel) return;
      if (this.floatingPanel.style.display === 'block') {
        this.floatingPanel.style.display = 'none';
      } else {
        this.floatingPanel.style.display = 'block';
      }
    }

    startDrawingMode() {
      // If already zoomed, smoothly reset first for crisp selection
      if (this.isZoomed) {
        this.zoomOutSmoothly();
      }

      this.isDrawingMode = true;
      if (this.rootContainer) {
        this.rootContainer.classList.add('zbp-host-active');
      }
      if (this.overlay) this.overlay.style.display = 'block';
      if (this.lensHUD) this.lensHUD.style.display = 'none';

      const drawBtn = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-toggle-draw') : null;
      if (drawBtn) {
        drawBtn.textContent = '❌ لغو انتخاب';
        drawBtn.classList.add('zbp-btn-active');
      }
    }

    cancelDrawing() {
      this.isDrawingMode = false;
      this.isDragging = false;
      if (this.rootContainer && !this.isZoomed) {
        this.rootContainer.classList.remove('zbp-host-active');
      }
      if (this.overlay) this.overlay.style.display = 'none';
      if (this.selectionBox) this.selectionBox.style.display = 'none';
      const drawBtn = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-toggle-draw') : null;
      if (drawBtn) {
        drawBtn.textContent = '✏️ شروع انتخاب محدوده زوم';
        drawBtn.classList.remove('zbp-btn-active');
      }
    }

    applyFullPageZoom(rect) {
      this.isZoomed = true;
      const scale = this.settings.zoomLevel / 100;
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      this.lastOriginX = rect.left + (rect.width / 2) + scrollX;
      this.lastOriginY = rect.top + (rect.height / 2) + scrollY;

      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      target.style.transform = \`scale(\${scale})\`;

      if (this.statusBar) {
        this.statusBar.style.display = 'flex';
        const valEl = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-bar-val') : null;
        if (valEl) valEl.textContent = \`\${this.settings.zoomLevel}%\`;
      }
      this.updateStyles();
    }

    updateZoomScale() {
      if (!this.isZoomed) return;
      const scale = this.settings.zoomLevel / 100;
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transform = \`scale(\${scale})\`;
      if (this.statusBar) {
        const valEl = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-bar-val') : null;
        if (valEl) valEl.textContent = \`\${this.settings.zoomLevel}%\`;
      }
      this.updateStyles();
    }

    zoomOutSmoothly() {
      this.isZoomed = false;
      this.cancelDrawing();
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      target.style.transform = 'scale(1)';
      if (this.statusBar) {
        this.statusBar.style.display = 'none';
      }
      this.updateStyles();
      setTimeout(() => {
        if (!this.isZoomed) {
          target.style.transform = 'none';
          target.style.transformOrigin = 'initial';
        }
      }, 700);
    }
  }

  function launch() {
    window.__ZOOM_BOX_PRO_INSTANCE__ = new ZoomBoxProController();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', launch);
  } else {
    launch();
  }
})();
`,
    },
    manifest: {
      name: 'manifest.json',
      desc: 'فایل مانیفست استاندارد Manifest V3 سازگار با فایرفاکس، کروم، بریو و اج',
      code: `{
  "manifest_version": 3,
  "name": "Zoom Box Pro - زوم حرفه‌ای صفحه",
  "version": "8.6.2",
  "description": "افزونه زوم حرفه‌ای تمام‌صفحه با رسم کادر انتخابی و انیمیشن روان - سازگار کامل با فایرفاکس، کروم، بریو و اج",
  "browser_specific_settings": {
    "gecko": {
      "id": "zoomboxpro@firefox.extension",
      "strict_min_version": "109.0"
    }
  },
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "<all_urls>"
  ],
  "action": {
    "default_popup": "popup.html",
    "default_title": "Zoom Box Pro - کنترل و زوم صفحه",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "scripts": ["background.js"]
  },
  "commands": {
    "toggle-draw": {
      "suggested_key": {
        "default": "Ctrl+Shift+Z",
        "mac": "Command+Shift+Z"
      },
      "description": "شروع انتخاب و رسم کادر زوم"
    },
    "reset-zoom": {
      "suggested_key": {
        "default": "Ctrl+Shift+X",
        "mac": "Command+Shift+X"
      },
      "description": "بازنشانی زوم صفحه"
    }
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end",
      "all_frames": false
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,
    },
    popupHtml: {
      name: 'popup.html',
      desc: 'رابط کاربری پاپ‌آپ با کنترل‌های کامل زوم، رنگ، میانبرها و نشانگر ذره‌بین',
      code: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zoom Box Pro</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      user-select: none;
      -webkit-user-select: none;
    }
    body {
      width: 320px;
      padding: 14px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Vazirmatn, Tahoma, sans-serif;
      background-color: #09090b;
      color: #f4f4f5;
      font-size: 13px;
      line-height: 1.4;
      direction: rtl;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid rgba(39, 39, 42, 0.8);
    }
    .header-title {
      font-weight: 800;
      font-size: 13px;
      color: #38bdf8;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #39FF14;
      box-shadow: 0 0 8px #39FF14;
      display: inline-block;
    }
    .header-btn {
      background: #18181b;
      border: 1px solid #3f3f46;
      color: #a1a1aa;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 6px;
      transition: all 0.2s;
    }
    .header-btn:hover {
      color: #39FF14;
      border-color: #39FF14;
    }
    .btn-main {
      width: 100%;
      padding: 10px 14px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
      transition: all 0.2s ease;
    }
    .btn-activate {
      background: #000000;
      color: #39FF14;
      border: 2px solid #39FF14;
      box-shadow: 0 0 12px rgba(57, 255, 20, 0.25);
    }
    .btn-activate:hover {
      background: rgba(57, 255, 20, 0.15);
      box-shadow: 0 0 18px rgba(57, 255, 20, 0.45);
    }
    .btn-reset {
      background: #09090b;
      color: #fb7185;
      border: 1px solid rgba(225, 29, 72, 0.6);
    }
    .btn-reset:hover {
      background: rgba(225, 29, 72, 0.15);
      border-color: #fb7185;
      color: #ffffff;
    }
    .presets-wrap {
      margin-bottom: 10px;
    }
    .presets-label {
      font-size: 11px;
      color: #7dd3fc;
      font-weight: 700;
      margin-bottom: 6px;
      display: block;
    }
    .presets-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 6px;
    }
    .preset-btn {
      background: #18181b;
      border: 1px solid #3f3f46;
      color: #d4d4d8;
      border-radius: 8px;
      padding: 6px 0;
      font-family: monospace;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .preset-btn:hover {
      border-color: #7dd3fc;
      color: #ffffff;
    }
    .preset-btn.active {
      border-color: #39FF14;
      background: rgba(57, 255, 20, 0.18);
      color: #39FF14;
      box-shadow: 0 0 8px rgba(57, 255, 20, 0.35);
    }
    .slider-section {
      margin-bottom: 10px;
    }
    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .slider-title {
      font-size: 12px;
      font-weight: 700;
      color: #7dd3fc;
    }
    .badge-val {
      font-family: monospace;
      font-weight: 700;
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 6px;
      background: rgba(57, 255, 20, 0.15);
      border: 1px solid rgba(57, 255, 20, 0.5);
      color: #39FF14;
    }
    input[type="range"] {
      width: 100%;
      accent-color: #39FF14;
      cursor: pointer;
      height: 5px;
      background: #27272a;
      border-radius: 3px;
    }
    .two-cols {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 10px;
    }
    .col-header {
      font-size: 11px;
      font-weight: 700;
      color: #7dd3fc;
      margin-bottom: 4px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .color-picker-box {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }
    .color-preview-btn {
      width: 36px;
      height: 30px;
      border-radius: 8px;
      border: 2px solid rgba(255, 255, 255, 0.6);
      background: #39FF14;
      cursor: pointer;
      transition: transform 0.15s;
    }
    .color-preview-btn:hover {
      transform: scale(1.05);
    }
    .hex-code {
      font-family: monospace;
      font-size: 11px;
      color: #d4d4d8;
      font-weight: 600;
      text-transform: uppercase;
    }
    .shortcut-box {
      border-top: 1px solid rgba(39, 39, 42, 0.8);
      padding-top: 8px;
      margin-bottom: 8px;
    }
    .shortcut-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
    }
    .shortcut-badge {
      font-family: monospace;
      font-size: 11px;
      font-weight: 700;
      color: #39FF14;
      background: #000;
      border: 1px solid rgba(56, 189, 248, 0.6);
      padding: 2px 7px;
      border-radius: 6px;
    }
    .modifiers-container {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 6px;
      background: #09090b;
      border: 1px solid #27272a;
      border-radius: 10px;
      padding: 6px 8px;
      margin-bottom: 6px;
    }
    .mod-item {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 11px;
      color: #f4f4f5;
      font-weight: 600;
      cursor: pointer;
    }
    .mod-checkbox {
      width: 15px;
      height: 15px;
      border-radius: 4px;
      background: #18181b;
      border: 1px solid #52525b;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      color: #000;
      font-weight: 900;
    }
    .mod-checkbox.checked {
      background: #39FF14;
      border-color: #39FF14;
    }
    .key-select-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .key-select-label {
      font-size: 11px;
      color: #d4d4d8;
      font-weight: 600;
    }
    .key-dropdown {
      background: #000;
      color: #39FF14;
      border: 1px solid rgba(56, 189, 248, 0.7);
      border-radius: 8px;
      padding: 3px 8px;
      font-family: monospace;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
    }
    .lens-row {
      border-top: 1px solid rgba(39, 39, 42, 0.8);
      padding-top: 8px;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
    }
    .lens-title {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 700;
      color: #f4f4f5;
    }
    .footer-text {
      text-align: center;
      font-family: monospace;
      font-size: 10px;
      color: #a1a1aa;
      padding-top: 4px;
    }
    .restricted-msg {
      display: none;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 11px;
      margin-bottom: 8px;
      background: rgba(225, 29, 72, 0.15);
      color: #fda4af;
      border: 1px solid rgba(225, 29, 72, 0.3);
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="header-title">
      <span class="status-dot"></span>
      <span>تنظیمات زوم (Zoom Box Pro)</span>
    </div>
    <button type="button" id="btn-collapse" class="header-btn" title="بستن">✕</button>
  </div>

  <div id="restricted-notice" class="restricted-msg">
    ⚠️ این صفحه سیستمی است. لطفاً افزونه را روی یک وب‌سایت عادی اجرا کنید.
  </div>

  <!-- Action Buttons -->
  <button type="button" id="btn-draw" class="btn-main btn-activate">
    <span>🔍</span>
    <span id="btn-draw-text">شروع رسم کادر زوم</span>
  </button>

  <button type="button" id="btn-reset" class="btn-main btn-reset">
    <span>🔄</span>
    <span>بازگشت به ۱۰۰٪ (Esc)</span>
  </button>

  <!-- Quick Presets -->
  <div class="presets-wrap">
    <span class="presets-label">مقادیر سریع:</span>
    <div class="presets-grid">
      <button type="button" class="preset-btn" data-val="150">150%</button>
      <button type="button" class="preset-btn active" data-val="200">200%</button>
      <button type="button" class="preset-btn" data-val="300">300%</button>
      <button type="button" class="preset-btn" data-val="400">400%</button>
    </div>
  </div>

  <!-- Zoom Level Slider -->
  <div class="slider-section">
    <div class="slider-header">
      <span class="slider-title">سطح زوم:</span>
      <span id="zoom-badge" class="badge-val">200%</span>
    </div>
    <input type="range" id="zoom-slider" min="50" max="500" step="25" value="200">
  </div>

  <!-- Box Color & Dimming -->
  <div class="two-cols">
    <div>
      <span class="col-header">رنگ کادر:</span>
      <div class="color-picker-box">
        <button type="button" id="color-preview" class="color-preview-btn"></button>
        <input type="color" id="color-input" value="#39FF14" style="display:none;">
        <span id="hex-label" class="hex-code">#39FF14</span>
      </div>
    </div>
    <div>
      <div class="col-header">
        <span>تیرگی پس‌زمینه:</span>
        <span id="opacity-val" style="color:#d4d4d8;font-family:monospace;">50%</span>
      </div>
      <input type="range" id="opacity-slider" min="0" max="95" step="5" value="50" style="margin-top:6px;">
    </div>
  </div>

  <!-- Shortcuts -->
  <div class="shortcut-box">
    <div class="shortcut-header">
      <span class="slider-title">تنظیم کلید میانبر</span>
      <span id="shortcut-display" class="shortcut-badge">Ctrl + Shift + Z</span>
    </div>

    <div class="modifiers-container">
      <div class="mod-item" id="mod-ctrl">
        <span>Ctrl</span>
        <div class="mod-checkbox checked" id="chk-ctrl">✓</div>
      </div>
      <div class="mod-item" id="mod-shift">
        <span>Shift</span>
        <div class="mod-checkbox checked" id="chk-shift">✓</div>
      </div>
      <div class="mod-item" id="mod-alt">
        <span>Alt</span>
        <div class="mod-checkbox" id="chk-alt"></div>
      </div>
    </div>

    <div class="key-select-row">
      <span class="key-select-label">کلید فعال‌سازی:</span>
      <select id="key-dropdown" class="key-dropdown">
        <option value="Z">Z</option>
        <option value="X">X</option>
        <option value="C">C</option>
        <option value="V">V</option>
        <option value="A">A</option>
        <option value="S">S</option>
        <option value="F">F</option>
        <option value="Q">Q</option>
        <option value="E">E</option>
        <option value="R">R</option>
        <option value="B">B</option>
      </select>
    </div>
  </div>

  <!-- Lens Mode -->
  <div class="lens-row" id="row-lens">
    <div class="lens-title">
      <span style="color:#39FF14;">👁️</span>
      <span>حالت نشانگر ذره‌بین (Lens HUD)</span>
    </div>
    <div class="mod-checkbox" id="chk-lens"></div>
  </div>

  <!-- Footer -->
  <div class="footer-text" id="footer-text">
    میانبر فعال: Ctrl + Shift + Z / Esc
  </div>

  <script src="popup.js"></script>
</body>
</html>
`,
    },
    popupJs: {
      name: 'popup.js',
      desc: 'منطق ارتباط پاپ‌آپ با تب فعال، کنترل رویدادها و ذخیره‌سازی تنظیمات',
      code: `// popup.js - کنترلر پنجره پاپ‌آپ افزونه Zoom Box Pro
document.addEventListener('DOMContentLoaded', async () => {
  const browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  const btnDraw = document.getElementById('btn-draw');
  const btnDrawText = document.getElementById('btn-draw-text');
  const btnReset = document.getElementById('btn-reset');
  const btnCollapse = document.getElementById('btn-collapse');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomBadge = document.getElementById('zoom-badge');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const colorPreview = document.getElementById('color-preview');
  const colorInput = document.getElementById('color-input');
  const hexLabel = document.getElementById('hex-label');
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityVal = document.getElementById('opacity-val');
  const chkCtrl = document.getElementById('chk-ctrl');
  const chkShift = document.getElementById('chk-shift');
  const chkAlt = document.getElementById('chk-alt');
  const keyDropdown = document.getElementById('key-dropdown');
  const shortcutDisplay = document.getElementById('shortcut-display');
  const footerText = document.getElementById('footer-text');
  const chkLens = document.getElementById('chk-lens');
  const rowLens = document.getElementById('row-lens');

  let state = {
    zoomLevel: 200,
    boxColor: '#39FF14',
    opacity: 50,
    shortcutCtrl: true,
    shortcutShift: true,
    shortcutAlt: false,
    shortcutKey: 'Z',
    lensMode: false
  };

  function updateShortcutUI() {
    const parts = [];
    if (state.shortcutCtrl) parts.push('Ctrl');
    if (state.shortcutShift) parts.push('Shift');
    if (state.shortcutAlt) parts.push('Alt');
    parts.push(state.shortcutKey || 'Z');
    const text = parts.join(' + ');
    if (shortcutDisplay) shortcutDisplay.textContent = text;
    if (footerText) footerText.textContent = \`میانبر فعال: \${text} / Esc\`;

    if (chkCtrl) {
      chkCtrl.className = \`mod-checkbox \${state.shortcutCtrl ? 'checked' : ''}\`;
      chkCtrl.textContent = state.shortcutCtrl ? '✓' : '';
    }
    if (chkShift) {
      chkShift.className = \`mod-checkbox \${state.shortcutShift ? 'checked' : ''}\`;
      chkShift.textContent = state.shortcutShift ? '✓' : '';
    }
    if (chkAlt) {
      chkAlt.className = \`mod-checkbox \${state.shortcutAlt ? 'checked' : ''}\`;
      chkAlt.textContent = state.shortcutAlt ? '✓' : '';
    }
  }

  function updatePresetsUI() {
    presetBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === state.zoomLevel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      const data = await browserAPI.storage.local.get(null);
      if (data && data.zoomLevel !== undefined) {
        state = { ...state, ...data };
      }
    }
  } catch (e) {
    console.warn("ZBP Storage load error:", e);
  }

  if (zoomSlider) zoomSlider.value = state.zoomLevel;
  if (zoomBadge) zoomBadge.textContent = \`\${state.zoomLevel}%\`;
  if (colorPreview) colorPreview.style.backgroundColor = state.boxColor;
  if (colorInput) colorInput.value = state.boxColor;
  if (hexLabel) hexLabel.textContent = state.boxColor;
  if (opacitySlider) opacitySlider.value = state.opacity;
  if (opacityVal) opacityVal.textContent = \`\${state.opacity}%\`;
  if (keyDropdown) keyDropdown.value = state.shortcutKey || 'Z';

  if (chkLens) {
    chkLens.className = \`mod-checkbox \${state.lensMode ? 'checked' : ''}\`;
    chkLens.textContent = state.lensMode ? '✓' : '';
  }

  updateShortcutUI();
  updatePresetsUI();

  async function getActiveTab() {
    if (!browserAPI || !browserAPI.tabs) return null;
    try {
      let tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        return tabs[0];
      }
      const fallback = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      return fallback && fallback[0] ? fallback[0] : (tabs && tabs.length > 0 ? tabs[0] : null);
    } catch (e) {
      return null;
    }
  }

  async function sendMessageToTab(message, autoClose = false) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;

    const url = tab.url || '';
    const isRestricted = (
      url.startsWith('chrome://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.includes('addons.mozilla.org') ||
      url.includes('chromewebstore.google.com')
    );

    const notice = document.getElementById('restricted-notice');
    if (isRestricted) {
      if (notice) notice.style.display = 'block';
      if (btnDrawText && message.action === 'startDrawingMode') btnDrawText.textContent = 'غیرفعال در صفحه سیستمی';
      return;
    } else {
      if (notice) notice.style.display = 'none';
    }

    try {
      await browserAPI.tabs.sendMessage(tab.id, message);
      if (autoClose) {
        setTimeout(() => window.close(), 120);
      }
    } catch (err) {
      try {
        if (browserAPI.scripting && browserAPI.scripting.executeScript) {
          await browserAPI.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }
        await new Promise(r => setTimeout(r, 200));
        await browserAPI.tabs.sendMessage(tab.id, message);
        if (autoClose) {
          setTimeout(() => window.close(), 120);
        }
      } catch (injErr) {
        console.error("ZBP Injection failed:", injErr);
      }
    }
  }

  async function saveSettings() {
    try {
      if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
        await browserAPI.storage.local.set(state);
      }
    } catch (e) {}
    sendMessageToTab({ action: 'updateSettings', settings: state }, false);
  }

  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => {
      window.close();
    });
  }

  if (btnDraw) {
    btnDraw.addEventListener('click', () => {
      if (btnDrawText) btnDrawText.textContent = 'در حال انتخاب...';
      sendMessageToTab({ action: 'startDrawingMode' }, true);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.zoomLevel = 100;
      if (zoomSlider) zoomSlider.value = 100;
      if (zoomBadge) zoomBadge.textContent = '100%';
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'resetZoom' }, false);
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      state.zoomLevel = val;
      if (zoomSlider) zoomSlider.value = val;
      if (zoomBadge) zoomBadge.textContent = \`\${val}%\`;
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'updateZoomLevel', zoomLevel: val }, false);
    });
  });

  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.zoomLevel = val;
      if (zoomBadge) zoomBadge.textContent = \`\${val}%\`;
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'updateZoomLevel', zoomLevel: val }, false);
    });
  }

  if (colorPreview && colorInput) {
    colorPreview.addEventListener('click', () => colorInput.click());
    colorInput.addEventListener('input', (e) => {
      state.boxColor = e.target.value;
      colorPreview.style.backgroundColor = state.boxColor;
      if (hexLabel) hexLabel.textContent = state.boxColor;
      saveSettings();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.opacity = val;
      if (opacityVal) opacityVal.textContent = \`\${val}%\`;
      saveSettings();
    });
  }

  const modCtrl = document.getElementById('mod-ctrl');
  if (modCtrl) {
    modCtrl.addEventListener('click', () => {
      state.shortcutCtrl = !state.shortcutCtrl;
      updateShortcutUI();
      saveSettings();
    });
  }

  const modShift = document.getElementById('mod-shift');
  if (modShift) {
    modShift.addEventListener('click', () => {
      state.shortcutShift = !state.shortcutShift;
      updateShortcutUI();
      saveSettings();
    });
  }

  const modAlt = document.getElementById('mod-alt');
  if (modAlt) {
    modAlt.addEventListener('click', () => {
      state.shortcutAlt = !state.shortcutAlt;
      updateShortcutUI();
      saveSettings();
    });
  }

  if (keyDropdown) {
    keyDropdown.addEventListener('change', (e) => {
      state.shortcutKey = e.target.value;
      updateShortcutUI();
      saveSettings();
    });
  }

  const toggleLens = () => {
    state.lensMode = !state.lensMode;
    if (chkLens) {
      chkLens.className = \`mod-checkbox \${state.lensMode ? 'checked' : ''}\`;
      chkLens.textContent = state.lensMode ? '✓' : '';
    }
    saveSettings();
  };

  if (rowLens) {
    rowLens.addEventListener('click', toggleLens);
  } else if (chkLens) {
    chkLens.addEventListener('click', toggleLens);
  }
});
`,
    },
    background: {
      name: 'background.js',
      desc: 'اسکریپت پس‌زمینه پایدار مدیریت میانبرهای کیبورد و ارتباط امن بین تب‌ها',
      code: `// background.js - اسکریپت پس‌زمینه پایدار سازگار با موزیلا فایرفاکس و گوگل کروم (MV3)
const browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (browserAPI && browserAPI.runtime && browserAPI.runtime.onInstalled) {
  browserAPI.runtime.onInstalled.addListener(async () => {
    const initialSettings = {
      zoomLevel: 200,
      boxColor: '#39FF14',
      opacity: 50,
      shortcutKey: 'Z',
      shortcutCtrl: true,
      shortcutShift: true,
      shortcutAlt: false,
      extensionEnabled: true,
      lensMode: false
    };
    try {
      if (browserAPI.storage && browserAPI.storage.local) {
        const existing = await browserAPI.storage.local.get(null);
        if (!existing || existing.zoomLevel === undefined) {
          await browserAPI.storage.local.set(initialSettings);
        }
      }
    } catch (e) {
      console.warn("ZBP Background onInstalled storage error:", e);
    }
  });
}

async function sendActionToActiveTab(actionName) {
  if (!browserAPI || !browserAPI.tabs) return;
  try {
    let tabs = [];
    try {
      tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    } catch (e) {
      tabs = await browserAPI.tabs.query({ active: true });
    }
    const activeTab = tabs && tabs[0];
    if (!activeTab || !activeTab.id) return;

    // Guard against restricted URLs where content scripts cannot run
    const url = activeTab.url || '';
    if (
      url.startsWith('chrome://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.includes('addons.mozilla.org') ||
      url.includes('chromewebstore.google.com')
    ) {
      return;
    }

    try {
      await browserAPI.tabs.sendMessage(activeTab.id, { action: actionName });
    } catch (msgErr) {
      if (browserAPI.scripting && browserAPI.scripting.executeScript) {
        try {
          await browserAPI.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          });
          await new Promise(r => setTimeout(r, 150));
          await browserAPI.tabs.sendMessage(activeTab.id, { action: actionName });
        } catch (injErr) {
          console.warn("ZBP Script injection skipped:", injErr);
        }
      }
    }
  } catch (err) {
    console.warn("ZBP Background sendAction error:", err);
  }
}

if (browserAPI && browserAPI.commands && browserAPI.commands.onCommand) {
  browserAPI.commands.onCommand.addListener((command) => {
    if (command === 'toggle-draw') {
      sendActionToActiveTab('startDrawingMode');
    } else if (command === 'reset-zoom') {
      sendActionToActiveTab('resetZoom');
    }
  });
}
`,
    },
    readme: {
      name: 'README.md',
      desc: 'راهنمای جامع راه‌اندازی و استفاده در موزیلا فایرفاکس، کروم، بریو و اج',
      code: `# Zoom Box Pro (نسخه 8.6.2)
افزونه زوم تمام‌صفحه با رسم کادر موس - مجهز به لایه ایزوله کامل CSS با Shadow DOM

## ویژگی‌های نسخه 8.6.2:
- **ایزولاسیون کامل CSS با Shadow DOM**: بدون کوچک‌ترین تداخل با استایل‌های سایت‌های میزبان.
- **هماهنگی کامل بین تمام مرورگرها**: فایرفاکس (Firefox MV3)، کروم (Chrome MV3)، بریو (Brave) و مایکروسافت اج (Edge).
- **ترنزیشن تدریجی و بسیار روان**: زوم نرم و بدون پرش با شتاب‌دهنده گرافیکی GPU.
- **میانبرهای کیبورد فوری**:
  - \`Ctrl + Shift + Z\` (یا کلید انتخابی دلخواه): فعال‌سازی و شروع رسم کادر زوم
  - \`Escape\`: بازگشت نرم به حالت عادی ۱۰۰٪
  - \`+\` / \`-\` در حالت زوم: افزایش و کاهش زوم به میزان ۲۵٪
  - درگ با کلید میانی موس (Middle Click) یا Space: حرکت و جابجایی (Pan) در حالت زوم
- **حالت ذره‌بین (Lens HUD)**: نشانگر موقعیت‌یاب زوم هنگام حرکت ماوس.

---

## نحوه نصب در موزیلا فایرفاکس (Mozilla Firefox):
1. مرورگر فایرفاکس را باز کرده و به آدرس \`about:debugging#/runtime/this-firefox\` بروید.
2. روی دکمه **Load Temporary Add-on...** کلیک کنید.
3. فایل \`manifest.json\` را از داخل پوشه اکسترکت‌شده انتخاب کنید.
4. وارد یک وب‌سایت (مانند Wikipedia یا Google) شده و از کلید \`Ctrl + Shift + Z\` استفاده نمایید!

---

## نحوه نصب در گوگل کروم، بریو و اج (Chrome / Brave / Edge):
1. مرورگر را باز کرده و به آدرس \`chrome://extensions\` بروید.
2. گزینه **Developer mode** را در بالا سمت راست فعال کنید.
3. در صورت نیاز فایل \`manifest-chrome.json\` را به عنوان \`manifest.json\` قرار دهید یا روی **Load unpacked** کلیک کرده و پوشه افزونه را انتخاب کنید.
`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const folder = zip.folder('zoom-extension-v2');

      if (folder) {
        folder.file('manifest.json', files.manifest.code);
        folder.file('manifest-chrome.json', files.manifest.code.replace('"scripts": ["background.js"]', '"service_worker": "background.js"'));
        folder.file('popup.html', files.popupHtml.code);
        folder.file('popup.js', files.popupJs.code);
        folder.file('content.js', files.content.code);
        folder.file('background.js', files.background.code);
        folder.file('README.md', files.readme.code);

        const iconsFolder = folder.folder('icons');
        if (iconsFolder) {
          const canvas = document.createElement('canvas');
          canvas.width = 128;
          canvas.height = 128;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#09090b';
            ctx.fillRect(0, 0, 128, 128);
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 8;
            ctx.strokeRect(16, 16, 96, 96);
            ctx.fillStyle = '#39FF14';
            ctx.font = 'bold 50px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('Z', 64, 64);
          }
          const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
          if (blob) {
            iconsFolder.file('icon16.png', blob);
            iconsFolder.file('icon48.png', blob);
            iconsFolder.file('icon128.png', blob);
          }
        }
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zoom-box-pro-v8.6.2.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 my-6">
      {/* Installation Guide Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/50 text-[#39FF14]">
              {activeGuideTab === 'firefox' ? <Flame className="w-7 h-7 text-orange-400" /> : <Chrome className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {lang === 'fa' 
                    ? (activeGuideTab === 'firefox' ? 'راهنمای تست و نصب در موزیلا فایرفاکس (Firefox)' : 'راهنمای نصب در کروم / بریو / اج')
                    : (activeGuideTab === 'firefox' ? 'Mozilla Firefox Installation Guide' : 'Chrome / Brave / Edge Installation Guide')}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#39FF14]" />
                  Shadow DOM ایزوله (v8.6.0)
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'fa' 
                  ? 'مجهز به لایه ایزوله کامل Shadow DOM برای جلوگیری ۱۰۰٪ از تداخل CSS صفحات وب و کارکرد پایدار در فایرفاکس و کروم'
                  : 'Equipped with full Shadow DOM CSS encapsulation preventing host page styling interference.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] text-black font-bold text-sm shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:bg-[#2ecc71] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? (lang === 'fa' ? 'در حال ایجاد فایل زیپ...' : 'Zipping...') : (lang === 'fa' ? 'دانلود پکیج ZIP افزونه (v8.6.0)' : 'Download Extension ZIP (v8.6.0)')}</span>
          </button>
        </div>

        {/* Important Troubleshooting Note for Firefox */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">نکته بسیار مهم برای تست در فایرفاکس:</span>
            <p className="text-zinc-300 leading-relaxed">
              مرورگر فایرفاکس به دلایل امنیتی به هیچ افزونه‌ای اجازه اجرا روی صفحات داخلی مثل <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">about:debugging</code>، <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">about:addons</code> یا فروشگاه افزونه‌ها را نمی‌دهد. پس از لود افزونه، حتماً یک <strong>تب جدید باز کرده و وارد سایتی مثل google.com یا wikipedia.org شوید</strong> و کلیدهای <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">Ctrl + Shift + Z</kbd> را بزنید.
            </p>
          </div>
        </div>

        {/* Browser Switcher Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveGuideTab('firefox')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeGuideTab === 'firefox'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Mozilla Firefox (فایرفاکس)</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('chrome')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeGuideTab === 'chrome'
                ? 'bg-[#39FF14] text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Google Chrome / Brave / Edge</span>
          </button>
        </div>

        {/* Steps Flow */}
        {activeGuideTab === 'firefox' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۱</span>
                <Flame className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">ورود به بخش Debugging</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                در آدرس‌بار فایرفاکس وارد کنید: <code className="bg-zinc-900 px-1 py-0.5 rounded text-orange-300 font-mono">about:debugging#/runtime/this-firefox</code>
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۲</span>
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">بارگذاری افزونه موقت</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی دکمه <strong>Load Temporary Add-on...</strong> کلیک کرده و فایل <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">manifest.json</code> را انتخاب کنید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۳</span>
                <FolderCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">تست روی یک سایت عادی</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی سایتی مثل <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">google.com</code> تست کنید و کلیدهای <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">Ctrl+Shift+Z</code> را بزنید.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۱</span>
                <Chrome className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">ورود به مدیریت افزونه‌ها</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                در مرورگر کروم وارد آدرس <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">chrome://extensions</code> شوید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۲</span>
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">فعال‌سازی Developer Mode</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                دکمه سوئیچ Developer mode را در بالا سمت راست صفحه روشن کنید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۳</span>
                <FolderCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">Load Unpacked</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی <strong>Load unpacked</strong> کلیک کرده و پوشه <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">zoom-extension-v2</code> را انتخاب کنید.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Code Inspector & Manifest Viewer */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Tab Headers */}
        <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['content', 'manifest', 'popupHtml', 'popupJs', 'background', 'readme'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFile === key
                    ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{files[key].name}</span>
                {key === 'content' && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-sans">Shadow DOM</span>}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* File Description */}
        <div className="bg-zinc-900/40 px-5 py-2 text-[11px] font-mono text-zinc-400 border-b border-zinc-800/60 flex items-center justify-between">
          <span>{files[selectedFile].desc}</span>
          <span className="text-zinc-500 text-[10px]">Cross-Browser Manifest V3 (v8.6.0)</span>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
            {files[selectedFile].code}
          </pre>
        </div>
      </div>
    </div>
  );
};
