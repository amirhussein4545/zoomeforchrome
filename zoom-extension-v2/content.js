// content.js - اسکریپت اصلی برای ایجاد قابلیت زوم با کشیدن کادر با قابلیت‌های شخصی‌سازی
// نسخه 6.0.0 - بدون نیاز به رفرش، با امکان اسکرول و کنترل کامل از پنل

class ZoomBox {
  constructor() {
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.box = null;
    this.isActive = false;
    this.zoomLevel = 2;
    this.isPanelOpen = true;
    this.currentZoomLeft = 0;
    this.currentZoomTop = 0;
    this.currentZoomWidth = 0;
    this.currentZoomHeight = 0;
    this.settings = {
      zoomLevel: 2,
      boxColor: '#39FF14',
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      shortcutEnabled: true,
      animationDuration: 0.3,
      toggleShortcut: 'Ctrl+Shift+Z',
      resetShortcut: 'Ctrl+Shift+R'
    };
    
    // تزریق استایل‌ها
    this.injectStyles();
    this.init();
  }

  injectStyles() {
    if (document.getElementById('zoom-extension-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'zoom-extension-styles';
    style.textContent = `
      #zoom-box-container {
        all: initial;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      
      .zoom-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.7);
        pointer-events: none;
        z-index: 2147483646;
        display: none;
      }
      
      .zoom-selection-box {
        position: fixed;
        border: 3px solid #39FF14;
        background-color: rgba(57, 255, 20, 0.2);
        box-shadow: 0 0 20px rgba(57, 255, 20, 0.8);
        z-index: 2147483647;
        pointer-events: none;
        display: none;
        transition: all 0.1s ease;
      }
      
      .zoom-controls {
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #39FF14 100%);
        padding: 15px;
        border-radius: 12px;
        box-shadow: 0 10px 40px rgba(57, 255, 20, 0.4);
        z-index: 2147483647;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-width: 220px;
        backdrop-filter: blur(10px);
        border: 2px solid #39FF14;
        max-height: 90vh;
        overflow-y: auto;
        transition: all 0.3s ease;
      }
      
      .zoom-controls.collapsed {
        min-width: auto;
        padding: 10px;
      }
      
      .zoom-controls-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 5px;
      }
      
      .zoom-btn-small {
        padding: 5px 10px;
        border: 2px solid #87CEEB;
        border-radius: 6px;
        background: #000000;
        color: #39FF14;
        font-weight: bold;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 30px;
      }
      
      .zoom-btn-small:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4);
        background: #87CEEB;
        color: #000000;
        border-color: #39FF14;
      }
      
      .zoom-panel-title {
        color: #87CEEB;
        font-weight: bold;
        font-size: 14px;
        white-space: nowrap;
      }
      
      .zoom-settings-content {
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: all 0.3s ease;
      }
      
      .zoom-btn {
        padding: 10px 15px;
        border: 2px solid #87CEEB;
        border-radius: 8px;
        background: #000000;
        color: #39FF14;
        font-weight: bold;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: center;
        box-shadow: 0 2px 10px rgba(57, 255, 20, 0.2);
      }
      
      .zoom-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4);
        background: #87CEEB;
        color: #000000;
        border-color: #39FF14;
      }
      
      .zoom-btn.active {
        background: #39FF14;
        color: #000000;
        border-color: #87CEEB;
      }
      
      #zoom-reset-btn {
        background: #000000;
        color: #f44336;
        border-color: #f44336;
      }
      
      #zoom-reset-btn:hover {
        background: #f44336;
        color: #000000;
      }
      
      .zoom-settings {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #87CEEB;
        font-size: 12px;
        margin-top: 5px;
        flex-wrap: wrap;
      }
      
      .zoom-settings label {
        font-weight: 500;
        white-space: nowrap;
      }
      
      #zoom-level, #overlay-opacity {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: rgba(135, 206, 235, 0.3);
        outline: none;
        -webkit-appearance: none;
        min-width: 80px;
      }
      
      #zoom-level::-webkit-slider-thumb, #overlay-opacity::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: #39FF14;
        cursor: pointer;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        border: 2px solid #87CEEB;
      }
      
      #zoom-level-display {
        min-width: 40px;
        text-align: center;
        font-weight: bold;
        background: rgba(57, 255, 20, 0.2);
        padding: 3px 8px;
        border-radius: 4px;
        color: #39FF14;
        border: 1px solid #87CEEB;
      }
      
      #box-color {
        width: 40px;
        height: 30px;
        border: 2px solid #87CEEB;
        border-radius: 4px;
        cursor: pointer;
        background: #000000;
      }
      
      #toggle-shortcut, #reset-shortcut {
        flex: 1;
        padding: 5px 8px;
        border: 1px solid #87CEEB;
        border-radius: 4px;
        background: #000000;
        color: #39FF14;
        font-size: 11px;
        min-width: 100px;
      }
      
      .zoom-notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(135deg, #39FF14 0%, #87CEEB 100%);
        color: #000000;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
        z-index: 2147483647;
        font-weight: bold;
        border: 2px solid #000000;
        animation: slideIn 0.3s ease;
      }
      
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  init() {
    // بررسی می‌کنیم که آیا قبلاً اضافه شده است
    if (document.getElementById('zoom-box-container')) {
      console.log('ZoomBox already initialized');
      return;
    }
    
    // بارگذاری تنظیمات از storage
    this.loadSettings();
    
    this.createUI();
    this.addEventListeners();
    console.log('ZoomBox initialized successfully');
  }

  loadSettings() {
    chrome.runtime.sendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.settings) {
        this.settings = { ...this.settings, ...response.settings };
        this.zoomLevel = this.settings.zoomLevel;
        this.applySettingsToUI();
      }
    });
  }

  applySettingsToUI() {
    if (this.selectionBox) {
      this.selectionBox.style.borderColor = this.settings.boxColor;
      this.selectionBox.style.backgroundColor = this.hexToRgba(this.settings.boxColor, 0.2);
    }
    if (this.overlay) {
      this.overlay.style.backgroundColor = this.settings.overlayColor;
    }
    if (this.zoomLevelSlider) {
      this.zoomLevelSlider.value = this.settings.zoomLevel;
      this.zoomLevelDisplay.textContent = `${this.settings.zoomLevel}x`;
    }
    if (this.boxColorPicker) {
      this.boxColorPicker.value = this.settings.boxColor || '#39FF14';
    }
    if (this.overlayOpacitySlider) {
      const opacity = parseFloat(this.settings.overlayColor.split(',').pop().replace(')', ''));
      this.overlayOpacitySlider.value = opacity;
    }
  }

  createUI() {
    // ایجاد کانتینر اصلی
    const container = document.createElement('div');
    container.id = 'zoom-box-container';
    container.innerHTML = `
      <div id="zoom-overlay" class="zoom-overlay"></div>
      <div id="zoom-selection-box" class="zoom-selection-box"></div>
      <div id="zoom-controls" class="zoom-controls">
        <div class="zoom-controls-header">
          <button id="zoom-toggle-panel-btn" class="zoom-btn-small" title="بستن/باز کردن تنظیمات">▼</button>
          <span class="zoom-panel-title">تنظیمات زوم</span>
        </div>
        <div id="zoom-settings-content" class="zoom-settings-content">
          <button id="zoom-activate-btn" class="zoom-btn" title="فعال کردن زوم">🔍 فعال کردن زوم</button>
          <button id="zoom-reset-btn" class="zoom-btn" title="بازنشانی زوم">❌ غیرفعال کردن</button>
          <div class="zoom-settings">
            <label for="zoom-level">سطح زوم:</label>
            <input type="range" id="zoom-level" min="1.5" max="5" step="0.5" value="${this.zoomLevel}">
            <span id="zoom-level-display">${this.zoomLevel}x</span>
          </div>
          <div class="zoom-settings">
            <label for="box-color">رنگ کادر:</label>
            <input type="color" id="box-color" value="#39FF14">
          </div>
          <div class="zoom-settings">
            <label for="overlay-opacity">شفافیت پس‌زمینه:</label>
            <input type="range" id="overlay-opacity" min="0" max="1" step="0.05" value="0.7">
          </div>
          <div class="zoom-settings">
            <label for="toggle-shortcut">شورت‌کات فعال/غیرفعال:</label>
            <input type="text" id="toggle-shortcut" value="Ctrl+Shift+Z" placeholder="مثلاً: Ctrl+Shift+Z">
          </div>
          <div class="zoom-settings">
            <label for="reset-shortcut">شورت‌کات بازنشانی:</label>
            <input type="text" id="reset-shortcut" value="Ctrl+Shift+R" placeholder="مثلاً: Ctrl+Shift+R">
          </div>
          <button id="zoom-save-settings" class="zoom-btn" title="ذخیره تنظیمات">💾 ذخیره تنظیمات</button>
          <button id="zoom-reset-settings" class="zoom-btn" title="بازنشانی تنظیمات">🔄 بازنشانی</button>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // ذخیره مراجع به المان‌ها
    this.overlay = document.getElementById('zoom-overlay');
    this.selectionBox = document.getElementById('zoom-selection-box');
    this.controls = document.getElementById('zoom-controls');
    this.settingsContent = document.getElementById('zoom-settings-content');
    this.togglePanelBtn = document.getElementById('zoom-toggle-panel-btn');
    this.activateBtn = document.getElementById('zoom-activate-btn');
    this.resetBtn = document.getElementById('zoom-reset-btn');
    this.zoomLevelSlider = document.getElementById('zoom-level');
    this.zoomLevelDisplay = document.getElementById('zoom-level-display');
    this.boxColorPicker = document.getElementById('box-color');
    this.overlayOpacitySlider = document.getElementById('overlay-opacity');
    this.toggleShortcutInput = document.getElementById('toggle-shortcut');
    this.resetShortcutInput = document.getElementById('reset-shortcut');
    this.saveSettingsBtn = document.getElementById('zoom-save-settings');
    this.resetSettingsBtn = document.getElementById('zoom-reset-settings');

    // مخفی کردن اولیه
    this.selectionBox.style.display = 'none';
    this.overlay.style.display = 'none';
    
    // اطمینان از نمایش پنل تنظیمات
    if (this.settingsContent) {
      this.settingsContent.style.display = 'flex';
    }
    
    // گوش دادن به اسکرول برای آپدیت موقعیت زوم
    window.addEventListener('scroll', () => this.updateZoomOnScroll(), true);
  }

  addEventListeners() {
    // دکمه باز/بسته کردن پنل
    this.togglePanelBtn.addEventListener('click', () => this.togglePanel());

    // دکمه فعال‌سازی
    this.activateBtn.addEventListener('click', () => this.toggleActive());

    // دکمه بازنشانی
    this.resetBtn.addEventListener('click', () => this.deactivate());

    // تغییر سطح زوم
    this.zoomLevelSlider.addEventListener('input', (e) => {
      this.zoomLevel = parseFloat(e.target.value);
      this.zoomLevelDisplay.textContent = `${this.zoomLevel}x`;
    });

    // تغییر رنگ کادر
    this.boxColorPicker.addEventListener('input', (e) => {
      this.settings.boxColor = e.target.value;
      this.selectionBox.style.borderColor = e.target.value;
      this.selectionBox.style.backgroundColor = this.hexToRgba(e.target.value, 0.2);
    });

    // تغییر شفافیت پس‌زمینه
    this.overlayOpacitySlider.addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value);
      this.settings.overlayColor = `rgba(0, 0, 0, ${opacity})`;
      this.overlay.style.backgroundColor = this.settings.overlayColor;
    });

    // تغییر شورت‌کات فعال/غیرفعال
    this.toggleShortcutInput.addEventListener('change', (e) => {
      this.settings.toggleShortcut = e.target.value;
    });

    // تغییر شورت‌کات بازنشانی
    this.resetShortcutInput.addEventListener('change', (e) => {
      this.settings.resetShortcut = e.target.value;
    });

    // ذخیره تنظیمات
    this.saveSettingsBtn.addEventListener('click', () => this.saveCurrentSettings());

    // بازنشانی تنظیمات
    this.resetSettingsBtn.addEventListener('click', () => this.resetSettings());

    // رویدادهای موس برای کشیدن کادر
    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // پشتیبانی از تاچ برای دستگاه‌های لمسی
    document.addEventListener('touchstart', (e) => this.onTouchStart(e));
    document.addEventListener('touchmove', (e) => this.onTouchMove(e));
    document.addEventListener('touchend', (e) => this.onTouchEnd(e));

    // کلید Escape برای خروج
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
      // بررسی شورت‌کات‌های سفارشی
      this.checkShortcuts(e);
    });

    // گوش دادن به پیام‌ها از background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'toggleZoom') {
        this.toggleActive();
      } else if (request.action === 'resetZoom') {
        this.deactivate();
      } else if (request.action === 'applySettings') {
        this.settings = request.settings;
        this.applySettingsToUI();
      } else if (request.action === 'applyShortcuts') {
        // اعمال شورت‌کات‌های جدید
        if (request.shortcuts && request.shortcuts.toggleShortcut) {
          this.settings.toggleShortcut = request.shortcuts.toggleShortcut;
          if (this.toggleShortcutInput) {
            this.toggleShortcutInput.value = request.shortcuts.toggleShortcut;
          }
        }
        if (request.shortcuts && request.shortcuts.resetShortcut) {
          this.settings.resetShortcut = request.shortcuts.resetShortcut;
          if (this.resetShortcutInput) {
            this.resetShortcutInput.value = request.shortcuts.resetShortcut;
          }
        }
      }
    });
  }

  togglePanel() {
    this.isPanelOpen = !this.isPanelOpen;
    if (this.isPanelOpen) {
      if (this.settingsContent) {
        this.settingsContent.style.display = 'flex';
      }
      if (this.togglePanelBtn) {
        this.togglePanelBtn.textContent = '▼';
      }
      if (this.controls) {
        this.controls.classList.remove('collapsed');
      }
    } else {
      if (this.settingsContent) {
        this.settingsContent.style.display = 'none';
      }
      if (this.togglePanelBtn) {
        this.togglePanelBtn.textContent = '▲';
      }
      if (this.controls) {
        this.controls.classList.add('collapsed');
      }
    }
  }

  checkShortcuts(e) {
    const pressed = [];
    if (e.ctrlKey || e.metaKey) pressed.push('Ctrl');
    if (e.shiftKey) pressed.push('Shift');
    if (e.altKey) pressed.push('Alt');
    pressed.push(e.key.toUpperCase());
    
    const shortcutStr = pressed.join('+');
    
    // بررسی شورت‌کات فعال/غیرفعال
    if (shortcutStr === this.settings.toggleShortcut.toUpperCase()) {
      e.preventDefault();
      this.toggleActive();
    }
    
    // بررسی شورت‌کات بازنشانی
    if (shortcutStr === this.settings.resetShortcut.toUpperCase()) {
      e.preventDefault();
      this.deactivate();
    }
  }

  saveCurrentSettings() {
    this.settings.zoomLevel = this.zoomLevel;
    this.settings.boxColor = this.boxColorPicker.value;
    this.settings.overlayColor = this.settings.overlayColor;
    this.settings.toggleShortcut = this.toggleShortcutInput.value;
    this.settings.resetShortcut = this.resetShortcutInput.value;
    
    chrome.runtime.sendMessage({ 
      action: 'saveSettings', 
      settings: this.settings 
    }, (response) => {
      if (response && response.success) {
        this.showNotification('✅ تنظیمات ذخیره شد!');
      }
    });
  }

  resetSettings() {
    const defaultSettings = {
      zoomLevel: 2,
      boxColor: '#39FF14',
      overlayColor: 'rgba(0, 0, 0, 0.7)',
      toggleShortcut: 'Ctrl+Shift+Z',
      resetShortcut: 'Ctrl+Shift+R',
      animationDuration: 0.3
    };
    
    chrome.runtime.sendMessage({ 
      action: 'resetSettings',
      settings: defaultSettings
    }, (response) => {
      if (response && response.success) {
        this.settings = { ...this.settings, ...defaultSettings };
        this.zoomLevel = this.settings.zoomLevel;
        this.zoomLevelSlider.value = this.settings.zoomLevel;
        this.zoomLevelDisplay.textContent = `${this.settings.zoomLevel}x`;
        this.boxColorPicker.value = this.settings.boxColor;
        this.toggleShortcutInput.value = this.settings.toggleShortcut;
        this.resetShortcutInput.value = this.settings.resetShortcut;
        this.selectionBox.style.borderColor = this.settings.boxColor;
        this.selectionBox.style.backgroundColor = this.hexToRgba(this.settings.boxColor, 0.2);
        const opacity = parseFloat(this.settings.overlayColor.split(',').pop().replace(')', ''));
        this.overlayOpacitySlider.value = opacity;
        this.overlay.style.backgroundColor = this.settings.overlayColor;
        this.showNotification('🔄 تنظیمات بازنشانی شد!');
      }
    });
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'zoom-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: linear-gradient(135deg, #39FF14 0%, #87CEEB 100%);
      color: #000000;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4);
      z-index: 2147483647;
      font-weight: bold;
      border: 2px solid #000000;
      animation: slideIn 0.3s ease;
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  toggleActive() {
    this.isActive = !this.isActive;
    
    if (this.isActive) {
      this.activateBtn.textContent = '✅ فعال است';
      this.activateBtn.classList.add('active');
      this.overlay.style.display = 'block';
      this.overlay.style.backgroundColor = this.settings.overlayColor;
      document.body.style.cursor = 'crosshair';
    } else {
      this.deactivate();
    }
  }

  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    this.activateBtn.textContent = '🔍 فعال کردن زوم';
    this.activateBtn.classList.remove('active');
    this.overlay.style.display = 'none';
    this.selectionBox.style.display = 'none';
    document.body.style.cursor = 'default';
    this.resetZoom();
  }

  onMouseDown(e) {
    if (!this.isActive || e.button !== 0) return; // فقط کلیک چپ
    
    // اگر روی کنترل‌ها کلیک شده، کاری نکن
    if (e.target.closest('#zoom-controls')) return;

    this.isDrawing = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';

    e.preventDefault();
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;

    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    const width = parseInt(this.selectionBox.style.width);
    const height = parseInt(this.selectionBox.style.height);
    
    // اگر کادر خیلی کوچک بود، زوم نکن
    if (width < 50 || height < 50) {
      this.selectionBox.style.display = 'none';
      return;
    }

    // انجام زوم
    this.applyZoom(
      parseInt(this.selectionBox.style.left),
      parseInt(this.selectionBox.style.top),
      width,
      height
    );

    // مخفی کردن کادر انتخاب بعد از چند ثانیه
    setTimeout(() => {
      if (!this.isDrawing) {
        this.selectionBox.style.display = 'none';
      }
    }, 1000);
  }

  // پشتیبانی از تاچ
  onTouchStart(e) {
    if (!this.isActive) return;
    
    const touch = e.touches[0];
    if (e.target.closest('#zoom-controls')) return;

    this.isDrawing = true;
    this.startX = touch.clientX;
    this.startY = touch.clientY;
    
    this.selectionBox.style.display = 'block';
    this.selectionBox.style.left = `${this.startX}px`;
    this.selectionBox.style.top = `${this.startY}px`;
    this.selectionBox.style.width = '0px';
    this.selectionBox.style.height = '0px';

    e.preventDefault();
  }

  onTouchMove(e) {
    if (!this.isDrawing) return;

    const touch = e.touches[0];
    const currentX = touch.clientX;
    const currentY = touch.clientY;
    
    const left = Math.min(this.startX, currentX);
    const top = Math.min(this.startY, currentY);
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);

    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
  }

  onTouchEnd(e) {
    this.onMouseUp(e);
  }

  applyZoom(left, top, width, height) {
    // ذخیره اطلاعات ناحیه زوم شده
    this.currentZoomLeft = left;
    this.currentZoomTop = top;
    this.currentZoomWidth = width;
    this.currentZoomHeight = height;
    
    // محاسبه مرکز ناحیه انتخاب شده
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // اعمال ترنسفورم زوم
    document.body.style.transformOrigin = `${centerX}px ${centerY}px`;
    document.body.style.transform = `scale(${this.zoomLevel})`;
    document.body.style.transition = `transform ${this.settings.animationDuration}s ease`;
    
    // اجازه اسکرول دادن بعد از زوم
    document.body.style.overflow = 'auto';
    document.documentElement.style.overflow = 'auto';

    // اسکرول به ناحیه زوم شده
    const scrollX = centerX - window.innerWidth / 2;
    const scrollY = centerY - window.innerHeight / 2;
    
    window.scrollTo({
      top: scrollY,
      left: scrollX,
      behavior: 'smooth'
    });

    // ارسال پیام به background script
    chrome.runtime.sendMessage({
      action: 'zoomArea',
      area: { left, top, width, height, zoomLevel: this.zoomLevel }
    }).catch(() => {
      // اگر background script در دسترس نبود، خطا را نادیده بگیر
    });

    console.log(`Zoom applied: ${this.zoomLevel}x at (${left}, ${top})`);
  }
  
  updateZoomOnScroll() {
    // وقتی کاربر اسکرول می‌کند، موقعیت ترنسفورم را آپدیت کن
    if (this.isActive && this.currentZoomWidth > 0) {
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;
      
      const centerX = this.currentZoomLeft + this.currentZoomWidth / 2;
      const centerY = this.currentZoomTop + this.currentZoomHeight / 2;
      
      // آپدیت transform-origin بر اساس موقعیت اسکرول
      document.body.style.transformOrigin = `${centerX}px ${centerY}px`;
    }
  }

  resetZoom() {
    document.body.style.transform = 'scale(1)';
    document.body.style.transformOrigin = 'center center';
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    this.currentZoomLeft = 0;
    this.currentZoomTop = 0;
    this.currentZoomWidth = 0;
    this.currentZoomHeight = 0;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    console.log('Zoom reset');
  }
}

// شروع افزونه وقتی صفحه لود شد
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ZoomBox();
  });
} else {
  new ZoomBox();
}
