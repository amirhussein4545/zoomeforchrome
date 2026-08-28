// background.js - اسکریپت پس‌زمینه پایدار سازگار با موزیلا فایرفاکس و گوگل کروم (MV3)
const browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

if (browserAPI && browserAPI.runtime && browserAPI.runtime.onInstalled) {
  browserAPI.runtime.onInstalled.addListener(async () => {
    const initialSettings = {
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
    try {
      if (browserAPI.storage && browserAPI.storage.local) {
        const existing = await browserAPI.storage.local.get(null);
        if (!existing || existing.zoomLevel === undefined) {
          await browserAPI.storage.local.set(initialSettings);
        }
      }
    } catch (e) {
      console.warn("ZBP Background onInstalled storage error:", e);
    }
  });
}

async function sendActionToActiveTab(actionName) {
  if (!browserAPI || !browserAPI.tabs) return;
  try {
    let tabs = [];
    try {
      tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
    } catch (e) {
      tabs = await browserAPI.tabs.query({ active: true });
    }
    const activeTab = tabs && tabs[0];
    if (!activeTab || !activeTab.id) return;

    // Guard against restricted URLs where content scripts cannot run
    const url = activeTab.url || '';
    if (
      url.startsWith('chrome://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.includes('addons.mozilla.org') ||
      url.includes('chromewebstore.google.com')
    ) {
      return;
    }

    try {
      await browserAPI.tabs.sendMessage(activeTab.id, { action: actionName });
    } catch (msgErr) {
      if (browserAPI.scripting && browserAPI.scripting.executeScript) {
        try {
          await browserAPI.scripting.executeScript({
            target: { tabId: activeTab.id },
            files: ['content.js']
          });
          await new Promise(r => setTimeout(r, 150));
          await browserAPI.tabs.sendMessage(activeTab.id, { action: actionName });
        } catch (injErr) {
          console.warn("ZBP Script injection skipped:", injErr);
        }
      }
    }
  } catch (err) {
    console.warn("ZBP Background sendAction error:", err);
  }
}

if (browserAPI && browserAPI.commands && browserAPI.commands.onCommand) {
  browserAPI.commands.onCommand.addListener((command) => {
    if (command === 'toggle-draw') {
      sendActionToActiveTab('startDrawingMode');
    } else if (command === 'reset-zoom') {
      sendActionToActiveTab('resetZoom');
    }
  });
}
