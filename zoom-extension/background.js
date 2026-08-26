// background.js - سرویس ورکر برای مدیریت افزونه

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['content.js']
  });
});

// گوش دادن به پیام‌ها از content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'zoomArea') {
    console.log('ناحیه زوم:', request.area);
  }
});
