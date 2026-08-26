// content.js - اسکریپت اصلی برای ایجاد قابلیت زوم با کشیدن کادر
// نسخه 7.0.0 - پشتیبانی کامل از پاپ‌آپ، بازگشت به حالت عادی بدون رفرش، اسکرول فعال

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
      zoomLevel: 100,
      bgColor: '#000000',
      opacity: 70,
      showPanel: true,
      extensionEnabled: true
    };
    
    this.injectStyles();
    this.init();
  }

  injectStyles() {
    if (document.getElementById('zoom-extension-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'zoom-extension-styles';
    style.textContent = `
      #zoom-box-container { all: initial; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .zoom-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); pointer-events: none; z-index: 2147483646; display: none; }
      .zoom-selection-box { position: fixed; border: 3px solid #39FF14; background-color: rgba(57, 255, 20, 0.2); box-shadow: 0 0 20px rgba(57, 255, 20, 0.8); z-index: 2147483647; pointer-events: none; display: none; transition: all 0.1s ease; }
      .zoom-controls { position: fixed; top: 20px; right: 20px; background: linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #39FF14 100%); padding: 15px; border-radius: 12px; box-shadow: 0 10px 40px rgba(57, 255, 20, 0.4); z-index: 2147483647; display: flex; flex-direction: column; gap: 10px; min-width: 220px; backdrop-filter: blur(10px); border: 2px solid #39FF14; max-height: 90vh; overflow-y: auto; transition: all 0.3s ease; }
      .zoom-controls.collapsed { min-width: auto; padding: 10px; }
      .zoom-controls-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
      .zoom-btn-small { padding: 5px 10px; border: 2px solid #87CEEB; border-radius: 6px; background: #000000; color: #39FF14; font-weight: bold; font-size: 12px; cursor: pointer; transition: all 0.3s ease; min-width: 30px; }
      .zoom-btn-small:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4); background: #87CEEB; color: #000000; border-color: #39FF14; }
      .zoom-panel-title { color: #87CEEB; font-weight: bold; font-size: 14px; white-space: nowrap; }
      .zoom-settings-content { display: flex; flex-direction: column; gap: 10px; transition: all 0.3s ease; }
      .zoom-btn { padding: 10px 15px; border: 2px solid #87CEEB; border-radius: 8px; background: #000000; color: #39FF14; font-weight: bold; font-size: 13px; cursor: pointer; transition: all 0.3s ease; text-align: center; box-shadow: 0 2px 10px rgba(57, 255, 20, 0.2); }
      .zoom-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(135, 206, 235, 0.4); background: #87CEEB; color: #000000; border-color: #39FF14; }
      .zoom-btn.active { background: #39FF14; color: #000000; border-color: #87CEEB; }
      #zoom-reset-btn { background: #000000; color: #f44336; border-color: #f44336; }
      #zoom-reset-btn:hover { background: #f44336; color: #000000; }
      .zoom-settings { display: flex; align-items: center; gap: 10px; color: #87CEEB; font-size: 12px; margin-top: 5px; flex-wrap: wrap; }
      .zoom-settings label { font-weight: 500; white-space: nowrap; }
      #zoom-level, #overlay-opacity { flex: 1; height: 6px; border-radius: 3px; background: rgba(135, 206, 235, 0.3); outline: none; -webkit-appearance: none; min-width: 80px; }
      #zoom-level::-webkit-slider-thumb, #overlay-opacity::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #39FF14; cursor: pointer; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); border: 2px solid #87CEEB; }
      #zoom-level-display { min-width: 40px; text-align: center; font-weight: bold; background: rgba(57, 255, 20, 0.2); padding: 3px 8px; border-radius: 4px; color: #39FF14; border: 1px solid #87CEEB; }
      #box-color { width: 40px; height: 30px; border: 2px solid #87CEEB; border-radius: 4px; cursor: pointer; background: #000000; }
      .zoom-notification { position: fixed; bottom: 20px; right: 20px; background: linear-gradient(135deg, #39FF14 0%, #87CEEB 100%); color: #000000; padding: 12px 20px; border-radius: 8px; box-shadow: 0 4px 20px rgba(57, 255, 20, 0.4); z-index: 2147483647; font-weight: bold; border: 2px solid #000000; animation: slideIn 0.3s ease; }
      @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      .zoom-controls.hidden { display: none !important; }
    `;
    document.head.appendChild(style);
  }

  init() {
    if (document.getElementById('zoom-box-container')) {
      console.log('ZoomBox already initialized');
      this.loadSettings();
      return;
    }
    
    this.loadSettings();
    this.createUI();
    this.addEventListeners();
    console.log('ZoomBox initialized successfully v7.0.0');
  }

  loadSettings() {
    chrome.storage.sync.get(['zoomLevel', 'bgColor', 'opacity', 'showPanel', 'extensionEnabled'], (result) => {
      if (chrome.runtime.lastError) {
        console.error('Error loading settings:', chrome.runtime.lastError);
        return;
      }
      
      this.settings = {
        zoomLevel: result.zoomLevel || 100,
        bgColor: result.bgColor || '#000000',
        opacity: result.opacity || 70,
        showPanel: result.showPanel !== false,
        extensionEnabled: result.extensionEnabled !== false
      };
      
      this.applySettings();
    });
  }

  applySettings() {
    if (!this.settings.extensionEnabled) {
      this.deactivate();
      return;
    }
    
    if (this.overlay) {
      const opacityValue = this.settings.opacity / 100;
      this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacityValue})`;
    }
    
    if (this.controls) {
      if (this.settings.showPanel) {
        this.controls.classList.remove('hidden');
      } else {
        this.controls.classList.add('hidden');
      }
    }
    
    if (this.zoomLevelSlider) {
      this.zoomLevelSlider.value = this.settings.zoomLevel / 100;
      this.zoomLevelDisplay.textContent = `${this.settings.zoomLevel}%`;
    }
  }

  createUI() {
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
          <button id="zoom-reset-btn" class="zoom-btn" title="بازنشانی زوم">❌ بازگشت به 100%</button>
          <div class="zoom-settings">
            <label for="zoom-level">سطح زوم:</label>
            <input type="range" id="zoom-level" min="0.5" max="5" step="0.25" value="1">
            <span id="zoom-level-display">100%</span>
          </div>
          <div class="zoom-settings">
            <label for="box-color">رنگ کادر:</label>
            <input type="color" id="box-color" value="#39FF14">
          </div>
          <div class="zoom-settings">
            <label for="overlay-opacity">شفافیت پس‌زمینه:</label>
            <input type="range" id="overlay-opacity" min="0" max="1" step="0.05" value="0.7">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(container);

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

    this.selectionBox.style.display = 'none';
    this.overlay.style.display = 'none';
    
    if (this.settingsContent) {
      this.settingsContent.style.display = 'flex';
    }
    
    if (!this.settings.showPanel && this.controls) {
      this.controls.classList.add('hidden');
    }
    
    window.addEventListener('scroll', () => this.updateZoomOnScroll(), true);
  }

  addEventListeners() {
    this.togglePanelBtn.addEventListener('click', () => this.togglePanel());
    this.activateBtn.addEventListener('click', () => this.toggleActive());
    this.resetBtn.addEventListener('click', () => this.resetZoom());

    this.zoomLevelSlider.addEventListener('input', (e) => {
      const zoomValue = parseFloat(e.target.value);
      this.zoomLevel = zoomValue;
      this.zoomLevelDisplay.textContent = `${Math.round(zoomValue * 100)}%`;
      if (this.isActive) {
        this.applyZoom();
      }
    });

    this.boxColorPicker.addEventListener('input', (e) => {
      this.selectionBox.style.borderColor = e.target.value;
      this.selectionBox.style.backgroundColor = this.hexToRgba(e.target.value, 0.2);
    });

    this.overlayOpacitySlider.addEventListener('input', (e) => {
      const opacity = parseFloat(e.target.value);
      this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacity})`;
    });

    document.addEventListener('mousedown', (e) => this.onMouseDown(e));
    document.addEventListener('mousemove', (e) => this.onMouseMove(e));
    document.addEventListener('mouseup', (e) => this.onMouseUp(e));

    document.addEventListener('touchstart', (e) => this.onTouchStart(e));
    document.addEventListener('touchmove', (e) => this.onTouchMove(e));
    document.addEventListener('touchend', (e) => this.onTouchEnd(e));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.deactivate();
      }
    });

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'updateSettings') {
        this.handleSettingsUpdate(request.settings);
        sendResponse({ success: true });
      } else if (request.action === 'toggleZoom') {
        this.toggleActive();
        sendResponse({ success: true });
      } else if (request.action === 'resetZoom') {
        this.resetZoom();
        sendResponse({ success: true });
      }
      return true;
    });
  }

  handleSettingsUpdate(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    if (newSettings.bgColor !== undefined || newSettings.opacity !== undefined) {
      const opacityValue = (newSettings.opacity || this.settings.opacity) / 100;
      if (this.overlay) {
        this.overlay.style.backgroundColor = `rgba(0, 0, 0, ${opacityValue})`;
      }
    }
    
    if (newSettings.zoomLevel !== undefined) {
      this.zoomLevel = newSettings.zoomLevel / 100;
      if (this.zoomLevelSlider) {
        this.zoomLevelSlider.value = this.zoomLevel;
      }
      if (this.zoomLevelDisplay) {
        this.zoomLevelDisplay.textContent = `${newSettings.zoomLevel}%`;
      }
      if (this.isActive) {
        this.applyZoom();
      }
    }
    
    if (newSettings.showPanel !== undefined && this.controls) {
      if (newSettings.showPanel) {
        this.controls.classList.remove('hidden');
      } else {
        this.controls.classList.add('hidden');
      }
    }
    
    if (newSettings.extensionEnabled === false) {
      this.deactivate();
    }
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

  toggleActive() {
    if (this.isActive) {
      this.deactivate();
    } else {
      this.activate();
    }
  }

  activate() {
    this.isActive = true;
    this.isDrawing = true;
    
    if (this.activateBtn) {
      this.activateBtn.textContent = '✅ در حال کشیدن کادر...';
      this.activateBtn.classList.add('active');
    }
    
    if (this.overlay) {
      this.overlay.style.display = 'block';
      this.overlay.style.pointerEvents = 'none';
    }
    
    document.body.style.cursor = 'crosshair';
    this.showNotification('کادر را روی ناحیه مورد نظر بکشید');
  }

  deactivate() {
    this.isActive = false;
    this.isDrawing = false;
    
    if (this.activateBtn) {
      this.activateBtn.textContent = '🔍 فعال کردن زوم';
      this.activateBtn.classList.remove('active');
    }
    
    if (this.overlay) {
      this.overlay.style.display = 'none';
    }
    
    if (this.selectionBox) {
      this.selectionBox.style.display = 'none';
    }
    
    document.body.style.cursor = 'default';
    
    if (this.box) {
      this.removeZoom();
    }
  }

  resetZoom() {
    this.deactivate();
    this.zoomLevel = 1;
    if (this.zoomLevelSlider) {
      this.zoomLevelSlider.value = 1;
    }
    if (this.zoomLevelDisplay) {
      this.zoomLevelDisplay.textContent = '100%';
    }
    this.showNotification('زوم به 100% بازگشت');
  }

  onMouseDown(e) {
    if (!this.isActive || !this.isDrawing) return;
    if (e.target.closest('#zoom-box-container')) return;
    
    this.startX = e.clientX;
    this.startY = e.clientY;
    
    if (this.selectionBox) {
      this.selectionBox.style.display = 'block';
      this.selectionBox.style.left = this.startX + 'px';
      this.selectionBox.style.top = this.startY + 'px';
      this.selectionBox.style.width = '0px';
      this.selectionBox.style.height = '0px';
    }
    
    e.preventDefault();
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    
    const currentX = e.clientX;
    const currentY = e.clientY;
    
    const width = Math.abs(currentX - this.startX);
    const height = Math.abs(currentY - this.startY);
    const left = Math.min(currentX, this.startX);
    const top = Math.min(currentY, this.startY);
    
    if (this.selectionBox) {
      this.selectionBox.style.width = width + 'px';
      this.selectionBox.style.height = height + 'px';
      this.selectionBox.style.left = left + 'px';
      this.selectionBox.style.top = top + 'px';
    }
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    
    const endX = e.clientX;
    const endY = e.clientY;
    
    const width = Math.abs(endX - this.startX);
    const height = Math.abs(endY - this.startY);
    
    if (width > 20 && height > 20) {
      const left = Math.min(endX, this.startX);
      const top = Math.min(endY, this.startY);
      
      this.currentZoomLeft = left;
      this.currentZoomTop = top;
      this.currentZoomWidth = width;
      this.currentZoomHeight = height;
      
      this.applyZoom();
    }
    
    this.isDrawing = false;
    
    if (this.selectionBox) {
      this.selectionBox.style.display = 'none';
    }
  }

  onTouchStart(e) {
    if (!this.isActive) return;
    const touch = e.touches[0];
    this.onMouseDown({ clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {}, target: e.target });
  }

  onTouchMove(e) {
    if (!this.isDrawing) return;
    const touch = e.touches[0];
    this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  onTouchEnd(e) {
    if (!this.isDrawing) return;
    const touch = e.changedTouches[0];
    this.onMouseUp({ clientX: touch.clientX, clientY: touch.clientY });
  }

  applyZoom() {
    if (this.box) {
      this.removeZoom();
    }
    
    const originalElement = document.elementFromPoint(
      this.currentZoomLeft + this.currentZoomWidth / 2,
      this.currentZoomTop + this.currentZoomHeight / 2
    );
    
    if (!originalElement) return;
    
    const clone = originalElement.cloneNode(true);
    clone.id = 'zoomed-content';
    clone.style.position = 'fixed';
    clone.style.left = this.currentZoomLeft + 'px';
    clone.style.top = this.currentZoomTop + 'px';
    clone.style.width = this.currentZoomWidth + 'px';
    clone.style.height = this.currentZoomHeight + 'px';
    clone.style.transformOrigin = 'top left';
    clone.style.transform = `scale(${this.zoomLevel})`;
    clone.style.zIndex = '2147483647';
    clone.style.overflow = 'hidden';
    clone.style.pointerEvents = 'auto';
    clone.style.backgroundColor = getComputedStyle(originalElement).backgroundColor;
    clone.style.border = getComputedStyle(originalElement).border;
    clone.style.boxShadow = '0 0 30px rgba(0,0,0,0.5)';
    
    this.box = clone;
    document.body.appendChild(clone);
    
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'auto';
    }
    
    this.isDrawing = false;
    if (this.activateBtn) {
      this.activateBtn.textContent = '✅ زوم فعال است';
      this.activateBtn.classList.remove('active');
    }
    
    this.showNotification(`زوم ${Math.round(this.zoomLevel * 100)}% اعمال شد`);
  }

  removeZoom() {
    if (this.box) {
      this.box.remove();
      this.box = null;
    }
    
    if (this.overlay) {
      this.overlay.style.pointerEvents = 'none';
    }
  }

  updateZoomOnScroll() {
    if (!this.box) return;
    
    const scrollDiffX = window.scrollX - (this.lastScrollX || 0);
    const scrollDiffY = window.scrollY - (this.lastScrollY || 0);
    
    this.currentZoomLeft += scrollDiffX;
    this.currentZoomTop += scrollDiffY;
    
    this.box.style.left = this.currentZoomLeft + 'px';
    this.box.style.top = this.currentZoomTop + 'px';
    
    this.lastScrollX = window.scrollX;
    this.lastScrollY = window.scrollY;
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  showNotification(message) {
    const existing = document.querySelector('.zoom-notification');
    if (existing) {
      existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'zoom-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => notification.remove(), 300);
    }, 2000);
  }
}

// شروع افزونه وقتی DOM آماده است
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ZoomBox());
} else {
  new ZoomBox();
}
