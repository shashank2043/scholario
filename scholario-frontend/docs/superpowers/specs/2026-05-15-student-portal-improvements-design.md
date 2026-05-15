# Design Spec: Student Portal Improvements

**Date:** 2026-05-15
**Topic:** Improving Student Portal UI/UX with Tactile Animations and real GraphQL Integration.

## 1. Overview
The Student Portal is being transformed from a simple list into a "Library Hub." The focus is on tracking deadlines (borrowed books), financial visibility (fines), and resource discovery.

## 2. Goals
- **Premium Library Hub:** Implement a high-polish dashboard with orchestrated entrance animations.
- **Deadline Management:** Clear visual indicators for books "Due Soon."
- **Financial Transparency:** Real-time visibility into pending fines and payments.
- **Resource Discovery:** Integrated "Quick Search" for library assets.

## 3. Design & UI/UX
### 3.1. Visual Style
- **Palette:** Indigo and Emerald (Positive academic vibe).
- **Animations:** Staggered `animate-slide-up` (100ms-400ms) for the stats and lists.
- **Tactile:** `scale-96` active states for buttons and `scale-98` for cards.

### 3.2. Components
- **Stats Grid:** 4 cards (Books Held, Due Soon, Total Fines, Reservations).
- **Active Loans List:** Detailed view of currently borrowed books with renewal and download actions.
- **Discovery Card:** Indigo-themed search engine.

## 4. Architecture & Implementation
### 4.1. GraphQL Integration
**Queries:**
- `getMyIssuedBooks`: Populate the "Active Loans" section.
- `getMyIssueHistory`: For the borrow history view.
- `searchBooks(title: String, isbn: String)`: For the discovery engine.

### 4.2. Plan
1. Update `StudentDashboard.tsx` with the new Layout (Header, Stats, Content Grid).
2. Connect "Currently Borrowed" section to the `getMyIssuedBooks` backend query.
3. Implement the "Quick Search" functionality using the `searchBooks` query.
4. Add "Request Renewal" and "Download Digital" buttons with tactile feedback.
5. Apply orchestrated animations across the entire dashboard.
