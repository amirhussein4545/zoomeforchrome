import React, { useState, useEffect } from 'react';
import { ZoomSettings, SandboxTab, SampleContentType } from './types';
import { ZoomBoxEngine } from './components/ZoomBoxEngine';
import { Header } from './components/Header';
import { ResearchPaperView } from './components/TestPages/ResearchPaperView';
import { DataAnalyticsView } from './components/TestPages/DataAnalyticsView';
import { BlueprintView } from './components/TestPages/BlueprintView';
import { CodeDiffView } from './components/TestPages/CodeDiffView';
import { CustomContentView } from './components/TestPages/CustomContentView';
import { ExtensionViewer } from './components/ExtensionViewer';
import { InstallModal } from './components/InstallModal';
import { MousePointerClick } from 'lucide-react';

const STORAGE_KEY = 'zoom_box_pro_settings_v8';

export function App() {
  const [lang, setLang] = useState<'fa' | 'en'>('fa');
  const [currentTab, setCurrentTab] = useState<SandboxTab>('sandbox');
  const [currentSample, setCurrentSample] = useState<SampleContentType>('article');
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const [settings, setSettings] = useState<ZoomSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return {
      zoomLevel: 200,
      bgColor: '#000000',
      opacity: 70,
      boxColor: '#39FF14',
      showPanel: true,
      extensionEnabled: true,
      lensMode: false,
      lensSize: 180,
      shortcutKey: 'Z',
      shortcutCtrl: true,
      shortcutShift: true,
      shortcutAlt: false,
    };
  });

  // Persist settings to localStorage (mirroring Chrome storage sync)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  const handleUpdateSettings = (newPartial: Partial<ZoomSettings>) => {
    setSettings((prev) => ({ ...prev, ...newPartial }));
  };

  const toggleLanguage = () => {
    setLang((prev) => (prev === 'fa' ? 'en' : 'fa'));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col selection:bg-[#39FF14] selection:text-black">
      {/* Zoom Box Engine Wrapping the Interactive Viewport */}
      <ZoomBoxEngine
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        lang={lang}
      >
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          currentSample={currentSample}
          onSelectSample={setCurrentSample}
          lang={lang}
          onToggleLang={toggleLanguage}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />

        {/* Quick Instructions / Shortcut Banner */}
        <div className="bg-zinc-900/40 border-b border-zinc-800/60 py-2 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>
                {lang === 'fa' ? (
                  <>
                    روی دکمه <strong>"🔍 فعال کردن زوم"</strong> در پنل شناور کلیک کنید، سپس با موس کادر بکشید.
                  </>
                ) : (
                  <>
                    Click <strong>"🔍 Activate Zoom"</strong> on the floating control widget, then drag a box over any content.
                  </>
                )}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-300">
                Ctrl+Shift+Z
              </span>
              <span className="text-zinc-500">Toggle</span>
              <span className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 text-zinc-300">
                Esc
              </span>
              <span className="text-zinc-500">Exit</span>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {currentTab === 'sandbox' && (
            <div>
              {currentSample === 'article' && <ResearchPaperView lang={lang} />}
              {currentSample === 'charts' && <DataAnalyticsView lang={lang} />}
              {currentSample === 'blueprint' && <BlueprintView lang={lang} />}
              {currentSample === 'code' && <CodeDiffView lang={lang} />}
            </div>
          )}

          {currentTab === 'custom' && <CustomContentView lang={lang} />}

          {currentTab === 'extension-files' && <ExtensionViewer lang={lang} />}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 px-4 text-center text-xs text-zinc-500 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#39FF14]" />
            <span className="font-semibold text-zinc-400">Zoom Box Pro • Firefox Extension v8.7.0</span>
          </div>
          <p className="text-[11px] text-zinc-600 max-w-md mx-auto">
            {lang === 'fa'
              ? 'بهینه‌شده مخصوص فایرفاکس با مانیفست نسخه ۳، ایزولاسیون Shadow DOM، ترنسفورم سخت‌افزاری و ذخیره‌سازی محلی'
              : 'Optimized for Mozilla Firefox with Manifest V3, Shadow DOM isolation, hardware-accelerated transform, and local sync.'}
          </p>
        </footer>

        {/* Visual Install Modal */}
        <InstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          lang={lang}
        />
      </ZoomBoxEngine>
    </div>
  );
}

export default App;
