import React from 'react';
import { ToastMessage } from '../types';

interface NotificationToastProps {
  toasts: ToastMessage[];
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div id="zoom-notification-portal" className="fixed bottom-5 right-5 z-[999999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="bg-gradient-to-r from-[#39FF14] to-[#87CEEB] text-zinc-950 font-bold px-4 py-2.5 rounded-lg shadow-2xl border-2 border-black flex items-center gap-2 text-sm pointer-events-auto transition-all animate-bounce"
          style={{
            boxShadow: '0 4px 20px rgba(57, 255, 20, 0.4)',
          }}
        >
          <span>{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
