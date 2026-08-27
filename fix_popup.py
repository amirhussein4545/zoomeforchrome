import re

with open('src/components/ExtensionViewer.tsx', 'r') as f:
    content = f.read()

# Replace getActiveTab and sendMessageToTab in popupJs code
old_code = """  async function getActiveTab() {
    if (!browserAPI || !browserAPI.tabs) return null;
    try {
      let tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        const isExtension = tabs[0].url && (tabs[0].url.startsWith('chrome-extension://') || tabs[0].url.startsWith('moz-extension://'));
        if (!isExtension) return tabs[0];
      }
      const fallback = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      return fallback && fallback[0] ? fallback[0] : (tabs && tabs.length > 0 ? tabs[0] : null);
    } catch (e) {
      return null;
    }
  }

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
            files: ['content.js']
          });
        }
        await new Promise(r => setTimeout(r, 120));
        await browserAPI.tabs.sendMessage(tab.id, message);
      } catch (injErr) {}
    }
    if (autoClose) {
      setTimeout(() => window.close(), 60);
    }
  }"""

new_code = """  async function getActiveTab() {
    if (!browserAPI || !browserAPI.tabs) return null;
    try {
      let tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        const isExtension = tabs[0].url && (tabs[0].url.startsWith('chrome-extension://') || tabs[0].url.startsWith('moz-extension://'));
        if (!isExtension) return tabs[0];
      }
      const fallback = await browserAPI.tabs.query({ active: true, lastFocusedWindow: true });
      return fallback && fallback[0] ? fallback[0] : (tabs && tabs.length > 0 ? tabs[0] : null);
    } catch (e) {
      return null;
    }
  }

  async function sendMessageToTab(message, autoClose = false) {
    const tab = await getActiveTab();
    if (!tab || !tab.id) return;

    const isRestricted = tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('about:') || tab.url.startsWith('moz-extension://') || tab.url.startsWith('edge://') || tab.url.includes('addons.mozilla.org'));
    const notice = document.getElementById('restricted-notice');
    if (isRestricted) {
      if (notice) notice.style.display = 'block';
      const btnDrawText = document.getElementById('btn-draw-text');
      if (btnDrawText && message.action === 'startDrawingMode') btnDrawText.textContent = 'غیرفعال در این صفحه';
      return;
    } else {
      if (notice) notice.style.display = 'none';
    }

    try {
      await browserAPI.tabs.sendMessage(tab.id, message);
    } catch (err) {
      try {
        if (browserAPI.scripting && browserAPI.scripting.executeScript) {
          await browserAPI.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }
        await new Promise(r => setTimeout(r, 250));
        await browserAPI.tabs.sendMessage(tab.id, message);
      } catch (injErr) {
        console.error("ZBP Injection failed:", injErr);
      }
    }
    if (autoClose) {
      setTimeout(() => window.close(), 60);
    }
  }"""

content = content.replace(old_code, new_code)

old_get = """  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      const data = await browserAPI.storage.local.get(state);
      if (data) state = { ...state, ...data };
    }
  } catch (e) {}"""

new_get = """  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      const data = await browserAPI.storage.local.get(null);
      if (data && data.zoomLevel !== undefined) state = { ...state, ...data };
    }
  } catch (e) {
    console.error("ZBP Storage load error:", e);
  }"""

content = content.replace(old_get, new_get)

# Also fix the `loadSettings` in content.js to use `get(null)` instead of `get(this.settings)`
old_content_get = """    async loadSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
          const stored = await browserAPI.storage.local.get(this.settings);
          if (stored) {
            this.settings = { ...this.settings, ...stored };
            this.applyPanelValues();
          }
        }
      } catch (e) {
        console.warn('ZBP storage load fallback:', e);
      }
    }"""

new_content_get = """    async loadSettings() {
      try {
        if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
          const stored = await browserAPI.storage.local.get(null);
          if (stored && stored.zoomLevel !== undefined) {
            this.settings = { ...this.settings, ...stored };
            this.applyPanelValues();
          }
        }
      } catch (e) {
        console.warn('ZBP storage load fallback:', e);
      }
    }"""

content = content.replace(old_content_get, new_content_get)

with open('src/components/ExtensionViewer.tsx', 'w') as f:
    f.write(content)
print("done")
