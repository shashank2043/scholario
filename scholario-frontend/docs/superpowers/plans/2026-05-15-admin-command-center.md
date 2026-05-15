# Admin Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Admin Dashboard into a professional, data-dense Command Center with real-time security logging and infrastructure management.

**Architecture:** Enterprise layout using a high-density grid and modular infrastructure panels. Integrates with user and violation backend modules.

**Tech Stack:** React 19, Tailwind CSS 4, Apollo Client, Lucide React.

---

### Task 1: Enterprise Hub Layout & Metrics

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`

- [ ] **Step 1: Implement the professional header and metrics row**
Update the UI with the Slate theme, sharp borders (`rounded-lg`), and the 4-card metric row (Violations, Pending, Critical, Node Users).

- [ ] **Step 2: Add staggered "Professional" animations**
Apply `animate-slide-up` with minimal distance (10px) and staggered delays to the header and stats.

- [ ] **Step 3: Commit**
```bash
git add src/features/admin/AdminDashboard.tsx
git commit -m "feat: implement enterprise-grade Admin Hub layout and metrics"
```

---

### Task 2: Violations Engine Integration

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`

- [ ] **Step 1: Implement the "System Violations Engine" table**
Replace the placeholder table with a data-dense version using mono-spaced timestamps and entity IDs.

- [ ] **Step 2: Connect to `getViolationReports` query**
Fetch real security alerts and map them to the table. Implement "Isolate" and "Analyze" action buttons.

- [ ] **Step 3: Commit**
```bash
git add src/features/admin/AdminDashboard.tsx
git commit -m "feat: integrate real-time security logging into Admin Hub"
```

---

### Task 3: Infrastructure Configuration Modals

**Files:**
- Modify: `src/features/admin/AdminDashboard.tsx`

- [ ] **Step 1: Implement "Department Master" Modal**
Use the shared `Modal` component. Add a form for Name and Code. Integrate the `createDepartment` mutation.

- [ ] **Step 2: Implement "Role Authorization" Modal**
Fetch `getUnassignedUsers`. List them in the modal and use a `CustomSelect` or buttons to trigger the `assignRole` mutation.

- [ ] **Step 3: Add "Emergency Lockdown" protocol**
Make the lockdown button functional with a confirmation modal (visual only for now, or log to console).

- [ ] **Step 4: Commit**
```bash
git add src/features/admin/AdminDashboard.tsx
git commit -m "feat: add infrastructure configuration modals for Admin"
```
