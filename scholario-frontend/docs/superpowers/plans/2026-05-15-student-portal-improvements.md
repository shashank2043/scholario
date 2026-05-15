# Student Portal Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Student Portal into a premium "Library Hub" with orchestrated animations and real-time circulation management.

**Architecture:** Modern React layout with staggered animations and deep GraphQL integration for lending data.

**Tech Stack:** React 19, Tailwind CSS 4, Apollo Client, Lucide React.

---

### Task 1: Student Hub Layout & Stats

**Files:**
- Modify: `src/features/student/StudentDashboard.tsx`

- [ ] **Step 1: Implement the new 4-card Stat header**
Add stats for "Books Held," "Due Soon," "Total Fines," and "Reservations" with staggered entrance animations (100ms-400ms).

- [ ] **Step 2: Add tactile animations to the header buttons**
Apply `btn-tactile` to "Borrow History" and "Search Books" buttons.

- [ ] **Step 3: Commit**
```bash
git add src/features/student/StudentDashboard.tsx
git commit -m "feat: implement premium Student Hub layout and stat cards"
```

---

### Task 2: Active Loans Integration

**Files:**
- Modify: `src/features/student/StudentDashboard.tsx`

- [ ] **Step 1: Implement the "Currently Borrowed" list**
Replace the simple list with a high-density version featuring book details, ISBN, and status badges (Secure/Due Soon/Overdue).

- [ ] **Step 2: Connect to `getMyIssuedBooks` query**
Use real backend data and handle loading/empty states with premium UI.

- [ ] **Step 3: Commit**
```bash
git add src/features/student/StudentDashboard.tsx
git commit -m "feat: integrate real-time active loans into Student Hub"
```

---

### Task 3: Discovery Engine & Financial Card

**Files:**
- Modify: `src/features/student/StudentDashboard.tsx`

- [ ] **Step 1: Implement the "Quick Search" card**
Create an Indigo-themed search card with a focused input and tactile search button.

- [ ] **Step 2: Implement the "Payments & Fines" card**
Add a summary card for financial data with tactile hover effects.

- [ ] **Step 3: Commit**
```bash
git add src/features/student/StudentDashboard.tsx
git commit -m "feat: add Discovery and Financial visibility to Student Hub"
```
