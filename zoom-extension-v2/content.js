/**
 * Zoom Box Pro - Content Script (v8.7.0)
 * سیستم پیشرفته زوم تمام‌صفحه با رسم کادر و ایزولاسیون کامل با Shadow DOM
 * سازگاری ۱۰۰٪ تضمین‌شده با ویژگی‌ها و رفتارهای اختصاصی موزیلا فایرفاکس (Firefox)
 * و پشتیبانی کامل از رویدادها در مرز Shadow DOM (Shadow Boundary Event Propagation)
 *
 * تغییرات نسخه 8.7.0:
 * - رفع باگ بحرانی مسدود شدن کلیک‌های صفحه در حالت زوم (هاست دیگر pointer-events نمی‌گیرد)
 * - حذف contain: layout که موقعیت‌دهی fixed داخل Shadow DOM فایرفاکس را می‌شکست
 * - رفع جابجایی (Pan) با Space که از API ناموجود e.spaceKey استفاده می‌کرد
 * - عدم ربایش میانبر افزونه هنگام تایپ داخل فیلدهای متنی (تداخل با Redo فایرفاکس)
 */
(function () {
  'use strict';

  if (window.__ZOOM_BOX_PRO_INSTANCE__) {
    return;
  }

  const browserAPI = (typeof browser !== 'undefined' && browser.runtime)
    ? browser
    : (typeof chrome !== 'undefined' ? chrome : null);

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
      this.activePointerId = null;
      this.isSpacePressed = false;

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

    // تضمین این‌که درصد زوم همیشه یک عدد سالم و امن است (محافظت در برابر
    // مقادیر نامعتبر ذخیره‌شده)
    zoomPercent() {
      const n = Number(this.settings.zoomLevel);
      if (!Number.isFinite(n)) return 200;
      return Math.max(50, Math.min(500, Math.round(n)));
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
      style.textContent = `
        html {
          transform-origin: 0 0;
        }
        body {
          transform-origin: 0 0;
        }
        #zbp-root-host {
          /* هاست همیشه بی‌حجم و عبوردهنده کلیک است؛ تعامل فقط روی فرزندان
             داخل Shadow DOM (اورلی، پنل، نوار وضعیت) انجام می‌شود. این کار
             جلوی مسدود شدن کلیک‌های صفحه میزبان را در حالت زوم می‌گیرد. */
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
          display: block !important;
        }
      `;
      (document.head || document.documentElement).appendChild(style);
    }

    buildShadowDOM() {
      if (this.rootContainer && this.shadowRoot) return;

      this.rootContainer = document.createElement('div');
      this.rootContainer.id = 'zbp-root-host';

      // Firefox and modern browser compatible attachShadow with mode: 'open'
      try {
        this.shadowRoot = this.rootContainer.attachShadow({ mode: 'open' });
      } catch (err) {
        console.warn('ZBP attachShadow retry:', err);
        this.shadowRoot = this.rootContainer.shadowRoot || this.rootContainer;
      }

      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = `
        :host {
          all: initial !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Vazirmatn, Tahoma, sans-serif !important;
          direction: rtl !important;
          display: block !important;
        }
        * {
          box-sizing: border-box !important;
          margin: 0 !important;
          padding: 0 !important;
          -webkit-font-smoothing: antialiased !important;
          -moz-osx-font-smoothing: grayscale !important;
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
          touch-action: none !important;
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
          -webkit-user-select: none !important;
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
      `;
      this.shadowRoot.appendChild(shadowStyle);

      this.overlay = document.createElement('div');
      this.overlay.id = 'zbp-overlay';
      this.overlay.innerHTML = `
        <div class="zbp-overlay-tip">
          <span>🎯</span>
          <span>با درگ کردن موس، کادر زوم را رسم کنید (کلید Esc برای لغو)</span>
        </div>
      `;
      this.shadowRoot.appendChild(this.overlay);

      this.selectionBox = document.createElement('div');
      this.selectionBox.id = 'zbp-selection-box';
      this.selectionBox.innerHTML = `
        <div class="zbp-corner zbp-corner-tl"></div>
        <div class="zbp-corner zbp-corner-tr"></div>
        <div class="zbp-corner zbp-corner-bl"></div>
        <div class="zbp-corner zbp-corner-br"></div>
        <div class="zbp-dimensions-badge" id="zbp-dim-badge">
          <span style="width:6px;height:6px;border-radius:50%;background:#39FF14;display:inline-block;"></span>
          <span id="zbp-dim-text">0 × 0px</span>
        </div>
      `;
      this.shadowRoot.appendChild(this.selectionBox);

      this.lensHUD = document.createElement('div');
      this.lensHUD.id = 'zbp-lens-hud';
      this.lensHUD.innerHTML = `
        <div class="zbp-lens-cross-h"></div>
        <div class="zbp-lens-cross-v"></div>
        <div class="zbp-lens-label" id="zbp-lens-label"></div>
      `;
      const lensLabelEl = this.lensHUD.querySelector('#zbp-lens-label');
      if (lensLabelEl) lensLabelEl.textContent = `LENS ${this.zoomPercent()}%`;
      this.shadowRoot.appendChild(this.lensHUD);

      this.floatingPanel = document.createElement('div');
      this.floatingPanel.id = 'zbp-floating-panel';
      this.floatingPanel.innerHTML = `
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
            <span id="zbp-level-val" class="zbp-slider-val"></span>
          </div>
          <input type="range" id="zbp-zoom-slider" class="zbp-range" min="50" max="500" step="25">
        </div>
      `;
      const levelValEl = this.floatingPanel.querySelector('#zbp-level-val');
      if (levelValEl) levelValEl.textContent = `${this.zoomPercent()}%`;
      const sliderEl = this.floatingPanel.querySelector('#zbp-zoom-slider');
      if (sliderEl) sliderEl.value = String(this.zoomPercent());
      this.shadowRoot.appendChild(this.floatingPanel);

      this.statusBar = document.createElement('div');
      this.statusBar.id = 'zbp-status-bar';
      this.statusBar.innerHTML = `
        <span class="zbp-status-text">بزرگ‌نمایی فعال:</span>
        <span id="zbp-bar-val" class="zbp-status-val"></span>
        <button id="zbp-bar-dec" class="zbp-bar-btn" title="کاهش">-</button>
        <button id="zbp-bar-inc" class="zbp-bar-btn" title="افزایش">+</button>
        <button id="zbp-bar-reset" class="zbp-bar-btn zbp-bar-btn-reset">بازگشت (Esc)</button>
      `;
      const barValEl = this.statusBar.querySelector('#zbp-bar-val');
      if (barValEl) barValEl.textContent = `${this.zoomPercent()}%`;
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

      styleEl.textContent = `
        .zbp-overlay-tip, .zbp-dimensions-badge, #zbp-lens-hud, .zbp-lens-label {
          color: ${c} !important;
          border-color: rgba(${r}, ${g}, ${b}, 0.6) !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 15px rgba(${r}, ${g}, ${b}, 0.35) !important;
        }
        #zbp-dim-badge span {
          background: ${c} !important;
        }
        .zbp-lens-cross-h, .zbp-lens-cross-v {
          background: rgba(${r}, ${g}, ${b}, 0.6) !important;
        }
        #zbp-selection-box {
          border-color: ${c} !important;
          background: rgba(${r}, ${g}, ${b}, 0.16) !important;
          box-shadow: 0 0 20px rgba(${r}, ${g}, ${b}, 0.65), inset 0 0 12px rgba(${r}, ${g}, ${b}, 0.2) !important;
        }
        .zbp-corner {
          border-color: ${c} !important;
        }
      `;

      if (this.isZoomed) {
        let dimOverlay = this.shadowRoot.querySelector('#zbp-dim-overlay');
        if (!dimOverlay) {
          dimOverlay = document.createElement('div');
          dimOverlay.id = 'zbp-dim-overlay';
          dimOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:2147483640;transition:opacity 0.65s;';
          this.shadowRoot.insertBefore(dimOverlay, this.shadowRoot.firstChild);
        }
        dimOverlay.style.backgroundColor = `rgba(0,0,0,${this.settings.opacity / 100})`;
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
      if (levelVal) levelVal.textContent = `${this.settings.zoomLevel}%`;
      if (slider) slider.value = this.settings.zoomLevel;
      if (lensLabel) lensLabel.textContent = `LENS ${this.settings.zoomLevel}%`;
    }

    /**
     * Helper to safely extract event target across Firefox Shadow Boundary
     */
    getComposedTarget(event) {
      if (event.composedPath && typeof event.composedPath === 'function') {
        const path = event.composedPath();
        if (path && path.length > 0) {
          return path[0];
        }
      }
      return event.target;
    }

    isEventInside(event, element) {
      if (!element) return false;
      if (event.composedPath && typeof event.composedPath === 'function') {
        const path = event.composedPath();
        return path.includes(element);
      }
      return element.contains(event.target);
    }

    bindListeners() {
      // پیام‌های دریافتی از Popup یا Background Script
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

      // رویدادهای پنل شناور درون Shadow DOM
      const closeBtn = this.shadowRoot.querySelector('#zbp-close-panel');
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.togglePanel();
        });
      }

      const drawBtn = this.shadowRoot.querySelector('#zbp-toggle-draw');
      if (drawBtn) {
        drawBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isDrawingMode) {
            this.cancelDrawing();
          } else {
            this.startDrawingMode();
          }
        });
      }

      const zoomSlider = this.shadowRoot.querySelector('#zbp-zoom-slider');
      if (zoomSlider) {
        zoomSlider.addEventListener('input', (e) => {
          e.stopPropagation();
          const val = parseInt(e.target.value, 10);
          this.settings.zoomLevel = val;
          const levelVal = this.shadowRoot.querySelector('#zbp-level-val');
          if (levelVal) levelVal.textContent = `${val}%`;
          const lensLabel = this.shadowRoot.querySelector('#zbp-lens-label');
          if (lensLabel) lensLabel.textContent = `LENS ${val}%`;
          this.saveSettings();
          if (this.isZoomed) {
            this.updateZoomScale();
          }
        });
      }

      // دکمه‌های نوار وضعیت پایین
      const barDec = this.shadowRoot.querySelector('#zbp-bar-dec');
      if (barDec) {
        barDec.addEventListener('click', async (e) => {
          e.stopPropagation();
          this.settings.zoomLevel = Math.max(50, this.settings.zoomLevel - 25);
          this.applyPanelValues();
          this.updateZoomScale();
          await this.saveSettings();
        });
      }

      const barInc = this.shadowRoot.querySelector('#zbp-bar-inc');
      if (barInc) {
        barInc.addEventListener('click', async (e) => {
          e.stopPropagation();
          this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
          this.applyPanelValues();
          this.updateZoomScale();
          await this.saveSettings();
        });
      }

      const barReset = this.shadowRoot.querySelector('#zbp-bar-reset');
      if (barReset) {
        barReset.addEventListener('click', (e) => {
          e.stopPropagation();
          this.zoomOutSmoothly();
        });
      }

      // میانبرهای کیبورد سراسری
      window.addEventListener('keydown', (e) => {
        // ردیابی وضعیت کلید Space برای حالت جابجایی (Pan) — MouseEvent هیچ
        // خاصیت spaceKey ندارد و باید وضعیت کلید را خودمان نگه داریم.
        if (e.code === 'Space') {
          this.isSpacePressed = true;
          if (this.isZoomed && !this.isDrawingMode) {
            const spaceTarget = this.getComposedTarget(e);
            const spaceInInput = spaceTarget && (spaceTarget.tagName === 'INPUT' || spaceTarget.tagName === 'TEXTAREA' || spaceTarget.isContentEditable);
            if (!spaceInInput) {
              e.preventDefault(); // جلوگیری از اسکرول صفحه هنگام Pan با Space
            }
          }
        }

        const isCtrlOrMeta = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isAlt = e.altKey;

        const reqCtrl = this.settings.shortcutCtrl !== false;
        const reqShift = this.settings.shortcutShift !== false;
        const reqAlt = this.settings.shortcutAlt === true;
        const reqKey = (this.settings.shortcutKey || 'Z').toUpperCase();

        const currentKey = (e.key || '').toUpperCase();
        const matchesShortcut = 
          (isCtrlOrMeta === reqCtrl) &&
          (isShift === reqShift) &&
          (isAlt === reqAlt) &&
          (currentKey === reqKey || e.code === `Key${reqKey}`);

        if (matchesShortcut) {
          // هنگام تایپ داخل فیلدهای متنی، میانبر را نرباییم (مثلاً Ctrl+Shift+Z
          // در فایرفاکس همان Redo است و نباید رفتار پیش‌فرض را خراب کنیم).
          const shortcutTarget = this.getComposedTarget(e);
          const shortcutInInput = shortcutTarget && (shortcutTarget.tagName === 'INPUT' || shortcutTarget.tagName === 'TEXTAREA' || shortcutTarget.isContentEditable);
          if (!shortcutInInput) {
            e.preventDefault();
            e.stopPropagation();
            if (this.isDrawingMode) {
              this.cancelDrawing();
            } else {
              this.startDrawingMode();
            }
          }
          return;
        }

        if (e.key === 'Escape') {
          if (this.isDrawingMode) {
            this.cancelDrawing();
          } else if (this.isZoomed) {
            this.zoomOutSmoothly();
          }
          return;
        }

        // وقتی صفحه زوم است، کلیدهای + و - کنترل زوم را تغییر می‌دهند
        if (this.isZoomed && !this.isDrawingMode) {
          const target = this.getComposedTarget(e);
          const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
          if (!isInput) {
            if (e.key === '+' || e.key === '=' || e.code === 'NumpadAdd') {
              e.preventDefault();
              this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
              this.applyPanelValues();
              this.updateZoomScale();
              this.saveSettings();
            } else if (e.key === '-' || e.key === '_' || e.code === 'NumpadSubtract') {
              e.preventDefault();
              this.settings.zoomLevel = Math.max(50, this.settings.zoomLevel - 25);
              this.applyPanelValues();
              this.updateZoomScale();
              this.saveSettings();
            } else if (e.key === '0' || e.code === 'Numpad0') {
              e.preventDefault();
              this.zoomOutSmoothly();
            }
          }
        }
      }, true);

      // آزادسازی وضعیت Space هنگام رها شدن کلید
      window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
          this.isSpacePressed = false;
        }
      }, true);

      // اگر فوکوس پنجره از دست رفت، وضعیت Space را ریست کن تا Pan گیر نکند
      window.addEventListener('blur', () => {
        this.isSpacePressed = false;
      });

      // رویدادهای رسم با Pointer Events (سازگار ۱۰۰٪ با فایرفاکس، موس و لمسی)
      const onPointerDown = (e) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        this.isDragging = true;
        this.activePointerId = e.pointerId;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.overlay && this.overlay.setPointerCapture && e.pointerId) {
          try {
            this.overlay.setPointerCapture(e.pointerId);
          } catch (err) {}
        }

        this.selectionBox.classList.remove('zbp-focus-lock');
        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = `${this.startX}px`;
        this.selectionBox.style.top = `${this.startY}px`;
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';

        if (this.lensHUD) this.lensHUD.style.display = 'none';

        e.preventDefault();
        e.stopPropagation();
      };

      const onPointerMove = (e) => {
        // نشانگر ذره‌بین (Lens HUD)
        if (this.isDrawingMode && this.settings.lensMode && !this.isDragging) {
          if (this.lensHUD) {
            this.lensHUD.style.display = 'block';
            this.lensHUD.style.left = `${e.clientX}px`;
            this.lensHUD.style.top = `${e.clientY}px`;
          }
        }

        if (!this.isDragging || !this.isDrawingMode) return;

        const currentX = Math.max(0, Math.min(window.innerWidth, e.clientX));
        const currentY = Math.max(0, Math.min(window.innerHeight, e.clientY));
        const left = Math.min(currentX, this.startX);
        const top = Math.min(currentY, this.startY);
        const width = Math.abs(currentX - this.startX);
        const height = Math.abs(currentY - this.startY);

        this.selectionBox.style.left = `${left}px`;
        this.selectionBox.style.top = `${top}px`;
        this.selectionBox.style.width = `${width}px`;
        this.selectionBox.style.height = `${height}px`;

        const dimText = this.shadowRoot.querySelector('#zbp-dim-text');
        if (dimText) {
          dimText.textContent = `${Math.round(width)} × ${Math.round(height)}px`;
        }

        e.preventDefault();
      };

      const onPointerUp = (e) => {
        if (!this.isDragging || !this.isDrawingMode) return;
        this.isDragging = false;

        if (this.overlay && this.overlay.releasePointerCapture && this.activePointerId) {
          try {
            this.overlay.releasePointerCapture(this.activePointerId);
          } catch (err) {}
          this.activePointerId = null;
        }

        const rect = this.selectionBox.getBoundingClientRect();

        // انیمیشن نرم فوکوس
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
          this.applyFullPageZoom({
            left: this.startX - 60,
            top: this.startY - 60,
            width: 120,
            height: 120
          });
        }
      };

      // Pointer event listeners on overlay
      if (this.overlay) {
        this.overlay.addEventListener('pointerdown', onPointerDown);
        this.overlay.addEventListener('pointermove', onPointerMove);
        this.overlay.addEventListener('pointerup', onPointerUp);
        this.overlay.addEventListener('pointercancel', onPointerUp);

        // Fallback for touch devices
        this.overlay.addEventListener('touchstart', (e) => {
          if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            onPointerDown({
              clientX: touch.clientX,
              clientY: touch.clientY,
              pointerId: 1,
              pointerType: 'touch',
              preventDefault: () => e.preventDefault(),
              stopPropagation: () => e.stopPropagation()
            });
          }
        }, { passive: false });

        this.overlay.addEventListener('touchmove', (e) => {
          if (e.touches && e.touches[0]) {
            const touch = e.touches[0];
            onPointerMove({
              clientX: touch.clientX,
              clientY: touch.clientY,
              preventDefault: () => e.preventDefault()
            });
          }
        }, { passive: false });

        this.overlay.addEventListener('touchend', (e) => {
          onPointerUp({});
        });
      }

      // جابجایی صفحه در حالت زوم با کلیک وسط ماوس یا Space+Drag (Pan)
      window.addEventListener('mousedown', (e) => {
        if (!this.isZoomed || this.isDrawingMode) return;
        // اگر کلیک داخل کنترل‌های خود افزونه باشد، کاری نکن
        if (this.isEventInside(e, this.floatingPanel) || this.isEventInside(e, this.statusBar)) {
          return;
        }

        if (e.button === 1 || (e.button === 0 && this.isSpacePressed)) {
          this.isPanning = true;
          this.panStartX = e.clientX;
          this.panStartY = e.clientY;
          if (document.body) document.body.style.cursor = 'grab';
          e.preventDefault();
        }
      });

      window.addEventListener('mousemove', (e) => {
        if (this.isPanning && this.isZoomed) {
          const dx = e.clientX - this.panStartX;
          const dy = e.clientY - this.panStartY;
          this.panStartX = e.clientX;
          this.panStartY = e.clientY;

          this.lastOriginX -= (dx / (this.settings.zoomLevel / 100));
          this.lastOriginY -= (dy / (this.settings.zoomLevel / 100));

          const target = document.body || document.documentElement;
          if (target) {
            target.style.transformOrigin = `${this.lastOriginX}px ${this.lastOriginY}px`;
          }
        }
      });

      window.addEventListener('mouseup', () => {
        if (this.isPanning) {
          this.isPanning = false;
          if (document.body) document.body.style.cursor = '';
        }
      });
    }

    togglePanel() {
      if (!this.floatingPanel) return;
      this.floatingPanel.style.display =
        this.floatingPanel.style.display === 'block' ? 'none' : 'block';
    }

    startDrawingMode() {
      // اگر از قبل زوم بود، ابتدا صفحه را با ریست نرم به ۱۰۰٪ برمی‌گردانیم تا مختصات دقیق باشد
      if (this.isZoomed) {
        this.zoomOutSmoothly();
      }

      this.isDrawingMode = true;
      if (this.overlay) {
        this.overlay.style.display = 'block';
      }
      if (this.settings.lensMode && this.lensHUD) {
        this.lensHUD.style.display = 'block';
      }

      const drawBtn = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-toggle-draw') : null;
      if (drawBtn) {
        drawBtn.textContent = '❌ لغو انتخاب';
        drawBtn.classList.add('zbp-btn-active');
      }
    }

    cancelDrawing() {
      this.isDrawingMode = false;
      this.isDragging = false;
      if (this.overlay) this.overlay.style.display = 'none';
      if (this.selectionBox) this.selectionBox.style.display = 'none';
      if (this.lensHUD) this.lensHUD.style.display = 'none';

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
      target.style.transformOrigin = `${this.lastOriginX}px ${this.lastOriginY}px`;
      target.style.transform = `scale(${scale})`;

      this.updateStyles();

      if (this.statusBar) {
        this.statusBar.style.display = 'flex';
        const valEl = this.shadowRoot.querySelector('#zbp-bar-val');
        if (valEl) valEl.textContent = `${this.settings.zoomLevel}%`;
      }
    }

    updateZoomScale() {
      if (!this.isZoomed) return;
      const scale = this.settings.zoomLevel / 100;
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = `${this.lastOriginX}px ${this.lastOriginY}px`;
      target.style.transform = `scale(${scale})`;

      this.updateStyles();

      if (this.statusBar) {
        const valEl = this.shadowRoot.querySelector('#zbp-bar-val');
        if (valEl) valEl.textContent = `${this.settings.zoomLevel}%`;
      }
    }

    zoomOutSmoothly() {
      this.isZoomed = false;
      this.cancelDrawing();

      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = `${this.lastOriginX}px ${this.lastOriginY}px`;
      target.style.transform = 'scale(1)';

      this.updateStyles();

      if (this.statusBar) {
        this.statusBar.style.display = 'none';
      }

      setTimeout(() => {
        if (!this.isZoomed) {
          target.style.transform = 'none';
          target.style.transformOrigin = 'initial';
          // حذف کامل لایه تیره‌کننده پس از پایان انیمیشن بازگشت
          const dimOverlay = this.shadowRoot ? this.shadowRoot.querySelector('#zbp-dim-overlay') : null;
          if (dimOverlay && dimOverlay.parentNode) {
            dimOverlay.parentNode.removeChild(dimOverlay);
          }
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
