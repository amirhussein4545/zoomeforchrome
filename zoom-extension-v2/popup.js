// popup.js - مدیریت پنل پاپ‌آپ افزونه

document.addEventListener('DOMContentLoaded', async () => {
  // المان‌ها
  const zoomLevelDisplay = document.getElementById('zoomLevelDisplay');
  const zoomOutBtn = document.getElementById('zoomOutBtn');
  const zoomInBtn = document.getElementById('zoomInBtn');
  const resetZoomBtn = document.getElementById('resetZoomBtn');
  const manualZoomInput = document.getElementById('manualZoomInput');
  const applyZoomBtn = document.getElementById('applyZoomBtn');
  const bgColorPicker = document.getElementById('bgColorPicker');
  const opacitySlider = document.getElementById('opacitySlider');
  const opacityValue = document.getElementById('opacityValue');
  const panelToggle = document.getElementById('panelToggle');
  const enableZoom = document.getElementById('enableZoom');
  const disableExtensionBtn = document.getElementById('disableExtensionBtn');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // بارگذاری تنظیمات ذخیره شده
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        'zoomLevel',
        'bgColor',
        'opacity',
        'showPanel',
        'extensionEnabled'
      ]);

      const zoomLevel = result.zoomLevel || 100;
      const bgColor = result.bgColor || '#000000';
      const opacity = result.opacity || 70;
      const showPanel = result.showPanel !== false;
      const extensionEnabled = result.extensionEnabled !== false;

      // به‌روزرسانی UI
      zoomLevelDisplay.textContent = `${zoomLevel}%`;
      manualZoomInput.value = zoomLevel;
      bgColorPicker.value = bgColor;
      opacitySlider.value = opacity;
      opacityValue.textContent = `${opacity}%`;
      panelToggle.checked = showPanel;
      enableZoom.checked = extensionEnabled;

      // به‌روزرسانی وضعیت
      updateStatus(extensionEnabled);

      // ارسال تنظیمات به تب فعال
      sendSettingsToActiveTab({
        zoomLevel,
        bgColor,
        opacity,
        showPanel,
        extensionEnabled
      });

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // به‌روزرسانی وضعیت
  function updateStatus(enabled) {
    if (enabled) {
      statusDot.classList.remove('inactive');
      statusText.textContent = 'افزونه فعال است';
    } else {
      statusDot.classList.add('inactive');
      statusText.textContent = 'افزونه غیرفعال است';
    }
  }

  // ارسال تنظیمات به تب فعال
  async function sendSettingsToActiveTab(settings) {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, {
          action: 'updateSettings',
          settings: settings
        });
      }
    } catch (error) {
      // تب ممکن است هنوز لود نشده باشد یا پیام‌رسان آماده نباشد
      console.log('Could not send to tab, will retry on next interaction');
    }
  }

  // ذخیره تنظیمات
  async function saveSettings(settings) {
    try {
      await chrome.storage.sync.set(settings);
      await sendSettingsToActiveTab(settings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // رویداد کاهش زوم
  zoomOutBtn.addEventListener('click', async () => {
    const currentZoom = parseInt(manualZoomInput.value) || 100;
    const newZoom = Math.max(50, currentZoom - 25);
    manualZoomInput.value = newZoom;
    zoomLevelDisplay.textContent = `${newZoom}%`;
    
    await saveSettings({ 
      zoomLevel: newZoom,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد افزایش زوم
  zoomInBtn.addEventListener('click', async () => {
    const currentZoom = parseInt(manualZoomInput.value) || 100;
    const newZoom = Math.min(500, currentZoom + 25);
    manualZoomInput.value = newZoom;
    zoomLevelDisplay.textContent = `${newZoom}%`;
    
    await saveSettings({ 
      zoomLevel: newZoom,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد بازگشت به 100%
  resetZoomBtn.addEventListener('click', async () => {
    manualZoomInput.value = 100;
    zoomLevelDisplay.textContent = '100%';
    
    await saveSettings({ 
      zoomLevel: 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد اعمال زوم دستی
  applyZoomBtn.addEventListener('click', async () => {
    let zoomValue = parseInt(manualZoomInput.value);
    if (isNaN(zoomValue) || zoomValue < 50) zoomValue = 50;
    if (zoomValue > 500) zoomValue = 500;
    
    manualZoomInput.value = zoomValue;
    zoomLevelDisplay.textContent = `${zoomValue}%`;
    
    await saveSettings({ 
      zoomLevel: zoomValue,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد تغییر رنگ پس‌زمینه
  bgColorPicker.addEventListener('input', async () => {
    await saveSettings({ 
      zoomLevel: parseInt(manualZoomInput.value) || 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد تغییر شفافیت
  opacitySlider.addEventListener('input', () => {
    opacityValue.textContent = `${opacitySlider.value}%`;
  });

  opacitySlider.addEventListener('change', async () => {
    await saveSettings({ 
      zoomLevel: parseInt(manualZoomInput.value) || 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد تغییر نمایش پنل
  panelToggle.addEventListener('change', async () => {
    await saveSettings({ 
      zoomLevel: parseInt(manualZoomInput.value) || 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: enableZoom.checked
    });
  });

  // رویداد تغییر فعال‌سازی زوم
  enableZoom.addEventListener('change', async () => {
    const isEnabled = enableZoom.checked;
    updateStatus(isEnabled);
    
    await saveSettings({ 
      zoomLevel: parseInt(manualZoomInput.value) || 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: isEnabled
    });
  });

  // رویداد غیرفعال کردن موقت افزونه
  disableExtensionBtn.addEventListener('click', async () => {
    enableZoom.checked = false;
    updateStatus(false);
    
    await saveSettings({ 
      zoomLevel: parseInt(manualZoomInput.value) || 100,
      bgColor: bgColorPicker.value,
      opacity: parseInt(opacitySlider.value),
      showPanel: panelToggle.checked,
      extensionEnabled: false
    });
  });

  // بارگذاری اولیه تنظیمات
  await loadSettings();
});
