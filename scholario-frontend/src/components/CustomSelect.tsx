import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface CustomSelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ label, options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.id === value);

  return (
    <div className="space-y-3 relative">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <div 
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full p-5 bg-slate-50 border-2 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
            isOpen ? 'border-indigo-500 bg-white ring-4 ring-indigo-500/10' : 'border-transparent'
          }`}
        >
          <span className={selectedOption ? 'text-slate-800 font-medium' : 'text-slate-300'}>
            {selectedOption ? selectedOption.name : placeholder || 'Select option'}
          </span>
          <ChevronDown className={`text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} size={20} />
        </div>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 max-h-[200px] overflow-y-auto animate-scale-in scrollbar-hide">
              <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
              {options.map((option) => (
                <div
                  key={option.id}
                  onClick={() => { onChange(option.id); setIsOpen(false); }}
                  className={`px-6 py-4 mx-2 rounded-xl flex items-center gap-3 cursor-pointer transition-all hover:bg-indigo-50 hover:text-indigo-600 ${
                    value === option.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${value === option.id ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                  {option.name}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
