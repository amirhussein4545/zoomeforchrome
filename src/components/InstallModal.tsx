import React from 'react';
import { X, Chrome, Download, ShieldCheck, FolderOpen, CheckCircle, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  lang: 'fa' | 'en';
}

export const InstallModal: React.FC<Props> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  const steps = [
    {
      step: '01',
      titleFa: 'دانلود و استخراج فایل زیپ',
      titleEn: 'Download & Unzip Repository',
      descFa: 'از منوی گیت‌هاب روی دکمه Code کلیک کرده و Download ZIP را بزنید. سپس فایل زیپ را از حالت فشرده خارج (Extract) کنید.',
      descEn: 'Click "Code" on GitHub and select "Download ZIP". Unzip the repository folder on your computer.',
      icon: Download,
    },
    {
      step: '02',
      titleFa: 'ورود به صفحه مدیریت افزونه‌های کروم',
      titleEn: 'Open Chrome Extensions',
      descFa: 'مرورگر گوگل کروم را باز کرده و در نوار آدرس عبارت زیر را وارد کنید:',
      descEn: 'Open Google Chrome and navigate to the following URL in your address bar:',
      url: 'chrome://extensions',
      icon: Chrome,
    },
    {
      step: '03',
      titleFa: 'فعال‌سازی حالت توسعه‌دهنده (Developer Mode)',
      titleEn: 'Enable Developer Mode',
      descFa: 'در بالای سمت راست صفحه مدیریت افزونه‌ها، دکمه‌ی Developer mode را روشن کنید.',
      descEn: 'Toggle the "Developer mode" switch located in the top-right corner of the extensions page.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      titleFa: 'بارگذاری پوشه افزونه (Load Unpacked)',
      titleEn: 'Load Unpacked Directory',
      descFa: 'روی دکمه‌ی Load unpacked کلیک کرده و پوشه zoom-extension-v2 را از فایل‌های استخراج شده انتخاب کنید.',
      descEn: 'Click "Load unpacked" and select the zoom-extension-v2 folder from the extracted repository.',
      icon: FolderOpen,
    },
  ];

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-zinc-950 border-2 border-[#39FF14] rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(57,255,20,0.3)] relative text-zinc-100 max-h-[90vh] overflow-y-auto"
        dir={lang === 'fa' ? 'rtl' : 'ltr'}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 sm:left-auto sm:right-4 p-2 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-[#39FF14] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-[#39FF14]/15 border border-[#39FF14] text-[#39FF14]">
            <Chrome className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {lang === 'fa' ? 'راهنمای تصویری نصب افزونه در کروم' : 'Visual Guide: How to Install in Chrome'}
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              {lang === 'fa' 
                ? 'آموزش گام‌به‌گام نصب مستقیم افزونه Zoom Box Pro پس از دانلود زیپ گیت‌هاب'
                : 'Step-by-step instructions to install Zoom Box Pro directly in Google Chrome'}
            </p>
          </div>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4 my-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 sm:p-5 flex items-start gap-4 hover:border-[#39FF14]/50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-black border border-emerald-500/40 flex items-center justify-center text-[#39FF14] font-mono font-bold text-sm shadow-inner">
                  {s.step}
                </div>

                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#87CEEB]" />
                    <h3 className="text-sm font-bold text-white">
                      {lang === 'fa' ? s.titleFa : s.titleEn}
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {lang === 'fa' ? s.descFa : s.descEn}
                  </p>

                  {s.url && (
                    <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black border border-sky-500/50 text-sky-400 font-mono text-xs select-all">
                      <span>{s.url}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
            <CheckCircle className="w-4 h-4" />
            <span>{lang === 'fa' ? 'آماده برای استفاده فوری بدون نیاز به بیلد' : 'Ready to use instantly with no build step required'}</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#39FF14] text-black font-bold text-xs hover:bg-[#87CEEB] transition-colors cursor-pointer shadow-lg"
          >
            {lang === 'fa' ? 'متوجه شدم، بستن پنجره' : 'Got it, Close Guide'}
          </button>
        </div>
      </div>
    </div>
  );
};
