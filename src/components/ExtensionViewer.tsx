import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Chrome, ShieldCheck, FolderCheck, Flame, Sparkles, Layers } from 'lucide-react';
import JSZip from 'jszip';

interface Props {
  lang: 'fa' | 'en';
}

const BROWSER_POLYFILL_CODE = `(function(a,b){if("function"==typeof define&&define.amd)define("webextension-polyfill",["module"],b);else if("undefined"!=typeof exports)b(module);else{var c={exports:{}};b(c),a.browser=c.exports}})("undefined"==typeof globalThis?"undefined"==typeof self?this:self:globalThis,function(a){"use strict";if(!(globalThis.chrome&&globalThis.chrome.runtime&&globalThis.chrome.runtime.id))throw new Error("This script should only be loaded in a browser extension.");if(!(globalThis.browser&&globalThis.browser.runtime&&globalThis.browser.runtime.id)){a.exports=(a=>{const b={alarms:{clear:{minArgs:0,maxArgs:1},clearAll:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getAll:{minArgs:0,maxArgs:0}},bookmarks:{create:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},getChildren:{minArgs:1,maxArgs:1},getRecent:{minArgs:1,maxArgs:1},getSubTree:{minArgs:1,maxArgs:1},getTree:{minArgs:0,maxArgs:0},move:{minArgs:2,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeTree:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}},browserAction:{disable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},enable:{minArgs:0,maxArgs:1,fallbackToNoCallback:!0},getBadgeBackgroundColor:{minArgs:1,maxArgs:1},getBadgeText:{minArgs:1,maxArgs:1},getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},openPopup:{minArgs:0,maxArgs:0},setBadgeBackgroundColor:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setBadgeText:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},browsingData:{remove:{minArgs:2,maxArgs:2},removeCache:{minArgs:1,maxArgs:1},removeCookies:{minArgs:1,maxArgs:1},removeDownloads:{minArgs:1,maxArgs:1},removeFormData:{minArgs:1,maxArgs:1},removeHistory:{minArgs:1,maxArgs:1},removeLocalStorage:{minArgs:1,maxArgs:1},removePasswords:{minArgs:1,maxArgs:1},removePluginData:{minArgs:1,maxArgs:1},settings:{minArgs:0,maxArgs:0}},commands:{getAll:{minArgs:0,maxArgs:0}},contextMenus:{remove:{minArgs:1,maxArgs:1},removeAll:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},cookies:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:1,maxArgs:1},getAllCookieStores:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},devtools:{inspectedWindow:{eval:{minArgs:1,maxArgs:2,singleCallbackArg:!1}},panels:{create:{minArgs:3,maxArgs:3,singleCallbackArg:!0},elements:{createSidebarPane:{minArgs:1,maxArgs:1}}}},downloads:{cancel:{minArgs:1,maxArgs:1},download:{minArgs:1,maxArgs:1},erase:{minArgs:1,maxArgs:1},getFileIcon:{minArgs:1,maxArgs:2},open:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},pause:{minArgs:1,maxArgs:1},removeFile:{minArgs:1,maxArgs:1},resume:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},extension:{isAllowedFileSchemeAccess:{minArgs:0,maxArgs:0},isAllowedIncognitoAccess:{minArgs:0,maxArgs:0}},history:{addUrl:{minArgs:1,maxArgs:1},deleteAll:{minArgs:0,maxArgs:0},deleteRange:{minArgs:1,maxArgs:1},deleteUrl:{minArgs:1,maxArgs:1},getVisits:{minArgs:1,maxArgs:1},search:{minArgs:1,maxArgs:1}},i18n:{detectLanguage:{minArgs:1,maxArgs:1},getAcceptLanguages:{minArgs:0,maxArgs:0}},identity:{launchWebAuthFlow:{minArgs:1,maxArgs:1}},idle:{queryState:{minArgs:1,maxArgs:1}},management:{get:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},getSelf:{minArgs:0,maxArgs:0},setEnabled:{minArgs:2,maxArgs:2},uninstallSelf:{minArgs:0,maxArgs:1}},notifications:{clear:{minArgs:1,maxArgs:1},create:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:0},getPermissionLevel:{minArgs:0,maxArgs:0},update:{minArgs:2,maxArgs:2}},pageAction:{getPopup:{minArgs:1,maxArgs:1},getTitle:{minArgs:1,maxArgs:1},hide:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setIcon:{minArgs:1,maxArgs:1},setPopup:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},setTitle:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0},show:{minArgs:1,maxArgs:1,fallbackToNoCallback:!0}},permissions:{contains:{minArgs:1,maxArgs:1},getAll:{minArgs:0,maxArgs:0},remove:{minArgs:1,maxArgs:1},request:{minArgs:1,maxArgs:1}},runtime:{getBackgroundPage:{minArgs:0,maxArgs:0},getPlatformInfo:{minArgs:0,maxArgs:0},openOptionsPage:{minArgs:0,maxArgs:0},requestUpdateCheck:{minArgs:0,maxArgs:0},sendMessage:{minArgs:1,maxArgs:3},sendNativeMessage:{minArgs:2,maxArgs:2},setUninstallURL:{minArgs:1,maxArgs:1}},sessions:{getDevices:{minArgs:0,maxArgs:1},getRecentlyClosed:{minArgs:0,maxArgs:1},restore:{minArgs:0,maxArgs:1}},storage:{local:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}},managed:{get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1}},sync:{clear:{minArgs:0,maxArgs:0},get:{minArgs:0,maxArgs:1},getBytesInUse:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}}},tabs:{captureVisibleTab:{minArgs:0,maxArgs:2},create:{minArgs:1,maxArgs:1},detectLanguage:{minArgs:0,maxArgs:1},discard:{minArgs:0,maxArgs:1},duplicate:{minArgs:1,maxArgs:1},executeScript:{minArgs:1,maxArgs:2},get:{minArgs:1,maxArgs:1},getCurrent:{minArgs:0,maxArgs:0},getZoom:{minArgs:0,maxArgs:1},getZoomSettings:{minArgs:0,maxArgs:1},goBack:{minArgs:0,maxArgs:1},goForward:{minArgs:0,maxArgs:1},highlight:{minArgs:1,maxArgs:1},insertCSS:{minArgs:1,maxArgs:2},move:{minArgs:2,maxArgs:2},query:{minArgs:1,maxArgs:1},reload:{minArgs:0,maxArgs:2},remove:{minArgs:1,maxArgs:1},removeCSS:{minArgs:1,maxArgs:2},sendMessage:{minArgs:2,maxArgs:3},setZoom:{minArgs:1,maxArgs:2},setZoomSettings:{minArgs:1,maxArgs:2},update:{minArgs:1,maxArgs:2}},topSites:{get:{minArgs:0,maxArgs:0}},webNavigation:{getAllFrames:{minArgs:1,maxArgs:1},getFrame:{minArgs:1,maxArgs:1}},webRequest:{handlerBehaviorChanged:{minArgs:0,maxArgs:0}},windows:{create:{minArgs:0,maxArgs:1},get:{minArgs:1,maxArgs:2},getAll:{minArgs:0,maxArgs:1},getCurrent:{minArgs:0,maxArgs:1},getLastFocused:{minArgs:0,maxArgs:1},remove:{minArgs:1,maxArgs:1},update:{minArgs:2,maxArgs:2}}};if(0===Object.keys(b).length)throw new Error("api-metadata.json has not been included in browser-polyfill");class c extends WeakMap{constructor(a,b=void 0){super(b),this.createItem=a}get(a){return this.has(a)||this.set(a,this.createItem(a)),super.get(a)}}const d=a=>a&&"object"==typeof a&&"function"==typeof a.then,e=(b,c)=>(...d)=>{a.runtime.lastError?b.reject(new Error(a.runtime.lastError.message)):c.singleCallbackArg||1>=d.length&&!1!==c.singleCallbackArg?b.resolve(d[0]):b.resolve(d)},f=a=>1==a?"argument":"arguments",g=(a,b)=>function(c,...d){if(d.length<b.minArgs)throw new Error(\`Expected at least \${b.minArgs} \${f(b.minArgs)} for \${a}(), got \${d.length}\`);if(d.length>b.maxArgs)throw new Error(\`Expected at most \${b.maxArgs} \${f(b.maxArgs)} for \${a}(), got \${d.length}\`);return new Promise((f,g)=>{if(b.fallbackToNoCallback)try{c[a](...d,e({resolve:f,reject:g},b))}catch(e){console.warn(\`\${a} API method doesn't seem to support the callback parameter, falling back to call it without a callback: \`,e),c[a](...d),b.fallbackToNoCallback=!1,b.noCallback=!0,f()}else b.noCallback?(c[a](...d),f()):c[a](...d,e({resolve:f,reject:g},b))})},h=(a,b,c)=>new Proxy(b,{apply(b,d,e){return c.call(d,a,...e)}});let i=Function.call.bind(Object.prototype.hasOwnProperty);const j=(a,b={},c={})=>{let d=Object.create(null),e=Object.create(a);return new Proxy(e,{has(b,c){return c in a||c in d},get(e,f){if(f in d)return d[f];if(!(f in a))return;let k=a[f];if("function"==typeof k){if("function"==typeof b[f])k=h(a,a[f],b[f]);else if(i(c,f)){let b=g(f,c[f]);k=h(a,a[f],b)}else k=k.bind(a);}else if("object"==typeof k&&null!==k&&(i(b,f)||i(c,f)))k=j(k,b[f],c[f]);else if(i(c,"*"))k=j(k,b[f],c["*"]);else return Object.defineProperty(d,f,{configurable:!0,enumerable:!0,get(){return a[f]},set(b){a[f]=b}}),k;return d[f]=k,k},set(b,c,e){return c in d?d[c]=e:a[c]=e,!0},defineProperty(a,b,c){return Reflect.defineProperty(d,b,c)},deleteProperty(a,b){return Reflect.deleteProperty(d,b)}})},k=a=>({addListener(b,c,...d){b.addListener(a.get(c),...d)},hasListener(b,c){return b.hasListener(a.get(c))},removeListener(b,c){b.removeListener(a.get(c))}}),l=new c(a=>"function"==typeof a?function(b){const c=j(b,{},{getContent:{minArgs:0,maxArgs:0}});a(c)}:a),m=new c(a=>"function"==typeof a?function(b,c,e){let f,g,h=!1,i=new Promise(a=>{f=function(b){h=!0,a(b)}});try{g=a(b,c,f)}catch(a){g=Promise.reject(a)}const j=!0!==g&&d(g);if(!0!==g&&!j&&!h)return!1;const k=a=>{a.then(a=>{e(a)},a=>{let b;b=a&&(a instanceof Error||"string"==typeof a.message)?a.message:"An unexpected error occurred",e({__mozWebExtensionPolyfillReject__:!0,message:b})}).catch(a=>{console.error("Failed to send onMessage rejected reply",a)})};return j?k(g):k(i),!0}:a),n=({reject:b,resolve:c},d)=>{a.runtime.lastError?a.runtime.lastError.message==="The message port closed before a response was received."?c():b(new Error(a.runtime.lastError.message)):d&&d.__mozWebExtensionPolyfillReject__?b(new Error(d.message)):c(d)},o=(a,b,c,...d)=>{if(d.length<b.minArgs)throw new Error(\`Expected at least \${b.minArgs} \${f(b.minArgs)} for \${a}(), got \${d.length}\`);if(d.length>b.maxArgs)throw new Error(\`Expected at most \${b.maxArgs} \${f(b.maxArgs)} for \${a}(), got \${d.length}\`);return new Promise((a,b)=>{const e=n.bind(null,{resolve:a,reject:b});d.push(e),c.sendMessage(...d)})},p={devtools:{network:{onRequestFinished:k(l)}},runtime:{onMessage:k(m),onMessageExternal:k(m),sendMessage:o.bind(null,"sendMessage",{minArgs:1,maxArgs:3})},tabs:{sendMessage:o.bind(null,"sendMessage",{minArgs:2,maxArgs:3})}},q={clear:{minArgs:1,maxArgs:1},get:{minArgs:1,maxArgs:1},set:{minArgs:1,maxArgs:1}};return b.privacy={network:{"*":q},services:{"*":q},websites:{"*":q}},j(a,p,b)})(chrome)}else a.exports=globalThis.browser});`;

export const ExtensionViewer: React.FC<Props> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<'manifest' | 'polyfill' | 'popupHtml' | 'popupJs' | 'content' | 'background' | 'readme'>('content');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'firefox' | 'chrome'>('firefox');

  const files = {
    manifest: {
      name: 'manifest.json',
      desc: 'Cross-Browser Manifest V3 (Shadow DOM & webextension-polyfill)',
      code: `{
  "manifest_version": 3,
  "name": "Zoom Box Pro - زوم حرفه‌ای صفحه",
  "version": "8.6.0",
  "description": "افزونه زوم حرفه‌ای تمام‌صفحه با Shadow DOM ایزوله و انیمیشن روان - سازگار کامل با فایرفاکس، کروم، بریو و اج",
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
    "scripts": ["browser-polyfill.min.js", "background.js"],
    "service_worker": "background.js"
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
      "js": ["browser-polyfill.min.js", "content.js"],
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
    polyfill: {
      name: 'browser-polyfill.min.js',
      desc: 'Mozilla Official WebExtension Polyfill (Standard Promise API for browser.*)',
      code: BROWSER_POLYFILL_CODE,
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
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { width: 300px; background-color: #09090b; color: #f4f4f5; padding: 16px; user-select: none; }
    .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 14px; }
    .header-title { display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #39FF14; }
    .badge { font-size: 10px; background: #27272a; color: #a1a1aa; padding: 2px 6px; border-radius: 4px; direction: ltr; }
    .btn { width: 100%; padding: 10px 14px; border: none; border-radius: 8px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: all 0.2s ease; margin-bottom: 8px; }
    .btn-primary { background: #39FF14; color: #09090b; box-shadow: 0 0 15px rgba(57, 255, 20, 0.25); }
    .btn-primary:hover { background: #2ecc71; transform: translateY(-1px); box-shadow: 0 0 20px rgba(57, 255, 20, 0.4); }
    .btn-secondary { background: #18181b; color: #e4e4e7; border: 1px solid #27272a; }
    .btn-secondary:hover { background: #27272a; color: #ffffff; }
    .btn-reset { background: #18181b; color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.3); }
    .btn-reset:hover { background: rgba(244, 63, 94, 0.15); border-color: #f43f5e; }
    .section { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
    .slider-row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #a1a1aa; margin-bottom: 8px; }
    .slider-val { font-weight: 700; color: #39FF14; font-size: 13px; }
    input[type="range"] { width: 100%; accent-color: #39FF14; cursor: pointer; height: 4px; background: #27272a; border-radius: 2px; }
    .footer-tip { font-size: 11px; color: #71717a; display: flex; align-items: center; justify-content: space-between; padding-top: 8px; border-top: 1px solid #27272a; }
    .kbd { background: #27272a; color: #e4e4e7; padding: 2px 6px; border-radius: 4px; font-size: 10px; direction: ltr; border: 1px solid #3f3f46; }
    .msg-box { display: none; padding: 8px 10px; border-radius: 6px; font-size: 11px; margin-bottom: 10px; background: rgba(239, 68, 68, 0.15); color: #fca5a5; border: 1px solid rgba(239, 68, 68, 0.3); line-height: 1.4; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title"><span>🔍</span><span>Zoom Box Pro</span></div>
    <span class="badge">v8.6.0</span>
  </div>
  <div id="restricted-notice" class="msg-box">⚠️ این صفحه سیستمی مرورگر است. لطفاً افزونه را روی یک وب‌سایت عادی (مانند گوگل یا ویکی‌پدیا) اجرا نمایید.</div>
  <button id="btn-draw" class="btn btn-primary"><span>✏️</span><span>شروع انتخاب و رسم کادر زوم</span></button>
  <button id="btn-toggle-panel" class="btn btn-secondary"><span>📌</span><span>نمایش / پنهان کردن پنل در صفحه</span></button>
  <div class="section">
    <div class="slider-row"><span>میزان بزرگ‌نمایی:</span><span id="zoom-value" class="slider-val">200%</span></div>
    <input type="range" id="zoom-slider" min="125" max="500" step="25" value="200">
  </div>
  <button id="btn-reset" class="btn btn-reset"><span>🔄</span><span>بازگشت نرم به حالت عادی (100%)</span></button>
  <div class="footer-tip"><span>کلید میانبر سریع:</span><span class="kbd">Ctrl + Shift + Z</span></div>
  <script src="browser-polyfill.min.js"></script>
  <script src="popup.js"></script>
</body>
</html>`,
    },
    popupJs: {
      name: 'popup.js',
      desc: 'Popup Controller powered by webextension-polyfill Promise API',
      code: `// popup.js - کنترلر پاپ‌آپ با پشتیبانی ۱۰۰٪ استاندارد webextension-polyfill
document.addEventListener('DOMContentLoaded', async () => {
  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
  const btnDraw = document.getElementById('btn-draw');
  const btnTogglePanel = document.getElementById('btn-toggle-panel');
  const btnReset = document.getElementById('btn-reset');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomValue = document.getElementById('zoom-value');
  const restrictedNotice = document.getElementById('restricted-notice');

  // دریافت تب فعال به صورت Promise یکپارچه
  async function getActiveTab() {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs[0]) return tabs[0];
      const fallback = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      return fallback && fallback[0] ? fallback[0] : null;
    } catch (e) {
      console.warn('Polyfill tabs.query error:', e);
      return null;
    }
  }

  // بارگذاری تنظیمات با browser.storage.sync (Promise API)
  try {
    const data = await browserAPI.storage.sync.get({ zoomLevel: 200 });
    if (data && data.zoomLevel) {
      zoomSlider.value = data.zoomLevel;
      zoomValue.textContent = \`\${data.zoomLevel}%\`;
    }
  } catch (e) {
    console.warn('Storage sync error:', e);
  }

  // بررسی صفحه‌های سیستمی مرورگر
  const activeTab = await getActiveTab();
  if (activeTab && activeTab.url) {
    const restrictedPrefixes = ['about:', 'chrome:', 'edge:', 'moz-extension:', 'chrome-extension:', 'view-source:'];
    const isRestricted = restrictedPrefixes.some(p => activeTab.url.startsWith(p)) || activeTab.url.includes('addons.mozilla.org');
    
    if (isRestricted) {
      if (restrictedNotice) restrictedNotice.style.display = 'block';
      btnDraw.disabled = true;
      btnDraw.style.opacity = '0.5';
      btnDraw.style.cursor = 'not-allowed';
    }
  }

  // ارسال پیام با browser.tabs.sendMessage و تزریق مجدد اسکریپت در صورت نیاز
  async function sendMessageToTab(message, autoClose = false) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;

    try {
      await browserAPI.tabs.sendMessage(tab.id, message);
    } catch (err) {
      try {
        if (browserAPI.scripting && browserAPI.scripting.executeScript) {
          await browserAPI.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['browser-polyfill.min.js', 'content.js']
          });
        }
        await new Promise(r => setTimeout(r, 120));
        await browserAPI.tabs.sendMessage(tab.id, message);
      } catch (injErr) {
        console.warn('Content script injection fallback warning:', injErr);
      }
    }

    if (autoClose) {
      window.close();
    }
  }

  btnDraw.addEventListener('click', () => {
    btnDraw.innerHTML = '<span>⏳</span><span>در حال فعال‌سازی...</span>';
    sendMessageToTab({ action: 'startDrawingMode' }, true);
  });

  btnTogglePanel.addEventListener('click', () => {
    sendMessageToTab({ action: 'toggleExtensionUI' }, true);
  });

  zoomSlider.addEventListener('input', async (e) => {
    const level = parseInt(e.target.value, 10);
    zoomValue.textContent = \`\${level}%\`;
    try {
      await browserAPI.storage.sync.set({ zoomLevel: level });
    } catch (err) {
      console.warn('Storage save error:', err);
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
      desc: 'Content Script with Shadow DOM (100% CSS Isolation from Host Websites) & webextension-polyfill',
      code: `/**
 * Zoom Box Pro - Content Script (v8.6.0)
 * مجهز به لایه ایزوله کامل استایل‌ها (Shadow DOM) جهت جلوگیری از تداخل CSS با وب‌سایت‌ها
 * و پشتیبانی ۱۰۰٪ از استاندارد رسمی موزیلا webextension-polyfill
 */
(function () {
  'use strict';
  if (window.__ZOOM_BOX_PRO_INSTANCE__) return;

  const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

  class ZoomBoxProController {
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

      this.rootContainer = null;
      this.shadowRoot = null;
      this.overlay = null;
      this.selectionBox = null;
      this.floatingPanel = null;
      this.statusBar = null;

      this.init();
    }

    async init() {
      await this.loadSettings();
      this.injectHostGlobalStyles();
      this.buildShadowDOM();
      this.bindListeners();
    }

    async loadSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.sync) {
          const stored = await browserAPI.storage.sync.get(this.settings);
          if (stored) {
            this.settings = { ...this.settings, ...stored };
            this.applyPanelValues();
          }
        }
      } catch (e) {}
    }

    async saveSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.sync) {
          await browserAPI.storage.sync.set(this.settings);
        }
      } catch (e) {}
    }

    injectHostGlobalStyles() {
      if (document.getElementById('zbp-host-styles')) return;
      const style = document.createElement('style');
      style.id = 'zbp-host-styles';
      style.textContent = \`
        body { transform-origin: 0 0; }
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
      \`;
      (document.head || document.documentElement).appendChild(style);
    }

    buildShadowDOM() {
      this.rootContainer = document.createElement('div');
      this.rootContainer.id = 'zbp-root-host';
      this.shadowRoot = this.rootContainer.attachShadow({ mode: 'open' });

      const shadowStyle = document.createElement('style');
      shadowStyle.textContent = \`
        :host {
          all: initial;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Vazirmatn, Tahoma, sans-serif !important;
          font-size: 13px !important;
          line-height: 1.5 !important;
          color: #f4f4f5 !important;
          direction: rtl !important;
          box-sizing: border-box !important;
        }
        *, *::before, *::after {
          box-sizing: border-box !important;
          margin: 0; padding: 0;
          font-family: inherit !important;
          -webkit-font-smoothing: antialiased;
        }
        #zbp-overlay {
          position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100vh !important;
          z-index: 2147483641 !important; background: rgba(0, 0, 0, 0.45) !important; backdrop-filter: blur(2px) !important;
          cursor: crosshair !important; display: none; user-select: none !important; pointer-events: auto !important;
        }
        #zbp-overlay-tip {
          position: absolute !important; top: 24px !important; left: 50% !important; transform: translateX(-50%) !important;
          background: #09090b !important; color: #39FF14 !important; border: 1px solid #39FF14 !important;
          padding: 8px 20px !important; border-radius: 9999px !important; font-size: 13px !important; font-weight: 700 !important;
          box-shadow: 0 0 25px rgba(57, 255, 20, 0.45) !important; pointer-events: none !important; direction: rtl !important;
        }
        #zbp-selection-box {
          position: fixed !important; z-index: 2147483642 !important; display: none; pointer-events: none !important;
          border: 3px solid #39FF14 !important; background: rgba(57, 255, 20, 0.2) !important;
          box-shadow: 0 0 30px rgba(57, 255, 20, 0.75), inset 0 0 15px rgba(57, 255, 20, 0.3) !important;
        }
        #zbp-floating-panel {
          position: fixed !important; top: 24px !important; right: 24px !important; width: 320px !important;
          background: #09090b !important; color: #f4f4f5 !important; border: 2px solid #39FF14 !important;
          border-radius: 16px !important; padding: 16px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.9), 0 0 30px rgba(57,255,20,0.25) !important;
          z-index: 2147483646 !important; direction: rtl !important; display: none; user-select: none !important; pointer-events: auto !important;
        }
        .zbp-panel-header { display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 14px !important; padding-bottom: 8px !important; border-bottom: 1px solid #27272a !important; }
        .zbp-panel-title { font-size: 15px !important; font-weight: 700 !important; color: #39FF14 !important; display: flex !important; align-items: center !important; gap: 6px !important; }
        .zbp-close-btn { background: transparent !important; border: none !important; color: #71717a !important; cursor: pointer !important; font-size: 16px !important; padding: 2px 6px !important; border-radius: 4px !important; }
        .zbp-close-btn:hover { color: #f4f4f5 !important; background: #27272a !important; }
        .zbp-btn { width: 100% !important; padding: 10px 14px !important; border: none !important; border-radius: 8px !important; font-weight: 700 !important; font-size: 13px !important; cursor: pointer !important; transition: all 0.2s ease !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 8px !important; margin-bottom: 12px !important; }
        .zbp-btn-primary { background: #39FF14 !important; color: #09090b !important; box-shadow: 0 0 18px rgba(57, 255, 20, 0.3) !important; }
        .zbp-btn-primary:hover { background: #2ecc71 !important; transform: translateY(-1px) !important; box-shadow: 0 0 25px rgba(57, 255, 20, 0.5) !important; }
        .zbp-btn-active { background: #e11d48 !important; color: #fff !important; box-shadow: 0 0 18px rgba(225, 29, 72, 0.5) !important; }
        .zbp-row { display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 8px !important; font-size: 12px !important; color: #a1a1aa !important; }
        .zbp-slider { width: 100% !important; accent-color: #39FF14 !important; cursor: pointer !important; margin: 6px 0 12px 0 !important; height: 6px !important; background: #27272a !important; border-radius: 3px !important; }
        .zbp-kbd { direction: ltr !important; background: #18181b !important; padding: 2px 8px !important; border-radius: 4px !important; border: 1px solid #27272a !important; color: #f4f4f5 !important; font-family: monospace !important; font-size: 11px !important; }
        #zbp-status-bar { position: fixed !important; bottom: 24px !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 2147483647 !important; background: #09090b !important; border: 2px solid #39FF14 !important; padding: 8px 18px !important; border-radius: 9999px !important; box-shadow: 0 10px 40px rgba(0,0,0,0.9), 0 0 30px rgba(57,255,20,0.4) !important; display: none; align-items: center !important; gap: 12px !important; font-size: 13px !important; color: #f4f4f5 !important; direction: rtl !important; pointer-events: auto !important; }
        .zbp-bar-btn { background: #18181b !important; color: #e4e4e7 !important; border: 1px solid #3f3f46 !important; padding: 4px 10px !important; border-radius: 6px !important; cursor: pointer !important; font-weight: 700 !important; font-size: 13px !important; }
        .zbp-bar-btn:hover { background: #27272a !important; color: #ffffff !important; }
        .zbp-reset-btn { background: #39FF14 !important; color: #09090b !important; border: none !important; border-radius: 9999px !important; padding: 6px 16px !important; font-weight: 700 !important; cursor: pointer !important; box-shadow: 0 0 12px rgba(57,255,20,0.4) !important; }
        .zbp-reset-btn:hover { background: #ffffff !important; transform: scale(1.04) !important; }
      \`;
      this.shadowRoot.appendChild(shadowStyle);

      this.overlay = document.createElement('div');
      this.overlay.id = 'zbp-overlay';
      this.overlay.innerHTML = '<div id="zbp-overlay-tip">🖱️ کادر موردنظر را با موس بکشید یا روی نقطه دلخواه کلیک کنید (Esc برای لغو)</div>';
      this.shadowRoot.appendChild(this.overlay);

      this.selectionBox = document.createElement('div');
      this.selectionBox.id = 'zbp-selection-box';
      this.shadowRoot.appendChild(this.selectionBox);

      this.floatingPanel = document.createElement('div');
      this.floatingPanel.id = 'zbp-floating-panel';
      this.floatingPanel.innerHTML = \`
        <div class="zbp-panel-header">
          <div class="zbp-panel-title"><span>🔍</span><span>زوم حرفه‌ای صفحه</span></div>
          <button id="zbp-close-panel" class="zbp-close-btn" title="بستن پنل">✕</button>
        </div>
        <button id="zbp-toggle-draw" class="zbp-btn zbp-btn-primary">✏️ شروع انتخاب محدوده زوم</button>
        <div class="zbp-row">
          <span>میزان بزرگ‌نمایی:</span>
          <span id="zbp-level-val" style="color:#39FF14;font-weight:bold;">\${this.settings.zoomLevel}%</span>
        </div>
        <input type="range" id="zbp-zoom-slider" class="zbp-slider" min="125" max="500" step="25" value="\${this.settings.zoomLevel}">
        <div class="zbp-row" style="margin-top:10px;">
          <span>کلید میانبر:</span>
          <span class="zbp-kbd">Ctrl + Shift + \${this.settings.shortcutKey}</span>
        </div>
      \`;
      this.shadowRoot.appendChild(this.floatingPanel);

      this.statusBar = document.createElement('div');
      this.statusBar.id = 'zbp-status-bar';
      this.statusBar.innerHTML = \`
        <span style="color:#39FF14;font-weight:bold;">🔎 زوم فعال (<span id="zbp-bar-val">\${this.settings.zoomLevel}</span>%)</span>
        <button id="zbp-bar-dec" class="zbp-bar-btn" title="کاهش زوم">-</button>
        <button id="zbp-bar-inc" class="zbp-bar-btn" title="افزایش زوم">+</button>
        <button id="zbp-bar-reset" class="zbp-reset-btn">بازگشت نرم به حالت عادی</button>
      \`;
      this.shadowRoot.appendChild(this.statusBar);

      (document.documentElement || document.body).appendChild(this.rootContainer);
    }

    applyPanelValues() {
      if (!this.shadowRoot) return;
      const levelVal = this.shadowRoot.querySelector('#zbp-level-val');
      const slider = this.shadowRoot.querySelector('#zbp-zoom-slider');
      if (levelVal) levelVal.textContent = \`\${this.settings.zoomLevel}%\`;
      if (slider) slider.value = this.settings.zoomLevel;
    }

    bindListeners() {
      if (browserAPI && browserAPI.runtime && browserAPI.runtime.onMessage) {
        browserAPI.runtime.onMessage.addListener((req, sender, sendResponse) => {
          if (!req) return;
          if (req.action === 'toggleExtensionUI') this.togglePanel();
          if (req.action === 'startDrawingMode') this.startDrawingMode();
          if (req.action === 'resetZoom') this.zoomOutSmoothly();
          if (req.action === 'updateZoomLevel' && req.zoomLevel) {
            this.settings.zoomLevel = req.zoomLevel;
            this.applyPanelValues();
            if (this.isZoomed) this.updateZoomScale();
          }
          if (sendResponse) sendResponse({ success: true, isZoomed: this.isZoomed });
          return false;
        });
      }

      this.shadowRoot.querySelector('#zbp-close-panel').addEventListener('click', () => {
        this.floatingPanel.style.display = 'none';
      });

      const drawBtn = this.shadowRoot.querySelector('#zbp-toggle-draw');
      drawBtn.addEventListener('click', () => {
        if (this.isDrawingMode) this.cancelDrawing();
        else this.startDrawingMode();
      });

      const slider = this.shadowRoot.querySelector('#zbp-zoom-slider');
      slider.addEventListener('input', async (e) => {
        this.settings.zoomLevel = parseInt(e.target.value, 10);
        this.shadowRoot.querySelector('#zbp-level-val').textContent = \`\${this.settings.zoomLevel}%\`;
        await this.saveSettings();
        if (this.isZoomed) this.updateZoomScale();
      });

      this.shadowRoot.querySelector('#zbp-bar-dec').addEventListener('click', async () => {
        this.settings.zoomLevel = Math.max(100, this.settings.zoomLevel - 25);
        this.applyPanelValues();
        this.updateZoomScale();
        await this.saveSettings();
      });

      this.shadowRoot.querySelector('#zbp-bar-inc').addEventListener('click', async () => {
        this.settings.zoomLevel = Math.min(500, this.settings.zoomLevel + 25);
        this.applyPanelValues();
        this.updateZoomScale();
        await this.saveSettings();
      });

      this.shadowRoot.querySelector('#zbp-bar-reset').addEventListener('click', () => {
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
          if (this.isDrawingMode) this.cancelDrawing();
          else this.startDrawingMode();
        } else if (e.key === 'Escape') {
          if (this.isDrawingMode) this.cancelDrawing();
          else if (this.isZoomed) this.zoomOutSmoothly();
        }
      }, true);

      this.overlay.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        this.isDragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = \`\${this.startX}px\`;
        this.selectionBox.style.top = \`\${this.startY}px\`;
        this.selectionBox.style.width = '0px';
        this.selectionBox.style.height = '0px';
        e.preventDefault();
        e.stopPropagation();
      });

      window.addEventListener('mousemove', (e) => {
        if (!this.isDragging || !this.isDrawingMode) return;
        const currentX = Math.max(0, Math.min(window.innerWidth, e.clientX));
        const currentY = Math.max(0, Math.min(window.innerHeight, e.clientY));
        const left = Math.min(currentX, this.startX);
        const top = Math.min(currentY, this.startY);
        const width = Math.abs(currentX - this.startX);
        const height = Math.abs(currentY - this.startY);
        this.selectionBox.style.left = \`\${left}px\`;
        this.selectionBox.style.top = \`\${top}px\`;
        this.selectionBox.style.width = \`\${width}px\`;
        this.selectionBox.style.height = \`\${height}px\`;
        e.preventDefault();
      }, { passive: false });

      window.addEventListener('mouseup', (e) => {
        if (!this.isDragging || !this.isDrawingMode) return;
        this.isDragging = false;
        const rect = this.selectionBox.getBoundingClientRect();
        this.selectionBox.style.display = 'none';
        this.cancelDrawing();

        if (rect.width >= 15 && rect.height >= 15) {
          this.applyFullPageZoom(rect);
        } else {
          this.applyFullPageZoom({ left: this.startX - 60, top: this.startY - 60, width: 120, height: 120 });
        }
      });
    }

    togglePanel() {
      if (!this.floatingPanel) return;
      this.floatingPanel.style.display = this.floatingPanel.style.display === 'block' ? 'none' : 'block';
    }

    startDrawingMode() {
      this.isDrawingMode = true;
      if (this.overlay) this.overlay.style.display = 'block';
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
      this.lastOriginX = rect.left + rect.width / 2 + scrollX;
      this.lastOriginY = rect.top + rect.height / 2 + scrollY;

      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      target.style.transform = \`scale(\${scale})\`;
      if (this.statusBar) {
        this.statusBar.style.display = 'flex';
        const valEl = this.shadowRoot.querySelector('#zbp-bar-val');
        if (valEl) valEl.textContent = this.settings.zoomLevel;
      }
    }

    updateZoomScale() {
      if (!this.isZoomed) return;
      const scale = this.settings.zoomLevel / 100;
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transform = \`scale(\${scale})\`;
      if (this.statusBar) {
        const valEl = this.shadowRoot.querySelector('#zbp-bar-val');
        if (valEl) valEl.textContent = this.settings.zoomLevel;
      }
    }

    zoomOutSmoothly() {
      this.isZoomed = false;
      this.cancelDrawing();
      const target = document.body || document.documentElement;
      target.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
      target.style.transformOrigin = \`\${this.lastOriginX}px \${this.lastOriginY}px\`;
      target.style.transform = 'scale(1)';
      if (this.statusBar) this.statusBar.style.display = 'none';
      setTimeout(() => { if (!this.isZoomed) { target.style.transform = 'none'; target.style.transformOrigin = 'initial'; } }, 700);
    }
  }

  window.__ZOOM_BOX_PRO_INSTANCE__ = new ZoomBoxProController();
})();`,
    },
    background: {
      name: 'background.js',
      desc: 'Cross-Browser Background Script / Service Worker with webextension-polyfill',
      code: `// background.js - اسکریپت پس‌زمینه چندمرورگره با پشتیبانی کامل از webextension-polyfill
try {
  if (typeof importScripts === 'function') {
    importScripts('browser-polyfill.min.js');
  }
} catch (e) {}

const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

if (browserAPI && browserAPI.runtime && browserAPI.runtime.onInstalled) {
  browserAPI.runtime.onInstalled.addListener(async () => {
    try {
      if (browserAPI.storage && browserAPI.storage.sync) {
        await browserAPI.storage.sync.set({ zoomLevel: 200, shortcutKey: 'Z', extensionEnabled: true });
      }
    } catch (e) {}
  });
}

if (browserAPI && browserAPI.commands && browserAPI.commands.onCommand) {
  browserAPI.commands.onCommand.addListener(async (command) => {
    try {
      const tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      const activeTab = tabs && tabs[0];
      if (!activeTab || !activeTab.id) return;

      if (command === 'toggle-draw') {
        await browserAPI.tabs.sendMessage(activeTab.id, { action: 'startDrawingMode' });
      } else if (command === 'reset-zoom') {
        await browserAPI.tabs.sendMessage(activeTab.id, { action: 'resetZoom' });
      }
    } catch (err) {
      console.warn('Command error:', err);
    }
  });
}`,
    },
    readme: {
      name: 'README.md',
      desc: 'Extension Documentation & Shadow DOM Multi-Browser Guide',
      code: `# Zoom Box Pro (نسخه 8.6.0)
افزونه زوم تمام‌صفحه با کادر موس - مجهز به لایه ایزوله کامل CSS با Shadow DOM و webextension-polyfill

## ویژگی‌های نسخه 8.6.0:
- ایزولاسیون کامل CSS با Shadow DOM (عدم تداخل استایل‌های سایتهای مختلف با کنترل‌ها و دکمه‌ها)
- هماهنگی کامل بین تمام مرورگرها (Firefox, Chrome, Brave, Edge)
- یکپارچه‌سازی کامل Storage و Messaging به فرمت استاندارد Promise
- ترنزیشن تدریجی و کاملاً روان زوم بدون لرزش و پرش

## نصب در فایرفاکس (Firefox)
1. در نوار آدرس فایرفاکس بروید به: about:debugging#/runtime/this-firefox
2. دکمه Load Temporary Add-on را بزنید.
3. فایل manifest.json را انتخاب کنید.
4. وارد یک وبسایت عادی (مانند google.com یا wikipedia.org) شوید و روی آیکون افزونه کلیک کنید.

## نصب در گوگل کروم (Chrome / Brave / Edge)
1. در نوار آدرس وارد شوید به: chrome://extensions
2. گزینه Developer mode را روشن کنید.
3. روی Load unpacked کلیک کرده و پوشه افزونه را انتخاب کنید.`,
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
        folder.file('browser-polyfill.min.js', files.polyfill.code);
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
      a.download = 'zoom-box-pro-v8.6.0.zip';
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
                  Shadow DOM ایزوله
                </span>
                <span className="bg-sky-500/20 text-sky-400 text-[11px] font-mono px-2 py-0.5 rounded-full border border-sky-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  webextension-polyfill
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'fa' 
                  ? 'مجهز به لایه ایزوله کامل Shadow DOM برای جلوگیری ۱۰۰٪ از تداخل CSS صفحات وب و حفظ ظاهر پنل افزونه'
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
                روی سایتی مثل <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">google.com</code> تست کنید (فایرفاکس اجرای اسکریپت در صفحات سیستمی خود را مسدود می‌کند).
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
            {(['content', 'manifest', 'polyfill', 'popupHtml', 'popupJs', 'background', 'readme'] as const).map((key) => (
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
