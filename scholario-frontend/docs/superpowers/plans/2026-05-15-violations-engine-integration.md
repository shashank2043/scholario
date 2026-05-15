# Violations Engine Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the "System Violations Engine" table with real backend integration, timestamps, and administrative operations.

**Architecture:** Update `AdminDashboard.tsx` to include additional columns and action buttons in the violations table.

**Tech Stack:** React, Apollo Client (GraphQL), Tailwind CSS, Lucide React icons.

---

### Task 1: Update Violations Table Structure and Actions

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`

- [ ] **Step 1: Import Link from react-router-dom**

```tsx
import { Link } from 'react-router-dom';
```

- [ ] **Step 2: Add "Detected At" column and "Actions" column to the table header**

```tsx
<th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detected At</th>
<th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
```

- [ ] **Step 3: Update table body to include Detected At timestamp and Action buttons**

```tsx
<td className="px-6 py-4 text-[11px] text-slate-500 font-mono">{new Date(v.detectedAt).toLocaleString()}</td>
<td className="px-6 py-4 space-x-2">
  <button className="px-2 py-1 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest rounded btn-tactile">Isolate</button>
  <button className="px-2 py-1 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded btn-tactile">Resolve</button>
</td>
```

- [ ] **Step 4: Update "Full Audit Log" button to use Link**

```tsx
<Link to="/admin/security" className="text-[11px] text-slate-500 font-bold uppercase hover:text-slate-900 transition-colors tracking-widest">Full Audit Log &rarr;</Link>
```

- [ ] **Step 5: Verify implementation and formatting**

---

### Task 2: Verification

- [ ] **Step 1: Check table layout for alignment**
- [ ] **Step 2: Verify timestamp formatting**
- [ ] **Step 3: Verify button styling and tactile feedback**
- [ ] **Step 4: Commit changes**
