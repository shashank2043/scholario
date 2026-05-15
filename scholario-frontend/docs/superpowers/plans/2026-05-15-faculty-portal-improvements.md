# Faculty Portal Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Faculty Portal UI with tactile animations, functional modals, and real GraphQL data integration.

**Architecture:** Component-based approach using reusable `Modal` and `CustomSelect` primitives. Animations powered by Tailwind CSS 4 utility classes and custom keyframes.

**Tech Stack:** React 19, Tailwind CSS 4, Apollo Client (GraphQL), Lucide React.

---

### Task 1: Global Animation Classes

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add custom keyframes and utility classes**

Add the following to `src/index.css`:
```css
@theme {
  --animate-slide-up: slideUp 0.4s ease-out forwards;
  --animate-fade-in: fadeIn 0.3s ease-out forwards;
  --animate-scale-in: scaleIn 0.2s ease-out forwards;

  @keyframes slideUp {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
}

@layer components {
  .btn-tactile:active { transform: scale(0.96); }
  .card-tactile:active { transform: scale(0.98); }
}
```

- [ ] **Step 2: Commit**
```bash
git add src/index.css
git commit -m "style: add global animation utility classes"
```

---

### Task 2: Reusable Modal Component

**Files:**
- Create: `src/components/Modal.tsx`

- [ ] **Step 1: Implement the Modal component**

```tsx
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
      <div className="bg-white rounded-[2.5rem] w-full max-w-xl overflow-hidden shadow-2xl animate-slide-up relative">
        <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
          <div className="space-y-1">
            <h2 class="text-2xl font-black text-slate-900">{title}</h2>
            {subtitle && <p class="text-slate-400 text-sm font-medium">{subtitle}</p>}
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
```

- [ ] **Step 2: Commit**
```bash
git add src/components/Modal.tsx
git commit -m "feat: add reusable Modal component"
```

---

### Task 3: Reusable CustomSelect Component

**Files:**
- Create: `src/components/CustomSelect.tsx`

- [ ] **Step 1: Implement the CustomSelect component**

```tsx
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
            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-slate-100 rounded-2xl shadow-2xl z-20 py-2 max-height-[200px] overflow-y-auto animate-scale-in scrollbar-hide">
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
```

- [ ] **Step 2: Commit**
```bash
git add src/components/CustomSelect.tsx
git commit -m "feat: add CustomSelect component with hidden scroll and float"
```

---

### Task 4: FacultyDashboard Enhancements

**Files:**
- Modify: `src/features/faculty/FacultyDashboard.tsx`

- [ ] **Step 1: Implement Quick Actions and Modals**
Update `FacultyDashboard.tsx` to include `useQuery` for departments and `useMutation` for `createBook`. Add state for `isBookModalOpen`.

- [ ] **Step 2: Add tactile animations and entrance effects**
Wrap dashboard cards with `animate-slide-up` and apply `card-tactile` / `btn-tactile` classes.

- [ ] **Step 3: Commit**
```bash
git add src/features/faculty/FacultyDashboard.tsx
git commit -m "feat: enhance FacultyDashboard with modals and animations"
```

---

### Task 5: BookManagement Enhancements

**Files:**
- Modify: `src/features/faculty/BookManagement.tsx`

- [ ] **Step 1: Replace dummy data with real GraphQL query**
Use `getBooksByFaculty` query. Get `facultyId` from `getMyProfile` or `useAuth` context.

- [ ] **Step 2: Add animations to the table and buttons**
Apply `animate-slide-up` to the table rows and `btn-tactile` to action buttons.

- [ ] **Step 3: Commit**
```bash
git add src/features/faculty/BookManagement.tsx
git commit -m "feat: connect BookManagement to real GraphQL backend"
```
