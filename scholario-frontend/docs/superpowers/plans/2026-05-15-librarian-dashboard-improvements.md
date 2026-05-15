# Librarian Dashboard Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Librarian Dashboard into a premium Hub with orchestrated animations and real-time GraphQL circulation management.

**Architecture:** Split-view dashboard with Action Cards and a Live Log table. Uses shared `Modal` and `CustomSelect` primitives.

**Tech Stack:** React 19, Tailwind CSS 4, Apollo Client, Lucide React.

---

### Task 1: Librarian Hub Layout & Stats

**Files:**
- Modify: `src/features/librarian/LibrarianDashboard.tsx`

- [ ] **Step 1: Implement the new 4-card Stat header**
Replace the top section with 4 stat cards using `animate-slide-up` and staggered delays (100ms-400ms).

- [ ] **Step 2: Implement the Action Cards column**
Add the "Issue Book" and "Confirm Return" cards with `card-tactile` and `animate-slide-up` (500ms-600ms).

- [ ] **Step 3: Commit**
```bash
git add src/features/librarian/LibrarianDashboard.tsx
git commit -m "feat: implement premium Librarian Hub layout and stat cards"
```

---

### Task 2: Circulation Log Integration

**Files:**
- Modify: `src/features/librarian/LibrarianDashboard.tsx`

- [ ] **Step 1: Add the Recent Circulation table**
Implement the table on the right side of the split view. Apply `animate-slide-up` with 700ms delay.

- [ ] **Step 2: Connect to `getDueDates` query**
Fetch real circulation records and map them to the table rows.

- [ ] **Step 3: Commit**
```bash
git add src/features/librarian/LibrarianDashboard.tsx
git commit -m "feat: connect Librarian circulation log to real GraphQL backend"
```

---

### Task 3: Modal Workflows (Issue & Return)

**Files:**
- Modify: `src/features/librarian/LibrarianDashboard.tsx`

- [ ] **Step 1: Implement "Issue Book" Modal**
Use the `Modal` and `CustomSelect` components. Fetch `getStudentList` and `getAllBooks` for the dropdowns.

- [ ] **Step 2: Implement "Confirm Return" Modal**
Create a focused modal for returns using the `returnBook` mutation.

- [ ] **Step 3: Hook up Mutations**
Connect the modal "Submit" buttons to `issueBook` and `returnBook` mutations. Refetch circulation data on success.

- [ ] **Step 4: Commit**
```bash
git add src/features/librarian/LibrarianDashboard.tsx
git commit -m "feat: add modal-based book circulation workflows"
```
