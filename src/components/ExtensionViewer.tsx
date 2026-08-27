import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Chrome, ShieldCheck, FolderCheck, Flame, Layers } from 'lucide-react';
import JSZip from 'jszip';

interface Props {
  lang: 'fa' | 'en';
}

export const ExtensionViewer: React.FC<Props> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<'manifest' | 'popupHtml' | 'popupJs' | 'content' | 'background' | 'readme'>('manifest');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'chrome' | 'firefox'>('firefox');

  const files = {
    manifest: {
      name: 'manifest.json',
      desc: 'Cross-Browser Manifest V3 (Firefox & Chrome Compatible)',
      code: `{
  "manifest_version": 3,
  "name": "Zoom Box Pro - زوم حرفه‌ای صفحه",
  "version": "8.4.0",
  "description": "افزونه زوم حرفه‌ای تمام‌صفحه با کشیدن کادر و انیمیشن روان - سازگار با فایرفاکس، کروم، بریو و اج بدون نیاز به رفرش",
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
    "service_worker": "background.js",
    "scripts": ["background.js"]
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
      desc: 'Toolbar Action Popup UI (Dark & Neon Theme)',
      code: `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zoom Box Pro</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: sans-serif; }
    body { width: 300px; background-color: #09090b; color: #f4f4f5; padding: 16px; user-select: none; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 14px; }
    .header-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #39FF14; }
    .badge { font-size: 10px; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px; }
    .btn { width: 100%; padding: 10px 14px; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; margin-bottom: 8px; }
    .btn-primary { background: #39FF14; color: #09090b; box-shadow: 0 0 15px rgba(57, 255, 20, 0.25); }
    .btn-primary:hover { background: #2ecc71; transform: translateY(-1px); }
    .btn-secondary { background: #18181b; color: #e4e4e7; border: 1px solid #27272a; }
    .btn-secondary:hover { background: #27272a; color: #fff; }
    .btn-reset { background: #18181b; color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); }
    .section { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .slider-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #a1a1aa; margin-bottom: 8px; }
    .slider-val { font-weight: 700; color: #39FF14; font-size: 13px; }
    input[type="range"] { width: 100%; accent-color: #39FF14; cursor: pointer; }
    .footer-tip { font-size: 11px; color: #71717a; display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #27272a; }
    .kbd { background: #27272a; color: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 10px; border: 1px solid #3f3f46; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title"><span>🔍</span><span>Zoom Box Pro</span></div>
    <span class="badge">v8.4.0</span>
  </div>
  <button id="btn-draw" class="btn btn-primary"><span>✏️</span><span>شروع انتخاب و رسم کادر زوم</span></button>
  <button id="btn-toggle-panel" class="btn btn-secondary"><span>📌</span><span>نمایش / پنهان کردن پنل در صفحه</span></button>
  <div class="section">
    <div class="slider-row"><span>میزان بزرگ‌نمایی:</span><span id="zoom-value" class="slider-val">200%</span></div>
    <input type="range" id="zoom-slider" min="125" max="500" step="25" value="200">
  </div>
  <button id="btn-reset" class="btn btn-reset"><span>🔄</span><span>بازگشت نرم به حالت عادی (100%)</span></button>
  <div class="footer-tip"><span>کلید میانبر سریع:</span><span class="kbd">Ctrl + Shift + Z</span></div>
  <script src="popup.js"></script>
</body>
</html>`,
    },
    popupJs: {
      name: 'popup.js',
      desc: 'Popup Controller: Tab Messaging & Instant Script Injection',
      code: `// popup.js - مدیریت پاپ‌آپ افزونه در کروم و فایرفاکس
const extApi = typeof browser !== 'undefined' ? browser : chrome;

document.addEventListener('DOMContentLoaded', async () => {
  const btnDraw = document.getElementById('btn-draw');
  const btnTogglePanel = document.getElementById('btn-toggle-panel');
  const btnReset = document.getElementById('btn-reset');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');

  async function getActiveTab() {
    return new Promise((resolve) => {
      extApi.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        resolve(tabs && tabs[0] ? tabs[0] : null);
      });
    });
  }

  async function sendMessageToTab(message, autoClose = false) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;

    extApi.tabs.sendMessage(tab.id, message, (response) => {
      const err = extApi.runtime.lastError;
      if (err || !response) {
        // تزریق آنی اسکریپت اگر تب از قبل باز بوده است
        if (extApi.scripting && extApi.scripting.executeScript) {
          extApi.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] }).then(() => {
            setTimeout(() => {
              extApi.tabs.sendMessage(tab.id, message);
              if (autoClose) window.close();
            }, 100);
          });
        }
      } else {
        if (autoClose) window.close();
      }
    });
  }

  btnDraw.addEventListener('click', () => {
    sendMessageToTab({ action: 'startDrawingMode' }, true);
  });

  btnTogglePanel.addEventListener('click', () => {
    sendMessageToTab({ action: 'toggleExtensionUI' }, true);
  });

  zoomSlider.addEventListener('input', (e) => {
    const level = parseInt(e.target.value, 10);
    zoomValue.textContent = \`\${level}%\`;
    if (extApi.storage && extApi.storage.sync) {
      extApi.storage.sync.set({ zoomLevel: level });
    }
    sendMessageToTab({ action: 'updateZoomLevel', zoomLevel: level }, false);
  });

  btnReset.addEventListener('click', () => {
    sendMessageToTab({ action: 'resetZoom' }, false);
  });
});`,
    },
    content: {
      name: 'content.js',
      desc: 'Cross-Browser Content Script: Full-Page Zoom & Smooth Gradual Zoom-Out',
      code: `/**
 * Zoom Box Pro - Content Script (سازگار کامل با تمامی مرورگرها)
 * نسخه 8.4.0
 */
(function () {
  'use strict';
  if (window.__ZOOM_BOX_PRO_ACTIVE__) return;
  window.__ZOOM_BOX_PRO_ACTIVE__ = true;

  const extApi = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  class CrossBrowserZoomExtension {
    constructor() {
      this.isDrawingMode = false;
      this.isDragging = false;
      this.startX = 0;
      this.startY = 0;
      this.isZoomed = false;
      this.lastOriginX = window.innerWidth / 2;
      this.lastOriginY = window.innerHeight / 2;
      this.settings = { zoomLevel: 200, boxColor: '#39FF14', opacity: 50, shortcutKey: 'Z' };
      this.init();
    }

    init() {
      this.injectStyles();
      this.buildDOM();
      this.bindListeners();
    }

    injectStyles() {
      if (document.getElementById('zbp-global-styles')) return;
      const style = document.createElement('style');
      style.id = 'zbp-global-styles';
      style.textContent = \`
        html, body { transform-origin: 0 0; }
        #zbp-overlay { position: fixed !important; top: 0 !important; left: 0 !important; width: 100vw !important; height: 100vh !important; z-index: 2147483640 !important; background: rgba(0, 0, 0, 0.45) !important; cursor: crosshair !important; display: none; }
        #zbp-selection-box { position: fixed !important; z-index: 2147483642 !important; display: none; pointer-events: none !important; border: 3px solid #39FF14 !important; background: rgba(57, 255, 20, 0.2) !important; box-shadow: 0 0 25px rgba(57, 255, 20, 0.7) !important; }
        #zbp-floating-panel { position: fixed !important; top: 25px !important; right: 25px !important; width: 320px !important; background: #09090b !important; color: #f4f4f5 !important; border: 2px solid #39FF14 !important; border-radius: 16px !important; padding: 16px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.8), 0 0 25px rgba(57,255,20,0.3) !important; z-index: 2147483646 !important; direction: rtl !important; display: none; }
        #zbp-status-bar { position: fixed !important; bottom: 24px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 2147483647 !important; background: #09090b !important; border: 2px solid #39FF14 !important; padding: 8px 18px !important; border-radius: 9999px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.8) !important; display: none; align-items: center !important; gap: 12px !important; direction: rtl !important; }
      \`;
      (document.head || document.documentElement).appendChild(style);
    }

    buildDOM() {
      this.overlay = document.createElement('div');
      this.overlay.id = 'zbp-overlay';
      (document.body || document.documentElement).appendChild(this.overlay);

      this.selectionBox = document.createElement('div');
      this.selectionBox.id = 'zbp-selection-box';
      (document.body || document.documentElement).appendChild(this.selectionBox);

      this.floatingPanel = document.createElement('div');
      this.floatingPanel.id = 'zbp-floating-panel';
      this.floatingPanel.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-weight:bold;color:#39FF14;">🔍 زوم حرفه‌ای صفحه</span>
          <button id="zbp-close" style="background:none;border:none;color:#71717a;cursor:pointer;">✕</button>
        </div>
        <button id="zbp-draw-btn" style="width:100%;padding:10px;background:#39FF14;color:#000;border:none;border-radius:8px;font-weight:bold;cursor:pointer;margin-bottom:12px;">✏️ شروع رسم کادر زوم</button>
      \`;
      (document.body || document.documentElement).appendChild(this.floatingPanel);

      this.statusBar = document.createElement('div');
      this.statusBar.id = 'zbp-status-bar';
      this.statusBar.innerHTML = \`
        <span style="color:#39FF14;font-weight:bold;">🔎 زوم فعال</span>
        <button id="zbp-reset" style="background:#39FF14;color:#000;border:none;border-radius:9999px;padding:6px 14px;font-weight:bold;cursor:pointer;">بازگشت نرم</button>
      \`;
      (document.body || document.documentElement).appendChild(this.statusBar);
    }

    bindListeners() {
      if (extApi && extApi.runtime && extApi.runtime.onMessage) {
        extApi.runtime.onMessage.addListener((req, sender, sendResponse) => {
          if (req.action === 'toggleExtensionUI') this.togglePanel();
          if (req.action === 'startDrawingMode') this.startDrawing();
          if (req.action === 'resetZoom') this.zoomOut();
          if (sendResponse) sendResponse({ success: true });
        });
      }

      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toUpperCase() === 'Z') {
          e.preventDefault();
          this.startDrawing();
        } else if (e.key === 'Escape') {
          this.zoomOut();
        }
      });
    }

    startDrawing() {
      this.isDrawingMode = true;
      this.overlay.style.display = 'block';
    }

    togglePanel() {
      this.floatingPanel.style.display = this.floatingPanel.style.display === 'block' ? 'none' : 'block';
    }

    zoomOut() {
      this.isZoomed = false;
      this.overlay.style.display = 'none';
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transform = 'scale(1)';
      this.statusBar.style.display = 'none';
    }
  }

  new CrossBrowserZoomExtension();
})();`,
    },
    background: {
      name: 'background.js',
      desc: 'Cross-Browser Service Worker & Background Manager',
      code: `// background.js - اسکریپت پس‌زمینه چندمرورگره
const ext = typeof browser !== 'undefined' ? browser : chrome;

ext.runtime.onInstalled.addListener(() => {
  ext.storage.sync.set({
    zoomLevel: 200,
    boxColor: '#39FF14',
    opacity: 50,
    shortcutKey: 'Z',
    extensionEnabled: true
  });
});`,
    },
    readme: {
      name: 'README.md',
      desc: 'Extension Documentation & Multi-Browser Installation Guide',
      code: `# Zoom Box Pro (نسخه 8.4.0)
افزونه زوم تمام‌صفحه با کادر موس - سازگار با Mozilla Firefox و Google Chrome

## نصب در فایرفاکس (Firefox)
1. در نوار آدرس فایرفاکس بروید به: about:debugging#/runtime/this-firefox
2. دکمه Load Temporary Add-on را بزنید.
3. فایل manifest.json را انتخاب کنید.
4. وارد یک وبسایت عادی (مانند google.com یا wikipedia.org) شوید و روی آیکون افزونه کلیک کنید.

## نصب در گوگل کروم (Chrome / Brave / Edge)
1. در نوار آدرس وارد شوید به: chrome://extensions
2. گزینه Developer mode را روشن کنید.
3. روی Load unpacked کلیک کرده و پوشه zoom-extension-v2 را انتخاب کنید.`,
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
        folder.file('popup.html', files.popupHtml.code);
        folder.file('popup.js', files.popupJs.code);
        folder.file('content.js', files.content.code);
        folder.file('background.js', files.background.code);
        folder.file('README.md', files.readme.code);

        const iconsFolder = folder.folder('icons');
        if (iconsFolder) {
          // ایجاد فایل آیکون پیش‌فرض بر پایه Canvas
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
      a.download = 'zoom-box-pro-v8.4.0.zip';
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
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {lang === 'fa' 
                  ? (activeGuideTab === 'firefox' ? 'راهنمای نصب در موزیلا فایرفاکس (Firefox)' : 'راهنمای نصب در کروم / بریو / اج')
                  : (activeGuideTab === 'firefox' ? 'Mozilla Firefox Installation Guide' : 'Chrome / Brave / Edge Installation Guide')}
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'fa' 
                  ? 'پکیج افزونه شامل منوی پاپ‌آپ، زوم تمام‌صفحه و انیمیشن روان بدون نیاز به رفرش'
                  : 'Ready-to-use cross-browser extension with popup menu, full-page scale and zero refresh.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] text-black font-bold text-sm shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:bg-[#2ecc71] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? (lang === 'fa' ? 'در حال ایجاد فایل زیپ...' : 'Zipping...') : (lang === 'fa' ? 'دانلود پکیج ZIP افزونه' : 'Download Extension ZIP')}</span>
          </button>
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
                در نوار آدرس فایرفاکس وارد کنید: <code className="bg-zinc-900 px-1 py-0.5 rounded text-orange-300 font-mono">about:debugging#/runtime/this-firefox</code>
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
              <div className="text-sm font-semibold text-white">تست روی هر سایت دلخواه</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                وارد سایتی مثل google.com شوید، روی آیکون پاپ‌آپ افزونه کلیک کرده یا <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">Ctrl+Shift+Z</code> بزنید.
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
            {(['manifest', 'popupHtml', 'popupJs', 'content', 'background', 'readme'] as const).map((key) => (
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
          <span className="text-zinc-500 text-[10px]">Cross-Browser Manifest V3</span>
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
