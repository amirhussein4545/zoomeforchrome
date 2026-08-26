// content.js - اسکریپت اصلی برای ایجاد قابلیت زوم با کشیدن کادر

class ZoomBox {
  constructor() {
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.box = null;
    this.isActive = false;
    this.zoomLevel = 2; // سطح زوم پیش‌فرض
    
    this.init();
  }

  init() {
    // بررسی می‌کنیم که آیا قبلاً اضافه شده است
    if (document.getElementById('zoom-box-container')) {
      console.log('ZoomBox already initialized');
      return;
    }

    this.createUI();
    this.addEventListeners();
    console.log('ZoomBox initialized successfully');
  }

  createUI() {
    // ایجاد کانتینر اصلی
    const container = document.createElement('div');
    container.id = 'zoom-box-container';
    container.innerHTML = `
      <div id="zoom-overlay" class="zoom-overlay"></div>
      <div id="zoom-selection-box" class="zoom-selection-box"></div>
      <div id="zoom-controls" class="zoom-controls">
        <button id="zoom-activate-btn" class="zoom-btn" title="فعال کردن زوم">🔍 فعال کردن زوم</button>
        <button id="zoom-reset-btn" class="zoom-btn" title="بازنشانی زوم">❌ غیرفعال کردن</button>
        <div class="zoom-settings">
          <label for="zoom-level">سطح زوم:</label>
          <input type="range" id="zoom-level" min="1.5" max="5" step="0.5" value="${this.zoomLevel}">
          <span id="zoom-level-display">${this.zoomLevel}x</span>
        </div>
      </div>
    `;
    document.body.appendChild(container);

    // ذخیره مراجع به المان‌ها
    this.overlay = document.getElementById('zoom-overlay');
    this.selectionBox = document.getElementById('zoom-selection-box');
    this.controls = document.getElementById('zoom-controls');
    this.activateBtn = document.getElementById('zoom-activate-btn');
    this.resetBtn = document.getElementById('zoom-reset-btn');
    this.zoomLevelSlider = document.getElementById('zoom-level');
    this.zoomLevelDisplay = document.getElementById('zoom-level-display');

    // مخفی کردن اولیه
    this.selectionBox.style.display = 'none';
    this.overlay.style.display = 'none';
  }

  addEventListeners() {
    // دکمه فعال‌سازی
    this.activateBtn.addEventListener('click', () => this.toggleActive());

    // دکمه بازنشانی
    this.resetBtn.addEventListener('click', () => this.deactivate());

    // تغییر سطح زوم
    this.zoomLevelSlider.addEventListener('input', (e) => {
      this.zoomLevel = parseFloat(e.target.value);
      this.zoomLevelDisplay.textContent = `${this.zoomLevel}x`;
    });

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
    });
  }

  toggleActive() {
    this.isActive = !this.isActive;
    
    if (this.isActive) {
      this.activateBtn.textContent = '✅ فعال است';
      this.activateBtn.classList.add('active');
      this.overlay.style.display = 'block';
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
    // محاسبه مرکز ناحیه انتخاب شده
    const centerX = left + width / 2;
    const centerY = top + height / 2;

    // اعمال ترنسفورم زوم
    document.body.style.transformOrigin = `${centerX}px ${centerY}px`;
    document.body.style.transform = `scale(${this.zoomLevel})`;
    document.body.style.transition = 'transform 0.3s ease';

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

  resetZoom() {
    document.body.style.transform = 'scale(1)';
    document.body.style.transformOrigin = 'center center';
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
