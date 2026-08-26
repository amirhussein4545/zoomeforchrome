// background.js - سرویس ورکر برای مدیریت افزونه
// نسخه 7.0.0 - پشتیبانی از پاپ‌آپ و ارتباط دوطرفه

// نصب اولیه - تنظیم مقادیر پیش‌فرض
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

// گوش دادن به پیام‌ها از popup و content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get([
      'zoomLevel',
      'bgColor',
      'opacity',
      'showPanel',
      'extensionEnabled'
    ], (result) => {
      sendResponse({ settings: result });
    });
    return true; // برای پاسخ ناهمگام
  }
  
  if (request.action === 'updateSettings') {
    chrome.storage.sync.set(request.settings, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'broadcastToTabs') {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, request.message).catch(() => {});
      });
      sendResponse({ success: true });
    });
    return true;
  }
  
  return true;
});
