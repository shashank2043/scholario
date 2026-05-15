# Design Spec: Admin Command Center Improvements

**Date:** 2026-05-15
**Topic:** Re-architecting the Admin Portal with an Enterprise-grade UI and real-time System Monitoring.

## 1. Overview
The Admin Portal is being upgraded from a basic dashboard to a high-density "Command Center." The focus is on technical precision, data density, and professional aesthetics. It will integrate real-time security monitoring and infrastructure configuration tools.

## 2. Goals
- **Professional Aesthetic:** Transition to a sharper, high-contrast UI with enterprise-grade typography.
- **Security Monitoring:** Implement a real-time "Violations Engine" table using backend data.
- **Infrastructure Control:** Functional modals for "Department Master" and "Role Authorization."
- **Tactile Precision:** Physical feedback on all operational buttons and configuration cards.

## 3. Design & UI/UX
### 3.1. Visual Language
- **Palette:** Slate background (`#F1F5F9`), White panels, Indigo accents, and Rose emergency indicators.
- **Borders:** Professional radius (`0.5rem` to `0.75rem`) instead of large consumer-style rounds.
- **Typography:** Mono-spaced fonts for technical identifiers and timestamps; uppercase tracking for headers.

### 3.2. Layout Components
- **Control Header:** Global system status with an "Emergency Lockdown" protocol button.
- **Metrics Grid:** 4 data-dense cards showing Violations, Pending Actions, Critical Alerts, and Node Load.
- **Operational Log:** High-density table for the system violations engine.
- **Action Sidebar:** Configuration cards for core infrastructure tasks.

## 4. Architecture & Implementation
### 4.1. GraphQL Integration
**Queries:**
- `getViolationReports`: Main feed for the security log.
- `getDepartments`: List all academic units.
- `getUnassignedUsers`: Identify users pending role authorization.
- `getStudentList` / `getFacultyList`: For role auditing.

**Mutations:**
- `createDepartment(input: DepartmentInput!)`: For the Department Master modal.
- `assignRole(userId: ID!, role: Role!)`: For the Role Authorization workflow.

### 4.2. Modal Workflows
- **Department Modal:** Simple form to create new departments (Name, Code).
- **Audit Modal:** List unassigned users and allow the admin to select and assign roles via the `assignRole` mutation.

## 5. Plan
1. Update `AdminDashboard.tsx` to the "Enterprise" layout (Header, Stats, Split Grid).
2. Connect the "System Violations Engine" table to the real `getViolationReports` query.
3. Implement the "Department Master" modal with `createDepartment` mutation.
4. Implement the "Role Authorization" modal with `getUnassignedUsers` and `assignRole`.
5. Apply professional tactile animations (`scale-98`) to all controls.
