// popup.js - کنترلر پنجره پاپ‌آپ افزونه Zoom Box Pro
document.addEventListener('DOMContentLoaded', async () => {
  const browserAPI = (typeof browser !== 'undefined' && browser.runtime) ? browser : (typeof chrome !== 'undefined' ? chrome : null);

  const btnDraw = document.getElementById('btn-draw');
  const btnDrawText = document.getElementById('btn-draw-text');
  const btnReset = document.getElementById('btn-reset');
  const btnCollapse = document.getElementById('btn-collapse');
  const zoomSlider = document.getElementById('zoom-slider');
  const zoomBadge = document.getElementById('zoom-badge');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const colorPreview = document.getElementById('color-preview');
  const colorInput = document.getElementById('color-input');
  const hexLabel = document.getElementById('hex-label');
  const opacitySlider = document.getElementById('opacity-slider');
  const opacityVal = document.getElementById('opacity-val');
  const chkCtrl = document.getElementById('chk-ctrl');
  const chkShift = document.getElementById('chk-shift');
  const chkAlt = document.getElementById('chk-alt');
  const keyDropdown = document.getElementById('key-dropdown');
  const shortcutDisplay = document.getElementById('shortcut-display');
  const footerText = document.getElementById('footer-text');
  const chkLens = document.getElementById('chk-lens');
  const rowLens = document.getElementById('row-lens');

  let state = {
    zoomLevel: 200,
    boxColor: '#39FF14',
    opacity: 50,
    shortcutCtrl: true,
    shortcutShift: true,
    shortcutAlt: false,
    shortcutKey: 'Z',
    lensMode: false
  };

  function updateShortcutUI() {
    const parts = [];
    if (state.shortcutCtrl) parts.push('Ctrl');
    if (state.shortcutShift) parts.push('Shift');
    if (state.shortcutAlt) parts.push('Alt');
    parts.push(state.shortcutKey || 'Z');
    const text = parts.join(' + ');
    if (shortcutDisplay) shortcutDisplay.textContent = text;
    if (footerText) footerText.textContent = `میانبر فعال: ${text} / Esc`;

    if (chkCtrl) {
      chkCtrl.className = `mod-checkbox ${state.shortcutCtrl ? 'checked' : ''}`;
      chkCtrl.textContent = state.shortcutCtrl ? '✓' : '';
    }
    if (chkShift) {
      chkShift.className = `mod-checkbox ${state.shortcutShift ? 'checked' : ''}`;
      chkShift.textContent = state.shortcutShift ? '✓' : '';
    }
    if (chkAlt) {
      chkAlt.className = `mod-checkbox ${state.shortcutAlt ? 'checked' : ''}`;
      chkAlt.textContent = state.shortcutAlt ? '✓' : '';
    }
  }

  function updatePresetsUI() {
    presetBtns.forEach(btn => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      if (val === state.zoomLevel) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  try {
    if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
      const data = await browserAPI.storage.local.get(null);
      if (data && data.zoomLevel !== undefined) {
        state = { ...state, ...data };
      }
    }
  } catch (e) {
    console.warn("ZBP Storage load error:", e);
  }

  if (zoomSlider) zoomSlider.value = state.zoomLevel;
  if (zoomBadge) zoomBadge.textContent = `${state.zoomLevel}%`;
  if (colorPreview) colorPreview.style.backgroundColor = state.boxColor;
  if (colorInput) colorInput.value = state.boxColor;
  if (hexLabel) hexLabel.textContent = state.boxColor;
  if (opacitySlider) opacitySlider.value = state.opacity;
  if (opacityVal) opacityVal.textContent = `${state.opacity}%`;
  if (keyDropdown) keyDropdown.value = state.shortcutKey || 'Z';

  if (chkLens) {
    chkLens.className = `mod-checkbox ${state.lensMode ? 'checked' : ''}`;
    chkLens.textContent = state.lensMode ? '✓' : '';
  }

  updateShortcutUI();
  updatePresetsUI();

  async function getActiveTab() {
    if (!browserAPI || !browserAPI.tabs) return null;
    try {
      let tabs = await browserAPI.tabs.query({ active: true, currentWindow: true });
      if (tabs && tabs.length > 0) {
        return tabs[0];
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

    const url = tab.url || '';
    const isRestricted = (
      url.startsWith('chrome://') ||
      url.startsWith('about:') ||
      url.startsWith('moz-extension://') ||
      url.startsWith('chrome-extension://') ||
      url.startsWith('edge://') ||
      url.includes('addons.mozilla.org') ||
      url.includes('chromewebstore.google.com')
    );

    const notice = document.getElementById('restricted-notice');
    if (isRestricted) {
      // اخطار «صفحه سیستمی» فقط برای اقدامات تعاملی صفحه (رسم کادر) معنا دارد؛
      // ذخیره تنظیمات روی هر صفحه‌ای باید بدون اخطار انجام شود.
      if (message.action === 'startDrawingMode') {
        if (notice) notice.style.display = 'block';
        if (btnDrawText) btnDrawText.textContent = 'غیرفعال در صفحه سیستمی';
      }
      return;
    } else {
      if (notice) notice.style.display = 'none';
    }

    try {
      await browserAPI.tabs.sendMessage(tab.id, message);
      if (autoClose) {
        setTimeout(() => window.close(), 120);
      }
    } catch (err) {
      try {
        if (browserAPI.scripting && browserAPI.scripting.executeScript) {
          await browserAPI.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['content.js']
          });
        }
        await new Promise(r => setTimeout(r, 200));
        await browserAPI.tabs.sendMessage(tab.id, message);
        if (autoClose) {
          setTimeout(() => window.close(), 120);
        }
      } catch (injErr) {
        console.error("ZBP Injection failed:", injErr);
      }
    }
  }

  async function saveSettings() {
    try {
      if (browserAPI && browserAPI.storage && browserAPI.storage.local) {
        await browserAPI.storage.local.set(state);
      }
    } catch (e) {}
    sendMessageToTab({ action: 'updateSettings', settings: state }, false);
  }

  if (btnCollapse) {
    btnCollapse.addEventListener('click', () => {
      window.close();
    });
  }

  if (btnDraw) {
    btnDraw.addEventListener('click', () => {
      if (btnDrawText) btnDrawText.textContent = 'در حال انتخاب...';
      sendMessageToTab({ action: 'startDrawingMode' }, true);
    });
  }

  if (btnReset) {
    btnReset.addEventListener('click', () => {
      state.zoomLevel = 100;
      if (zoomSlider) zoomSlider.value = 100;
      if (zoomBadge) zoomBadge.textContent = '100%';
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'resetZoom' }, false);
    });
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.getAttribute('data-val'), 10);
      state.zoomLevel = val;
      if (zoomSlider) zoomSlider.value = val;
      if (zoomBadge) zoomBadge.textContent = `${val}%`;
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'updateZoomLevel', zoomLevel: val }, false);
    });
  });

  if (zoomSlider) {
    zoomSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.zoomLevel = val;
      if (zoomBadge) zoomBadge.textContent = `${val}%`;
      updatePresetsUI();
      saveSettings();
      sendMessageToTab({ action: 'updateZoomLevel', zoomLevel: val }, false);
    });
  }

  if (colorPreview && colorInput) {
    colorPreview.addEventListener('click', () => colorInput.click());
    colorInput.addEventListener('input', (e) => {
      state.boxColor = e.target.value;
      colorPreview.style.backgroundColor = state.boxColor;
      if (hexLabel) hexLabel.textContent = state.boxColor;
      saveSettings();
    });
  }

  if (opacitySlider) {
    opacitySlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      state.opacity = val;
      if (opacityVal) opacityVal.textContent = `${val}%`;
      saveSettings();
    });
  }

  const modCtrl = document.getElementById('mod-ctrl');
  if (modCtrl) {
    modCtrl.addEventListener('click', () => {
      state.shortcutCtrl = !state.shortcutCtrl;
      updateShortcutUI();
      saveSettings();
    });
  }

  const modShift = document.getElementById('mod-shift');
  if (modShift) {
    modShift.addEventListener('click', () => {
      state.shortcutShift = !state.shortcutShift;
      updateShortcutUI();
      saveSettings();
    });
  }

  const modAlt = document.getElementById('mod-alt');
  if (modAlt) {
    modAlt.addEventListener('click', () => {
      state.shortcutAlt = !state.shortcutAlt;
      updateShortcutUI();
      saveSettings();
    });
  }

  if (keyDropdown) {
    keyDropdown.addEventListener('change', (e) => {
      state.shortcutKey = e.target.value;
      updateShortcutUI();
      saveSettings();
    });
  }

  const toggleLens = () => {
    state.lensMode = !state.lensMode;
    if (chkLens) {
      chkLens.className = `mod-checkbox ${state.lensMode ? 'checked' : ''}`;
      chkLens.textContent = state.lensMode ? '✓' : '';
    }
    saveSettings();
  };

  if (rowLens) {
    rowLens.addEventListener('click', toggleLens);
  } else if (chkLens) {
    chkLens.addEventListener('click', toggleLens);
  }
});
