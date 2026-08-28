import React, { useState } from 'react';
import { Image as ImageIcon, Type, Upload, Sparkles } from 'lucide-react';

interface Props {
  lang: 'fa' | 'en';
}

export const CustomContentView: React.FC<Props> = ({ lang }) => {
  const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80'
  );
  const [customText, setCustomText] = useState<string>(
    `Zoom Box Pro allows dynamic, sub-pixel selection on any arbitrary webpage or image canvas. 
When zoomed in, fine textures, microscopic brush strokes, and ultra-fine details become immediately legible.
    
Try dragging the Zoom Box over this canvas area!`
  );

  const sampleImages = [
    { label: 'Oil Painting Detail', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Microchip Circuitry', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Ancient Map & Typography', url: 'https://images.unsplash.com/photo-1524654458049-e36be0721fa2?auto=format&fit=crop&w=1200&q=80' },
    { label: 'High-Density Cityscape', url: 'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80' },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 my-6">
      {/* Header & Mode Switcher */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#39FF14]" />
            {lang === 'fa' ? 'آزمایش با محتوای دلخواه' : 'Custom Asset & Image Sandbox'}
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            {lang === 'fa' 
              ? 'تصویر یا متن دلخواه خود را بارگذاری کنید و زوم باکس را روی آن تست کنید.'
              : 'Load any high-res photo, chart, or typography snippet to test the zoom box.'}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'image'
                ? 'bg-[#39FF14] text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'تصویر' : 'Image'}</span>
          </button>
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'text'
                ? 'bg-[#39FF14] text-black shadow-sm font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'متن / تایپوگرافی' : 'Rich Text'}</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      {activeTab === 'image' ? (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste Image URL here..."
              className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-[#39FF14]"
            />
            <label className="flex items-center justify-center gap-1.5 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold cursor-pointer border border-zinc-600 transition-colors">
              <Upload className="w-3.5 h-3.5 text-[#39FF14]" />
              <span>{lang === 'fa' ? 'آپلود فایل' : 'Upload Local Image'}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {/* Quick Preset Images */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1">
            <span className="text-[11px] font-mono text-zinc-400 whitespace-nowrap">Presets:</span>
            {sampleImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setImageUrl(img.url)}
                className={`text-[11px] px-2.5 py-1 rounded border whitespace-nowrap transition-colors cursor-pointer ${
                  imageUrl === img.url
                    ? 'bg-[#39FF14]/20 border-[#39FF14] text-[#39FF14]'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                }`}
              >
                {img.label}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
          <textarea
            value={customText}
            onChange={(e) => setCustomText(e.target.value)}
            rows={3}
            placeholder="Type custom text..."
            className="w-full px-3 py-2 bg-zinc-950 border border-zinc-700 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-[#39FF14] font-mono"
          />
        </div>
      )}

      {/* Target Canvas */}
      <div className="bg-zinc-950 border-2 border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex items-center justify-center min-h-[420px] overflow-hidden relative">
        {activeTab === 'image' ? (
          <div className="relative group max-w-3xl w-full flex justify-center">
            <img
              src={imageUrl}
              alt="Custom Sandbox Target"
              referrerPolicy="no-referrer"
              className="rounded-xl max-h-[500px] w-auto object-contain border border-zinc-800 shadow-2xl"
            />
          </div>
        ) : (
          <div className="p-8 max-w-2xl bg-zinc-900/90 rounded-xl border border-zinc-700 space-y-4">
            <div className="text-2xl font-bold text-white tracking-tight">Typography Stress Test</div>
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">{customText}</p>
            <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
              <span>CHAR COUNT: {customText.length}</span>
              <span>RENDER ENGINE: SKIA GPU</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
