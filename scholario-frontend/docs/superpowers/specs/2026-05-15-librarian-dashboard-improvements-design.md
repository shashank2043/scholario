# Design Spec: Librarian Dashboard Improvements

**Date:** 2026-05-15
**Topic:** Improving Librarian Hub UI/UX with Modals, Staggered Animations, and Real GraphQL Integration.

## 1. Overview
The current Librarian Dashboard uses basic HTML forms for book circulation. This project transforms it into a premium "Librarian Hub" with orchestrated animations, modal-based workflows, and real-time data integration from the `scholario-lending-module`.

## 2. Goals
- Replace static forms with tactile Action Cards that open functional Modals.
- Implement a live "Recent Circulation" log using real backend data.
- Integrate search-enabled `CustomSelect` for Students and Books in the Issuing flow.
- Apply staggered "Entrance Animations" to all dashboard elements for a premium feel.

## 3. Design & UI/UX
### 3.1. Layout
- **Hero Stats:** 4 cards (Active Issues, Overdue, Returned Today, Reservations).
- **Split View:** 
  - Left Column: Vertical Action Cards (Issue Book, Confirm Return).
  - Right Column: "Live Log" table showing recent circulation activity.

### 3.2. Animations
- **Tactile Feedback:** `btn-tactile` and `card-tactile` on all interactive elements.
- **Orchestrated Entrance:** `animate-slide-up` with staggered delays:
  - Stats: 100ms - 400ms
  - Action Cards: 500ms - 600ms
  - Circulation Table: 700ms

## 4. Architecture & Implementation
### 4.1. GraphQL Integration
**Queries:**
- `getDueDates`: Main source for the circulation log.
- `getStudentList`: For the "Student" select dropdown.
- `getAllBooks`: For the "Book" select dropdown.

**Mutations:**
- `issueBook(input: IssueInput!)`: Finalize issuance via modal.
- `returnBook(input: ReturnInput!)`: Finalize return via modal.

### 4.2. State Management
- Use `useState` for modal visibility and search filters.
- Use Apollo's `useQuery` and `useMutation`.
- Trigger `refetch` on circulation logs after successful issuance or return.

## 5. Testing Strategy
- **Visual Verification:** Ensure staggered animations run smoothly without layout shift.
- **Workflow Testing:** Test "Issue Book" flow end-to-end with real user/book selection.
- **Data Integrity:** Verify "Overdue" status is correctly reflected in the UI based on `getDueDates` data.

## 6. Plan
1. Update `LibrarianDashboard.tsx` layout to the new 4-stat + Split View structure.
2. Integrate `Modal` and `CustomSelect` into the Issue/Return workflows.
3. Replace manual ID fields with real data-driven selects.
4. Implement staggered entrance animations for all components.
5. Connect the Circulation Log table to the `getDueDates` query.
