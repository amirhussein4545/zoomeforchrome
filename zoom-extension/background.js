// background.js - سرویس ورکر برای مدیریت افزونه با قابلیت‌های پیشرفته
// نسخه 3.0.0 - با پشتیبانی از شورت‌کات‌های داخلی

// ذخیره تنظیمات پیش‌فرض
const defaultSettings = {
  zoomLevel: 2,
  boxColor: '#39FF14', // سبز فسفری
  overlayColor: 'rgba(0, 0, 0, 0.3)',
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

// مدیریت کلیک روی آیکون افزونه - باز کردن پاپ‌آپ
chrome.action.onClicked.addListener((tab) => {
  // این هندلر فقط زمانی اجرا می‌شود که popup.html وجود نداشته باشد
  // اما ما popup.html داریم، بنابراین این بخش برای سازگاری نگه داشته شده
  console.log('Zoom Box extension clicked');
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
  
  if (request.action === 'broadcastToTabs') {
    // ارسال پیام به تمام تب‌های فعال
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, request.message).catch(() => {});
      });
    });
  }
});
