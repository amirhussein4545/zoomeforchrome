// popup.js - مدیریت پنل کنترل افزونه Zoom Box Pro
// نسخه 4.0.0 - با قابلیت تنظیم شورت‌کات‌ها از داخل پنل

document.addEventListener('DOMContentLoaded', () => {
  // دریافت المان‌ها
  const toggleShortcutInput = document.getElementById('toggle-shortcut-input');
  const resetShortcutInput = document.getElementById('reset-shortcut-input');
  const saveShortcutsBtn = document.getElementById('save-shortcuts-btn');
  const resetShortcutsBtn = document.getElementById('reset-shortcuts-btn');
  const statusMessage = document.getElementById('status-message');
  const currentToggleShortcut = document.getElementById('current-toggle-shortcut');
  const currentResetShortcut = document.getElementById('current-reset-shortcut');
  const displayToggleShortcut = document.getElementById('toggle-shortcut-display');
  const displayResetShortcut = document.getElementById('reset-shortcut-display');
  
  // بارگذاری تنظیمات ذخیره شده
  loadSettings();
  
  // تابع بارگذاری تنظیمات
  function loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.settings) {
        const settings = response.settings;
        
        // پر کردن فیلدها با مقادیر ذخیره شده
        toggleShortcutInput.value = settings.toggleShortcut || 'Ctrl+Shift+Z';
        resetShortcutInput.value = settings.resetShortcut || 'Ctrl+Shift+R';
        
        // نمایش شورت‌کات‌های فعلی
        if (currentToggleShortcut) {
          currentToggleShortcut.textContent = settings.toggleShortcut || 'Ctrl+Shift+Z';
        }
        if (currentResetShortcut) {
          currentResetShortcut.textContent = settings.resetShortcut || 'Ctrl+Shift+R';
        }
        if (displayToggleShortcut) {
          displayToggleShortcut.textContent = settings.toggleShortcut || 'Ctrl+Shift+Z';
        }
        if (displayResetShortcut) {
          displayResetShortcut.textContent = settings.resetShortcut || 'Ctrl+Shift+R';
        }
      }
    });
  }
  
  // ذخیره شورت‌کات‌ها
  saveShortcutsBtn.addEventListener('click', () => {
    const toggleShortcut = toggleShortcutInput.value.trim();
    const resetShortcut = resetShortcutInput.value.trim();
    
    // اعتبارسنجی شورت‌کات‌ها
    if (!validateShortcut(toggleShortcut)) {
      showStatus('❌ فرمت شورت‌کات فعال/غیرفعال معتبر نیست', 'error');
      return;
    }
    
    if (!validateShortcut(resetShortcut)) {
      showStatus('❌ فرمت شورت‌کات بازنشانی معتبر نیست', 'error');
      return;
    }
    
    // جلوگیری از یکسان بودن شورت‌کات‌ها
    if (toggleShortcut.toUpperCase() === resetShortcut.toUpperCase()) {
      showStatus('❌ شورت‌کات‌ها نمی‌توانند یکسان باشند', 'error');
      return;
    }
    
    // ذخیره تنظیمات جدید
    chrome.runtime.sendMessage({ 
      action: 'updateShortcuts',
      shortcuts: {
        toggleShortcut,
        resetShortcut
      }
    }, (response) => {
      if (response && response.success) {
        showStatus('✅ شورت‌کات‌ها با موفقیت ذخیره شدند!', 'success');
        
        // به‌روزرسانی نمایش شورت‌کات‌های فعلی
        if (currentToggleShortcut) {
          currentToggleShortcut.textContent = toggleShortcut;
        }
        if (currentResetShortcut) {
          currentResetShortcut.textContent = resetShortcut;
        }
        if (displayToggleShortcut) {
          displayToggleShortcut.textContent = toggleShortcut;
        }
        if (displayResetShortcut) {
          displayResetShortcut.textContent = resetShortcut;
        }
        
        // ارسال پیام به content script برای اعمال تغییرات
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'applyShortcuts',
              shortcuts: { toggleShortcut, resetShortcut }
            }).catch(() => {});
          }
        });
      } else {
        showStatus('❌ خطا در ذخیره شورت‌کات‌ها', 'error');
      }
    });
  });
  
  // بازنشانی شورت‌کات‌ها به پیش‌فرض
  resetShortcutsBtn.addEventListener('click', () => {
    toggleShortcutInput.value = 'Ctrl+Shift+Z';
    resetShortcutInput.value = 'Ctrl+Shift+R';
    
    chrome.runtime.sendMessage({ 
      action: 'resetShortcuts'
    }, (response) => {
      if (response && response.success) {
        showStatus('🔄 شورت‌کات‌ها به حالت پیش‌فرض بازگشتند', 'success');
        
        // به‌روزرسانی نمایش
        if (currentToggleShortcut) {
          currentToggleShortcut.textContent = 'Ctrl+Shift+Z';
        }
        if (currentResetShortcut) {
          currentResetShortcut.textContent = 'Ctrl+Shift+R';
        }
        if (displayToggleShortcut) {
          displayToggleShortcut.textContent = 'Ctrl+Shift+Z';
        }
        if (displayResetShortcut) {
          displayResetShortcut.textContent = 'Ctrl+Shift+R';
        }
        
        // ارسال پیام به content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'applyShortcuts',
              shortcuts: {
                toggleShortcut: 'Ctrl+Shift+Z',
                resetShortcut: 'Ctrl+Shift+R'
              }
            }).catch(() => {});
          }
        });
      }
    });
  });
  
  // تابع اعتبارسنجی شورت‌کات
  function validateShortcut(shortcut) {
    if (!shortcut || shortcut.trim() === '') {
      return false;
    }
    
    // الگوی ساده برای اعتبارسنجی شورت‌کات
    // باید حداقل شامل یک کلید باشد و می‌تواند شامل Ctrl، Shift، Alt باشد
    const validKeys = /^(Ctrl\+)?(Shift\+)?(Alt\+)?[A-Z0-9]$/i;
    const validCombo = /^(Ctrl\+Shift\+[A-Z0-9]|Ctrl\+Alt\+[A-Z0-9]|Shift\+Alt\+[A-Z0-9]|Ctrl\+Shift\+Alt\+[A-Z0-9]|[A-Z0-9])$/i;
    
    return validKeys.test(shortcut) || validCombo.test(shortcut);
  }
  
  // نمایش پیام وضعیت
  function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
      statusMessage.className = 'status-message';
    }, 3000);
  }
});
