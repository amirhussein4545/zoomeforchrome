// background.js - سرویس ورکر برای مدیریت تنظیمات افزونه زوم
// نسخه 6.0.0

const DEFAULT_SETTINGS = {
  zoomLevel: 2,
  boxColor: '#39FF14',
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  shortcutEnabled: true,
  animationDuration: 0.3,
  toggleShortcut: 'Ctrl+Shift+Z',
  resetShortcut: 'Ctrl+Shift+R'
};

// بارگذاری تنظیمات اولیه
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
    }
  });
});

// گوش دادن به پیام‌ها از content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['settings'], (result) => {
      sendResponse({ 
        success: true, 
        settings: result.settings || DEFAULT_SETTINGS 
      });
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      sendResponse({ success: true });
      
      // ارسال تنظیمات جدید به تمام تب‌ها
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'applySettings',
            settings: request.settings
          }).catch(() => {});
        });
      });
    });
    return true;
  }
  
  if (request.action === 'resetSettings') {
    chrome.storage.sync.set({ settings: DEFAULT_SETTINGS }, () => {
      sendResponse({ success: true });
      
      // ارسال تنظیمات پیش‌فرض به تمام تب‌ها
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'applySettings',
            settings: DEFAULT_SETTINGS
          }).catch(() => {});
        });
      });
    });
    return true;
  }
  
  if (request.action === 'zoomArea') {
    console.log('Zoom area:', request.area);
    sendResponse({ success: true });
    return true;
  }
});
