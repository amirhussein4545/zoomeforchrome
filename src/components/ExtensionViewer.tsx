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
      desc: 'Main Content Script: Box Drawing, Matrix Transform & Real-Time Controls',
      code: `// content.js - اسکریپت اصلی برای ایجاد قابلیت زوم با کشیدن کادر
// نسخه 8.0.0 - پشتیبانی کامل از پاپ‌آپ، بازگشت به حالت عادی بدون رفرش، اسکرول فعال

class ZoomBox {
  constructor() {
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.box = null;
    this.isActive = false;
    this.zoomLevel = 2;
    this.isPanelOpen = true;
    this.currentZoomLeft = 0;
    this.currentZoomTop = 0;
    this.currentZoomWidth = 0;
    this.currentZoomHeight = 0;
    this.settings = {
      zoomLevel: 100,
      bgColor: '#000000',
      opacity: 70,
      showPanel: true,
      extensionEnabled: true
    };
    
    this.injectStyles();
    this.init();
  }

  injectStyles() {
    if (document.getElementById('zoom-extension-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'zoom-extension-styles';
    style.textContent = \`
      #zoom-box-container { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .zoom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); pointer-events: none; z-index: 2147483646; display: none; }
      .zoom-selection-box { position: fixed; border: 3px solid #39FF14; background-color: rgba(57, 255, 20, 0.2); box-shadow: 0 0 20px rgba(57, 255, 20, 0.8); z-index: 2147483647; pointer-events: none; display: none; transition: all 0.1s ease; }
      .zoom-controls { position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #39FF14 100%); padding: 15px; border-radius: 12px; box-shadow: 0 10px 40px rgba(57, 255, 20, 0.4); z-index: 2147483647; display: flex; flex-direction: column; gap: 10px; min-width: 220px; backdrop-filter: blur(10px); border: 2px solid #39FF14; max-height: 90vh; overflow-y: auto; transition: all 0.3s ease; }
    \`;
    document.head.appendChild(style);
  }

  // Mouse & Touch Selection Event Listeners
  onMouseDown(e) {
    if (!this.isActive || !this.isDrawing) return;
    if (e.target.closest('#zoom-box-container')) return;
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = this.startX + 'px';
    this.selectionBox.style.top = this.startY + 'px';
  }

  applyZoom() {
    const originalElement = document.elementFromPoint(
      this.currentZoomLeft + this.currentZoomWidth / 2,
      this.currentZoomTop + this.currentZoomHeight / 2
    );
    if (!originalElement) return;

    const clone = originalElement.cloneNode(true);
    clone.id = 'zoomed-content';
    clone.style.position = 'fixed';
    clone.style.left = this.currentZoomLeft + 'px';
    clone.style.top = this.currentZoomTop + 'px';
    clone.style.width = this.currentZoomWidth + 'px';
    clone.style.height = this.currentZoomHeight + 'px';
    clone.style.transformOrigin = 'top left';
    clone.style.transform = \`scale(\${this.zoomLevel})\`;
    clone.style.zIndex = '2147483647';
    document.body.appendChild(clone);
  }
}`,
    },
    background: {
      name: 'background.js',
      desc: 'Service Worker: Settings Sync & Multi-Tab Broadcast',
      code: `// background.js - سرویس ورکر برای مدیریت افزونه
// نسخه 8.0.0 - پشتیبانی از پاپ‌آپ و ارتباط دوطرفه

chrome.runtime.onInstalled.addListener((details) => {
  console.log('Zoom Box Pro installed', details.reason);
  
  chrome.storage.sync.set({
    zoomLevel: 100,
    bgColor: '#000000',
    opacity: 70,
    showPanel: true,
    extensionEnabled: true
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get([
      'zoomLevel', 'bgColor', 'opacity', 'showPanel', 'extensionEnabled'
    ], (result) => {
      sendResponse({ settings: result });
    });
    return true;
  }
  
  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});`,
    },
    readme: {
      name: 'README.md',
      desc: 'Official Extension Documentation & Release Notes',
      code: `# Zoom Box Pro - افزونه زوم حرفه‌ای صفحه (نسخه 8.0.0)

## ویژگی‌های کلیدی
✅ بدون نیاز به رفرش صفحه - افزونه بلافاصله پس از نصب کار می‌کند  
✅ امکان اسکرول بعد از زوم - دسترسی آزاد و روان به تمام محتوا  
✅ پنل تنظیمات شناور - با دکمه ▼/▲ جمع و باز می‌شود  
✅ کنترل کامل زوم - تغییر سطح بزرگ‌نمایی، رنگ کادر و شفافیت  

## نحوه نصب در گوگل کروم (Chrome)
1. مرورگر کروم را باز کنید و به آدرس chrome://extensions بروید.
2. گزینه Developer mode را در بالا سمت راست فعال کنید.
3. دکمه Load unpacked را بزنید و پوشه zoom-extension-v2 را انتخاب کنید.

## شورت‌کات‌های کیبورد
- Ctrl+Shift+Z : فعال/غیرفعال کردن حالت رسم کادر
- Ctrl+Shift+R : بازنشانی زوم به ۱۰۰٪
- Esc : خروج سریع از حالت زوم`,
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
