// background.js - سرویس ورکر برای مدیریت افزونه با قابلیت‌های پیشرفته
// نسخه 5.0.0 - با پشتیبانی از پنل تنظیمات جمع‌شونده و کنترل شفافیت پس‌زمینه

// ذخیره تنظیمات پیش‌فرض
const defaultSettings = {
  zoomLevel: 2,
  boxColor: '#39FF14', // سبز فسفری
  overlayColor: 'rgba(0, 0, 0, 0.7)', // پس‌زمینه تیره‌تر هنگام زوم
  shortcutEnabled: true,
  animationDuration: 0.3,
  toggleShortcut: 'Ctrl+Shift+Z',
  resetShortcut: 'Ctrl+Shift+R'
};

// بارگذاری تنظیمات هنگام شروع
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(['settings'], (result) => {
    if (!result.settings) {
      chrome.storage.sync.set({ settings: defaultSettings });
    }
  });
});

// گوش دادن به پیام‌ها از content script و popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'zoomArea') {
    console.log('ناحیه زوم:', request.area);
  }
  
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || defaultSettings;
      sendResponse({ settings });
    });
    return true; // برای پاسخ ناهمگام
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.sync.set({ settings: request.settings }, () => {
      // ارسال تنظیمات جدید به تمام تب‌های فعال
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'applySettings', 
            settings: request.settings 
          }).catch(() => {});
        }
      });
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'resetSettings') {
    const settingsToReset = request.settings || defaultSettings;
    chrome.storage.sync.set({ settings: settingsToReset }, () => {
      // ارسال تنظیمات جدید به تمام تب‌های فعال
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: 'applySettings', 
            settings: settingsToReset 
          }).catch(() => {});
        }
      });
      sendResponse({ success: true, settings: settingsToReset });
    });
    return true;
  }
  
  // به‌روزرسانی شورت‌کات‌ها از پنل
  if (request.action === 'updateShortcuts') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || defaultSettings;
      const newSettings = {
        ...settings,
        toggleShortcut: request.shortcuts.toggleShortcut,
        resetShortcut: request.shortcuts.resetShortcut
      };
      
      chrome.storage.sync.set({ settings: newSettings }, () => {
        // ارسال به تمام تب‌ها
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'applyShortcuts',
              shortcuts: request.shortcuts
            }).catch(() => {});
          });
        });
        sendResponse({ success: true, settings: newSettings });
      });
    });
    return true;
  }
  
  // بازنشانی شورت‌کات‌ها
  if (request.action === 'resetShortcuts') {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || defaultSettings;
      const newSettings = {
        ...settings,
        toggleShortcut: 'Ctrl+Shift+Z',
        resetShortcut: 'Ctrl+Shift+R'
      };
      
      chrome.storage.sync.set({ settings: newSettings }, () => {
        // ارسال به تمام تب‌ها
        chrome.tabs.query({}, (tabs) => {
          tabs.forEach(tab => {
            chrome.tabs.sendMessage(tab.id, {
              action: 'applyShortcuts',
              shortcuts: {
                toggleShortcut: 'Ctrl+Shift+Z',
                resetShortcut: 'Ctrl+Shift+R'
              }
            }).catch(() => {});
          });
        });
        sendResponse({ success: true, settings: newSettings });
      });
    });
    return true;
  }
  
  if (request.action === 'broadcastToTabs') {
    // ارسال پیام به تمام تب‌های فعال
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, request.message).catch(() => {});
      });
    });
  }
});
