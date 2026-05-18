# Design Spec: Faculty Portal Improvements

**Date:** 2026-05-15
**Topic:** Improving Faculty Portal UI/UX with Modals, Tactile Animations, and Real GraphQL Integration.

## 1. Overview
The current Faculty Portal has several non-functional buttons and a static UI. This project aims to bring the portal to life by implementing functional modals for key actions, introducing modern tactile animations, and replacing dummy data with real backend GraphQL integrations.

## 2. Goals
- Make all "Quick Action" buttons on the Faculty Dashboard functional.
- Implement a "Draft New Book" modal with a custom themed dropdown for departments.
- Add tactile feedback (`active:scale`) and smooth transitions (`animate-slide-up`) to all interactive elements.
- Connect the frontend to the backend GraphQL API using real endpoints (avoiding old tester endpoints).

## 3. Design & UI/UX
### 3.1. Visual Style
- **Palette:** Slate and Indigo (Modern academic feel).
- **Animations:**
  - `active:scale-95`: Tactical feedback for buttons.
  - `active:scale-98`: Tactical feedback for cards.
  - `animate-slide-up`: Entrance animation for cards and modals.
  - `animate-fade-in`: Backdrop entrance for modals.
- **Glassmorphism:** Use `backdrop-blur-md` for modal overlays.

### 3.2. Components
- **Reusable Modal:** A generic `Modal` component in `src/components` with smooth entry/exit.
- **Custom Dropdown:** A theme-aligned `Select` component with internal scrolling and floating behavior to prevent overflow.

## 4. Architecture & Implementation
### 4.1. GraphQL Integration
We will use `@apollo/client` (already in `package.json`) to connect to the following real backend endpoints:

**Queries:**
- `getBooksByFaculty(facultyId: ID!)`: To populate the "My Books" table.
- `getDepartments`: To populate the "Department" dropdown in the "Draft New Book" modal.
- `getMyProfile`: To get the current faculty's ID for mutations.

**Mutations:**
- `createBook(input: BookInput!)`: Triggered from the "Draft New Book" modal.
- `createCourse(input: CourseInput!)`: Triggered from the "Assign Course" modal.

### 4.2. State Management
- Use React `useState` for modal visibility and form state.
- Use Apollo's `useQuery` and `useMutation` for data fetching and updates.
- Invalidate/Refetch `getBooksByFaculty` after a successful `createBook` mutation.

## 5. Error Handling
- Visual feedback (red borders/text) for validation errors in forms.
- Toast notifications (or simple UI messages) for GraphQL errors or successful actions.

## 6. Testing Strategy
- **Manual Verification:** Test the "Draft New Book" flow end-to-end.
- **Visual Check:** Verify animations feel responsive and drop-downs don't overflow on small screens.
- **Integration Test:** Verify data persists in the backend after mutation.

## 7. Plan
1. Create shared `Modal` and `CustomSelect` components.
2. Update `FacultyDashboard.tsx` to include modal logic for "Draft New Book".
3. Implement `createBook` mutation integration.
4. Update `BookManagement.tsx` to replace dummy table data with `getBooksByFaculty` results.
5. Add animations to all buttons across the Faculty features.
