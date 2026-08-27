import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Chrome, ShieldCheck, Terminal, FolderCheck } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const ExtensionViewer: React.FC<Props> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<'manifest' | 'content' | 'background' | 'readme'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);

  const files = {
    manifest: {
      name: 'manifest.json',
      desc: 'Manifest V3 Configuration & Permissions',
      code: `{
  "manifest_version": 3,
  "name": "Zoom Box Pro - زوم حرفه‌ای صفحه",
  "version": "8.0.0",
  "description": "افزونه زوم حرفه‌ای با پنل تنظیمات شناور و بدون نیاز به رفرش",
  "permissions": [
    "storage",
    "tabs",
    "activeTab",
    "scripting"
  ],
  "action": {
    "default_title": "کلیک کنید تا پنل تنظیمات باز شود",
    "default_icon": {
      "16": "icons/icon16.png",
      "48": "icons/icon48.png",
      "128": "icons/icon128.png"
    }
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ],
  "icons": {
    "16": "icons/icon16.png",
    "48": "icons/icon48.png",
    "128": "icons/icon128.png"
  }
}`,
    },
    content: {
      name: 'content.js',
      desc: 'Main Content Script: Box Selection, Centered Full-Page Scale & Smooth Gradual Zoom-Out',
      code: `/**
 * Zoom Box Pro - Content Script (Chrome Extension)
 * Drag a box to perform true full-page zoom centered on the selection,
 * and exit smoothly with a gradual, cine-grade cubic-bezier zoom-out animation.
 */

(function () {
  'use strict';

  if (window.__ZOOM_BOX_PRO_INSTANCE__) return;

  class ChromeZoomExtension {
    constructor() {
      this.isDrawingMode = false;
      this.isDragging = false;
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
      };

      this.overlay = null;
      this.selectionBox = null;
      this.floatingPanel = null;
      this.statusBar = null;

      this.init();
    }

    init() {
      this.loadSettings();
      this.injectStyles();
      this.buildDOM();
      this.bindListeners();
      window.__ZOOM_BOX_PRO_INSTANCE__ = this;
    }

    loadSettings() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.get(this.settings, (stored) => {
          if (stored) {
            this.settings = { ...this.settings, ...stored };
            this.applyPanelValues();
          }
        });
      }
    }

    saveSettings() {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
        chrome.storage.sync.set(this.settings);
      }
    }

    injectStyles() {
      if (document.getElementById('zbp-global-styles')) return;
      const style = document.createElement('style');
      style.id = 'zbp-global-styles';
      style.textContent = \`
        html, body {
          transform-origin: 0 0;
        }

        #zbp-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          z-index: 2147483640;
          background: rgba(0, 0, 0, 0.45);
          cursor: crosshair !important;
          display: none;
          user-select: none;
        }

        #zbp-selection-box {
          position: fixed;
          z-index: 2147483642;
          display: none;
          pointer-events: none;
          border: 3px solid #39FF14;
          background: rgba(57, 255, 20, 0.2);
          box-shadow: 0 0 25px rgba(57, 255, 20, 0.7);
          box-sizing: border-box;
        }

        #zbp-floating-panel {
          position: fixed;
          top: 25px;
          right: 25px;
          width: 320px;
          background: #09090b;
          color: #f4f4f5;
          border: 2px solid #27272a;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 20px rgba(57,255,20,0.2);
          z-index: 2147483646;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          direction: rtl;
          display: none;
          user-select: none;
        }

        #zbp-floating-panel h3 {
          margin: 0 0 12px 0;
          font-size: 15px;
          font-weight: bold;
          color: #39FF14;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .zbp-btn {
          width: 100%;
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-weight: bold;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .zbp-btn-primary {
          background: #39FF14;
          color: #09090b;
        }
        .zbp-btn-primary:hover {
          background: #2ecc71;
          transform: translateY(-1px);
        }

        .zbp-btn-active {
          background: #e11d48 !important;
          color: #fff !important;
          animation: zbp-pulse 1.5s infinite;
        }

        @keyframes zbp-pulse {
          0% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(225, 29, 72, 0); }
          100% { box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }

        .zbp-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          font-size: 12px;
          color: #a1a1aa;
        }

        .zbp-slider {
          width: 100%;
          accent-color: #39FF14;
          cursor: pointer;
        }

        #zbp-status-bar {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2147483647;
          background: #09090b;
          border: 2px solid #39FF14;
          padding: 8px 18px;
          border-radius: 9999px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 30px rgba(57,255,20,0.5);
          display: none;
          align-items: center;
          gap: 12px;
          font-family: ui-monospace, monospace;
          font-size: 13px;
          color: #f4f4f5;
          direction: rtl;
        }

        #zbp-status-bar button {
          background: #18181b;
          color: #e4e4e7;
          border: 1px solid #3f3f46;
          padding: 4px 10px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        #zbp-status-bar button.zbp-reset-btn {
          background: #39FF14;
          color: #09090b;
          border: none;
          border-radius: 9999px;
          padding: 6px 16px;
          font-weight: bold;
        }
        #zbp-status-bar button.zbp-reset-btn:hover {
          background: #ffffff;
          transform: scale(1.05);
        }
      \`;
      document.head.appendChild(style);
    }

    buildDOM() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'zbp-overlay';
      document.body.appendChild(this.overlay);

      this.selectionBox = document.createElement('div');
      this.selectionBox.id = 'zbp-selection-box';
      document.body.appendChild(this.selectionBox);

      this.floatingPanel = document.createElement('div');
      this.floatingPanel.id = 'zbp-floating-panel';
      this.floatingPanel.innerHTML = \`
        <h3>
          <span>🔍 زوم حرفه‌ای صفحه</span>
          <button id="zbp-close-panel" style="background:none;border:none;color:#71717a;cursor:pointer;font-size:16px;">✕</button>
        </h3>
        <button id="zbp-toggle-draw" class="zbp-btn zbp-btn-primary">
          ✏️ شروع انتخاب محدوده زوم
        </button>
        <div class="zbp-row">
          <span>میزان بزرگ‌نمایی:</span>
          <span id="zbp-level-val" style="color:#39FF14;font-weight:bold;">\${this.settings.zoomLevel}%</span>
        </div>
        <input type="range" id="zbp-zoom-slider" class="zbp-slider" min="125" max="500" step="25" value="\${this.settings.zoomLevel}">
        <div class="zbp-row" style="margin-top:12px;">
          <span>کلید میانبر:</span>
          <span style="direction:ltr;background:#18181b;padding:2px 8px;border-radius:4px;border:1px solid #27272a;color:#fff;">Ctrl + Shift + \${this.settings.shortcutKey}</span>
        </div>
      \`;
      document.body.appendChild(this.floatingPanel);

      this.statusBar = document.createElement('div');
      this.statusBar.id = 'zbp-status-bar';
      this.statusBar.innerHTML = \`
        <span style="color:#39FF14;font-weight:bold;">🔎 زوم فعال (<span id="zbp-bar-val">\${this.settings.zoomLevel}</span>%)</span>
        <button id="zbp-bar-dec">-</button>
        <button id="zbp-bar-inc">+</button>
        <button id="zbp-bar-reset" class="zbp-reset-btn">بازگشت نرم به حالت عادی</button>
      \`;
      document.body.appendChild(this.statusBar);
    }

    applyPanelValues() {
      if (!this.floatingPanel) return;
      const levelVal = this.floatingPanel.querySelector('#zbp-level-val');
      const slider = this.floatingPanel.querySelector('#zbp-zoom-slider');
      if (levelVal) levelVal.textContent = \`\${this.settings.zoomLevel}%\`;
      if (slider) slider.value = this.settings.zoomLevel;
    }

    bindListeners() {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
        chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
          if (req.action === 'toggleExtensionUI') {
            this.togglePanel();
            sendResponse({ success: true });
          }
        });
      }

      this.floatingPanel.querySelector('#zbp-close-panel').addEventListener('click', () => {
        this.floatingPanel.style.display = 'none';
      });

      const drawBtn = this.floatingPanel.querySelector('#zbp-toggle-draw');
      drawBtn.addEventListener('click', () => {
        if (this.isDrawingMode) {
          this.cancelDrawing();
        } else {
          this.startDrawingMode();
        }
      });

      const slider = this.floatingPanel.querySelector('#zbp-zoom-slider');
      slider.addEventListener('input', (e) => {
        this.settings.zoomLevel = parseInt(e.target.value, 10);
        this.floatingPanel.querySelector('#zbp-level-val').textContent = \`\${this.settings.zoomLevel}%\`;
        this.saveSettings();
        if (this.isZoomed) {
          this.updateZoomScale();
        }
      });

      this.statusBar.querySelector('#zbp-bar-dec').addEventListener('click', () => {
        this.settings.zoomLevel = Math.max(100, this.settings.zoomLevel - 25);
        this.applyPanelValues();
        this.updateZoomScale();
        this.saveSettings();
      });

      this.statusBar.querySelector('#zbp-bar-inc').addEventListener('click', () => {
        this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
        this.applyPanelValues();
        this.updateZoomScale();
        this.saveSettings();
      });

      this.statusBar.querySelector('#zbp-bar-reset').addEventListener('click', () => {
        this.zoomOutSmoothly();
      });

      window.addEventListener('keydown', (e) => {
        const key = this.settings.shortcutKey || 'Z';
        const matchesKey = e.key.toUpperCase() === key.toUpperCase() || e.code === \`Key\${key.toUpperCase()}\`;
        const matchesCtrl = (e.ctrlKey || e.metaKey) === (this.settings.shortcutCtrl ?? true);
        const matchesShift = e.shiftKey === (this.settings.shortcutShift ?? true);
        const matchesAlt = e.altKey === (this.settings.shortcutAlt ?? false);

        if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
          e.preventDefault();
          this.togglePanel();
        } else if (e.key === 'Escape') {
          if (this.isDrawingMode) {
            this.cancelDrawing();
          } else if (this.isZoomed) {
            this.zoomOutSmoothly();
          }
        }
      });

      this.overlay.addEventListener('mousedown', (e) => {
        if (!this.isDrawingMode) return;
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = \`\${this.startX}px\`;
        this.selectionBox.style.top = \`\${this.startY}px\`;
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.isDrawingMode) return;
        const currentX = e.clientX;
        const currentY = e.clientY;
        const left = Math.min(currentX, this.startX);
        const top = Math.min(currentY, this.startY);
        const width = Math.abs(currentX - this.startX);
        const height = Math.abs(currentY - this.startY);

        this.selectionBox.style.left = \`\${left}px\`;
        this.selectionBox.style.top = \`\${top}px\`;
        this.selectionBox.style.width = \`\${width}px\`;
        this.selectionBox.style.height = \`\${height}px\`;
      });

      window.addEventListener('mouseup', (e) => {
        if (!this.isDragging || !this.isDrawingMode) return;
        this.isDragging = false;
        const rect = this.selectionBox.getBoundingClientRect();
        this.selectionBox.style.display = 'none';
        this.cancelDrawing();

        if (rect.width > 20 && rect.height > 20) {
          this.applyFullPageZoom(rect);
        }
      });
    }

    togglePanel() {
      if (this.floatingPanel.style.display === 'block') {
        this.floatingPanel.style.display = 'none';
      } else {
        this.floatingPanel.style.display = 'block';
      }
    }

    startDrawingMode() {
      this.isDrawingMode = true;
      this.overlay.style.display = 'block';
      const drawBtn = this.floatingPanel.querySelector('#zbp-toggle-draw');
      drawBtn.textContent = '❌ لغو انتخاب';
      drawBtn.classList.add('zbp-btn-active');
    }

    cancelDrawing() {
      this.isDrawingMode = false;
      this.isDragging = false;
      this.overlay.style.display = 'none';
      this.selectionBox.style.display = 'none';
      const drawBtn = this.floatingPanel.querySelector('#zbp-toggle-draw');
      drawBtn.textContent = '✏️ شروع انتخاب محدوده زوم';
      drawBtn.classList.remove('zbp-btn-active');
    }

    applyFullPageZoom(rect) {
      this.isZoomed = true;
      const scale = this.settings.zoomLevel / 100;
      this.lastOriginX = rect.left + rect.width / 2 + window.scrollX;
      this.lastOriginY = rect.top + rect.height / 2 + window.scrollY;

      document.body.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      document.body.style.transform = \`scale(\${scale})\`;

      this.statusBar.style.display = 'flex';
      this.statusBar.querySelector('#zbp-bar-val').textContent = this.settings.zoomLevel;
    }

    updateZoomScale() {
      if (!this.isZoomed) return;
      const scale = this.settings.zoomLevel / 100;
      document.body.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.transform = \`scale(\${scale})\`;
      this.statusBar.querySelector('#zbp-bar-val').textContent = this.settings.zoomLevel;
    }

    zoomOutSmoothly() {
      this.isZoomed = false;
      this.cancelDrawing();

      document.body.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      document.body.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      document.body.style.transform = 'scale(1)';

      this.statusBar.style.display = 'none';

      setTimeout(() => {
        if (!this.isZoomed) {
          document.body.style.transform = 'none';
          document.body.style.transformOrigin = 'initial';
        }
      }, 700);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new ChromeZoomExtension());
  } else {
    new ChromeZoomExtension();
  }
})();`,
    },
    background: {
      name: 'background.js',
      desc: 'Service Worker: Context Action & Multi-Tab Injection',
      code: `// background.js - مدیریت پیام‌ها و باز کردن پنل کنترل در تب‌ها
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    zoomLevel: 200,
    boxColor: '#39FF14',
    opacity: 50,
    shortcutKey: 'Z',
    shortcutCtrl: true,
    shortcutShift: true,
    shortcutAlt: false,
    extensionEnabled: true
  });
});

chrome.action.onClicked.addListener((tab) => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { action: 'toggleExtensionUI' }, (response) => {
    if (chrome.runtime.lastError) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js']
      }).then(() => {
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: 'toggleExtensionUI' });
        }, 150);
      }).catch(err => console.error("Error executing script:", err));
    }
  });
});`,
    },
    readme: {
      name: 'README.md',
      desc: 'Official Extension Documentation & Installation Guide',
      code: `# Zoom Box Pro - افزونه زوم حرفه‌ای صفحه (نسخه 8.1.0)

## ویژگی‌های نسخه جدید
✅ **زوم کامل صفحه بر روی محدوده انتخابی (Full-Page Scale)**  
✅ **انیمیشن خروج نرم و تدریجی (Smooth Gradual Zoom-Out)** بدون هیچ پرش  
✅ **پنل تنظیمات شناور و نوار وضعیت زوم زنده**  
✅ **پشتیبانی کامل از شورت‌کات صفحه کلید (Ctrl + Shift + Z و Esc)**  
✅ **طراحی شده بر پایه استاندارد Manifest V3 گوگل کروم**  

## راهنمای نصب در کروم (Load Unpacked)
1. مرورگر گوگل کروم را باز کنید و وارد آدرس \`chrome://extensions\` شوید.
2. گزینه **Developer mode** را در بالا سمت راست فعال کنید.
3. دکمه **Load unpacked** را بزنید و پوشه \`zoom-extension-v2\` را انتخاب نمایید.`,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 my-6">
      {/* Installation Guide Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#39FF14]/10 border border-[#39FF14]/40 text-[#39FF14]">
            <Chrome className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              {lang === 'fa' ? 'راهنمای نصب افزونه در گوگل کروم' : 'Chrome Extension Installation Guide'}
            </h2>
            <p className="text-xs text-zinc-400">
              {lang === 'fa' 
                ? 'فایل‌های افزونه در پوشه zoom-extension-v2 قرار دارند و بدون نیاز به بیلد آماده نصب هستند.'
                : 'The unpackaged Chrome extension lives in the /zoom-extension-v2 folder ready for Developer Mode loading.'}
            </p>
          </div>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#39FF14] font-bold">STEP 01</span>
              <Chrome className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-sm font-semibold text-white">Open Chrome Extensions</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Navigate to <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400">chrome://extensions</code> in your browser bar.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#39FF14] font-bold">STEP 02</span>
              <ShieldCheck className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-sm font-semibold text-white">Enable Developer Mode</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Toggle the switch in the top right corner of the Extensions manager.
            </p>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-[#39FF14] font-bold">STEP 03</span>
              <FolderCheck className="w-4 h-4 text-zinc-500" />
            </div>
            <div className="text-sm font-semibold text-white">Load Unpacked</div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Click <strong>"Load unpacked"</strong> and select the <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400">zoom-extension-v2</code> directory.
            </p>
          </div>
        </div>
      </div>

      {/* Code Inspector & Manifest Viewer */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Tab Headers */}
        <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['manifest', 'content', 'background', 'readme'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  selectedFile === key
                    ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{files[key].name}</span>
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
        <div className="bg-zinc-900/40 px-5 py-2 text-[11px] font-mono text-zinc-400 border-b border-zinc-800/60">
          {files[selectedFile].desc}
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
