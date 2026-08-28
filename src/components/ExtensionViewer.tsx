import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Chrome, ShieldCheck, FolderCheck, Flame, Layers, AlertTriangle } from 'lucide-react';
import JSZip from 'jszip';

// فایل‌های واقعی افزونه به‌صورت خام از روی دیسک خوانده می‌شوند؛ یعنی هر آنچه
// در این نمایشگر دیده یا دانلود می‌شود دقیقاً همان چیزی است که در پوشه
// zoom-extension-v2 وجود دارد (تک منبع حقیقت — بدون کپی‌برداری دستی)
import contentJsCode from '../../zoom-extension-v2/content.js?raw';
import backgroundJsCode from '../../zoom-extension-v2/background.js?raw';
import popupJsCode from '../../zoom-extension-v2/popup.js?raw';
import popupHtmlCode from '../../zoom-extension-v2/popup.html?raw';
import manifestJsonCode from '../../zoom-extension-v2/manifest.json?raw';
import readmeMdCode from '../../zoom-extension-v2/README.md?raw';
import icon128Url from '../../zoom-extension-v2/icons/icon128.png?url';

const EXTENSION_VERSION = '8.7.0';

interface Props {
  lang: 'fa' | 'en';
}

type FileKey = 'content' | 'manifest' | 'popupHtml' | 'popupJs' | 'background' | 'readme';

interface ExtensionFile {
  name: string;
  desc: string;
  code: string;
}

export const ExtensionViewer: React.FC<Props> = ({ lang }) => {
  const [selectedFile, setSelectedFile] = useState<FileKey>('content');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<'firefox' | 'chrome'>('firefox');

  const files: Record<FileKey, ExtensionFile> = {
    content: {
      name: 'content.js',
      desc: 'اسکریپت تزریقی صفحه: Shadow DOM ایزوله سازگار با فایرفاکس، رسم کادر با Pointer Events، انیمیشن زوم و Pan',
      code: contentJsCode,
    },
    manifest: {
      name: 'manifest.json',
      desc: 'مانیفست MV3 بهینه‌شده برای فایرفاکس (Gecko settings، دسترسی‌ها و میانبرهای سراسری)',
      code: manifestJsonCode,
    },
    popupHtml: {
      name: 'popup.html',
      desc: 'رابط کاربری پاپ‌آپ با کنترل‌های کامل زوم، رنگ، میانبرها و نشانگر ذره‌بین',
      code: popupHtmlCode,
    },
    popupJs: {
      name: 'popup.js',
      desc: 'منطق پاپ‌آپ: ذخیره تنظیمات، ارسال پیام به تب فعال و تزریق خودکار اسکریپت در فایرفاکس',
      code: popupJsCode,
    },
    background: {
      name: 'background.js',
      desc: 'اسکریپت پس‌زمینه: مدیریت میانبرهای سراسری و تزریق اسکریپت با نگه‌داشت تنظیمات اولیه',
      code: backgroundJsCode,
    },
    readme: {
      name: 'README.md',
      desc: 'راهنمای جامع راه‌اندازی و استفاده در موزیلا فایرفاکس، کروم، بریو و اج',
      code: readmeMdCode,
    },
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloading(true);
      const zip = new JSZip();
      const folder = zip.folder('zoom-extension-v2');

      if (folder) {
        folder.file('manifest.json', files.manifest.code);

        // ساخت نسخه کرومی مانیفست به‌صورت برنامه‌نویسی (فایرفاکس: background.scripts
        // در حالی‌که کروم به service_worker نیاز دارد و کلیدهای gecko را نمی‌شناسد)
        try {
          const manifestObj = JSON.parse(files.manifest.code);
          delete manifestObj.browser_specific_settings;
          manifestObj.background = { service_worker: 'background.js' };
          folder.file('manifest-chrome.json', JSON.stringify(manifestObj, null, 2));
        } catch (manifestErr) {
          console.error('Error building chrome manifest variant:', manifestErr);
        }

        folder.file('popup.html', files.popupHtml.code);
        folder.file('popup.js', files.popupJs.code);
        folder.file('content.js', files.content.code);
        folder.file('background.js', files.background.code);
        folder.file('README.md', files.readme.code);

        // آیکون‌های واقعی افزونه از روی فایل‌های پروژه
        const iconsFolder = folder.folder('icons');
        if (iconsFolder) {
          try {
            const iconBlob = await (await fetch(icon128Url)).blob();
            iconsFolder.file('icon128.png', iconBlob);
          } catch (iconErr) {
            console.error('Error bundling icon:', iconErr);
          }
        }
      }

      const zipContent = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zoom-box-pro-v${EXTENSION_VERSION}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error generating zip:', e);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 my-6">
      {/* Installation Guide Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14]/50 text-[#39FF14]">
              {activeGuideTab === 'firefox' ? <Flame className="w-7 h-7 text-orange-400" /> : <Chrome className="w-7 h-7" />}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {lang === 'fa'
                    ? (activeGuideTab === 'firefox' ? 'راهنمای تست و نصب در موزیلا فایرفاکس (Firefox)' : 'راهنمای نصب در کروم / بریو / اج')
                    : (activeGuideTab === 'firefox' ? 'Mozilla Firefox Installation Guide' : 'Chrome / Brave / Edge Installation Guide')}
                </h2>
                <span className="bg-emerald-500/20 text-emerald-400 text-[11px] font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <Layers className="w-3 h-3 text-[#39FF14]" />
                  Shadow DOM ایزوله (v{EXTENSION_VERSION})
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {lang === 'fa'
                  ? 'مجهز به لایه ایزوله کامل Shadow DOM برای جلوگیری ۱۰۰٪ از تداخل CSS صفحات وب و کارکرد پایدار در فایرفاکس و کروم'
                  : 'Equipped with full Shadow DOM CSS encapsulation preventing host page styling interference.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#39FF14] text-black font-bold text-sm shadow-[0_0_25px_rgba(57,255,20,0.4)] hover:bg-[#2ecc71] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? (lang === 'fa' ? 'در حال ایجاد فایل زیپ...' : 'Zipping...') : (lang === 'fa' ? `دانلود پکیج ZIP افزونه (v${EXTENSION_VERSION})` : `Download Extension ZIP (v${EXTENSION_VERSION})`)}</span>
          </button>
        </div>

        {/* Important Troubleshooting Note for Firefox */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-amber-300">نکته بسیار مهم برای تست در فایرفاکس:</span>
            <p className="text-zinc-300 leading-relaxed">
              مرورگر فایرفاکس به دلایل امنیتی به هیچ افزونه‌ای اجازه اجرا روی صفحات داخلی مثل <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">about:debugging</code>، <code className="bg-zinc-900 px-1.5 py-0.5 rounded text-amber-300 font-mono">about:addons</code> یا فروشگاه افزونه‌ها را نمی‌دهد. پس از لود افزونه، حتماً یک <strong>تب جدید باز کرده و وارد سایتی مثل google.com یا wikipedia.org شوید</strong> و کلیدهای <kbd className="bg-zinc-900 px-1.5 py-0.5 rounded text-emerald-400 font-mono">Ctrl + Shift + Z</kbd> را بزنید.
            </p>
          </div>
        </div>

        {/* Browser Switcher Tabs */}
        <div className="flex gap-2 p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
          <button
            onClick={() => setActiveGuideTab('firefox')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeGuideTab === 'firefox'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Mozilla Firefox (فایرفاکس)</span>
          </button>
          <button
            onClick={() => setActiveGuideTab('chrome')}
            className={`flex-1 py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all ${
              activeGuideTab === 'chrome'
                ? 'bg-[#39FF14] text-black shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Google Chrome / Brave / Edge</span>
          </button>
        </div>

        {/* Steps Flow */}
        {activeGuideTab === 'firefox' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۱</span>
                <Flame className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">ورود به بخش Debugging</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                در آدرس‌بار فایرفاکس وارد کنید: <code className="bg-zinc-900 px-1 py-0.5 rounded text-orange-300 font-mono">about:debugging#/runtime/this-firefox</code>
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۲</span>
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">بارگذاری افزونه موقت</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی دکمه <strong>Load Temporary Add-on...</strong> کلیک کرده و فایل <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">manifest.json</code> را انتخاب کنید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-orange-400 font-bold">مرحله ۳</span>
                <FolderCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">تست روی یک سایت عادی</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی سایتی مثل <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">google.com</code> تست کنید و کلیدهای <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">Ctrl+Shift+Z</code> را بزنید.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۱</span>
                <Chrome className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">ورود به مدیریت افزونه‌ها</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                در مرورگر کروم وارد آدرس <code className="bg-zinc-900 px-1 py-0.5 rounded text-sky-400 font-mono">chrome://extensions</code> شوید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۲</span>
                <ShieldCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">فعال‌سازی Developer Mode</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                دکمه سوئیچ Developer mode را در بالا سمت راست صفحه روشن کنید.
              </p>
            </div>

            <div className="bg-zinc-950/80 border border-zinc-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#39FF14] font-bold">مرحله ۳</span>
                <FolderCheck className="w-4 h-4 text-zinc-500" />
              </div>
              <div className="text-sm font-semibold text-white">Load Unpacked</div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                روی <strong>Load unpacked</strong> کلیک کرده و پوشه <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">zoom-extension-v2</code> را انتخاب کنید. اگر کروم روی مانیفست خطا گرفت، فایل <code className="bg-zinc-900 px-1 py-0.5 rounded text-emerald-400 font-mono">manifest-chrome.json</code> داخل زیپ را جایگزین کنید.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Code Inspector & Manifest Viewer */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Tab Headers */}
        <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['content', 'manifest', 'popupHtml', 'popupJs', 'background', 'readme'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedFile(key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer whitespace-nowrap ${
                  selectedFile === key
                    ? 'bg-zinc-950 text-[#39FF14] border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" />
                <span>{files[key].name}</span>
                {key === 'content' && <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.2 rounded font-sans">Shadow DOM</span>}
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium border border-zinc-700 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>

        {/* File Description */}
        <div className="bg-zinc-900/40 px-5 py-2 text-[11px] font-mono text-zinc-400 border-b border-zinc-800/60 flex items-center justify-between">
          <span>{files[selectedFile].desc}</span>
          <span className="text-zinc-500 text-[10px]">Firefox-Optimized Manifest V3 (v{EXTENSION_VERSION})</span>
        </div>

        {/* Code Content */}
        <div className="p-5 overflow-x-auto max-h-[500px]">
          <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
            {files[selectedFile].code}
          </pre>
        </div>
      </div>
    </div>
  );
};
