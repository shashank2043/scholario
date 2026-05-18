import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, subtitle, children }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-slide-up relative">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 rounded-t-[2.5rem]">
          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900">{title}</h2>
            {subtitle && <p className="text-slate-400 text-sm font-medium">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400 btn-tactile">
            <X size={24} />
          </button>
        </div>
        <div className="p-10">
          {children}
        </div>
      </div>
    </div>
  );
};
