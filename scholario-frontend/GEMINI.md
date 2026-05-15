# Scholario Frontend - Instructions

This document outlines the architectural patterns, state management, and engineering standards for the Scholario React frontend.

## Tech Stack
- **React 19** (Vite-powered)
- **Apollo Client** (GraphQL)
- **Tailwind CSS** (Styling)
- **Lucide React** (Icons)
- **Keycloak** (Authentication)
- **TypeScript** (Mandatory)

## Key Conventions

### 1. Feature-Based Structure
Code is organized by functional domains in `src/features/`.
- `admin/`: System oversight and security.
- `faculty/`: Authoring and course management.
- `student/`: Resource discovery and learning.
- `librarian/`: Circulation and inventory.
- `auth/`: Authentication logic and role management.
- `shared/`: Reusable components used across multiple portals.

### 2. GraphQL First
- Use `@apollo/client` for all data fetching.
- Define queries and mutations near the components using them or in a shared `queries.ts` if used globally.
- Prefer `useQuery` and `useMutation` hooks.
- **NO DUMMY DATA:** Components must fetch real data from the backend. If backend capability is missing, document it in this file.

### 3. Visual Aesthetic
- **Tactile UI:** Use the `btn-tactile` and `card-tactile` classes for interactive elements.
- **Motion:** Use `animate-slide-up` for new content entry.
- **Color Palette:** Professional slate/indigo/emerald themes.

## Current State & Gaps

### Profile Management
- `ProfileManager.tsx` in `shared/` handles fetching and updating the authenticated user's profile.
- All portal `Settings` pages must utilize this component.

### Courses
- Faculty can manage courses via `getCoursesByFaculty` and `createCourse`.
- Students see their courses (Implementation Pending: needs enrollment schema check).

### Book Search
- `searchBooks` query is the standard for both Student discovery and Librarian stock management.

### System Lockdown
- Admin Dashboard features an "Emergency Lockdown" protocol (currently triggers an alert, needs backend link).

## Testing
- Use `vitest` for unit tests (if configured).
- Always verify changes with `npm run lint`.
