# Circulation Log Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a live circulation log in the Librarian Dashboard that fetches and displays real-time book issue data from the GraphQL backend.

**Architecture:** Use Apollo's `useQuery` hook to fetch `getDueDates` data. Replace the placeholder in the right column of the `LibrarianDashboard` with a styled table component that handles loading and error states.

**Tech Stack:** React, TypeScript, Apollo Client (GraphQL), Tailwind CSS, Lucide React (icons).

---

### Task 1: Define GraphQL Query and Types

**Files:**
- Modify: `src/features/librarian/LibrarianDashboard.tsx`

- [ ] **Step 1: Add GET_DUE_DATES query and interfaces**

Add the query constant and interfaces for the response data.

```typescript
const GET_DUE_DATES = gql`
  query GetDueDates {
    getDueDates {
      id
      bookId
      userId
      issueDate
      dueDate
      returnDate
      state {
        type
      }
    }
  }
`;

interface IssueResponse {
  id: string;
  bookId: string;
  userId: string;
  issueDate: string;
  dueDate: string;
  returnDate: string | null;
  state: {
    type: string;
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/features/librarian/LibrarianDashboard.tsx
git commit -m "docs: add GraphQL query and types for circulation log"
```

---

### Task 2: Implement Circulation Log Table

**Files:**
- Modify: `src/features/librarian/LibrarianDashboard.tsx`

- [ ] **Step 1: Fetch data using useQuery**

Inside the `LibrarianDashboard` component, use the `useQuery` hook.

```typescript
const { loading, error, data } = useQuery<{ getDueDates: IssueResponse[] }>(GET_DUE_DATES);
```

- [ ] **Step 2: Replace placeholder with Table Component**

Replace the placeholder `div` (with `lg:col-span-2`) with the new table implementation.

```tsx
<div 
  className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up opacity-0" 
  style={{ animationDelay: '700ms' }}
>
  <div className="p-6 border-b border-gray-50 flex items-center justify-between">
    <h3 className="font-bold text-gray-900 flex items-center gap-2">
      <History size={18} className="text-indigo-600" />
      Recent Circulation
    </h3>
    <span className="text-xs font-medium px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg">
      Live Log
    </span>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-gray-50/50">
          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Book</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
          <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {loading ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
              Loading circulation data...
            </td>
          </tr>
        ) : error ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-rose-500 italic">
              Failed to load activity log.
            </td>
          </tr>
        ) : data?.getDueDates.length === 0 ? (
          <tr>
            <td colSpan={4} className="px-6 py-10 text-center text-gray-400 italic">
              No recent activity found.
            </td>
          </tr>
        ) : (
          data?.getDueDates.map((issue) => (
            <tr key={issue.id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="font-semibold text-gray-900">Book #{issue.bookId}</div>
                <div className="text-xs text-gray-400">ID: {issue.id.substring(0, 8)}...</div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                User #{issue.userId}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  issue.state.type === 'RETURNED' ? 'bg-emerald-100 text-emerald-800' : 
                  issue.state.type === 'OVERDUE' ? 'bg-rose-100 text-rose-800' : 
                  'bg-amber-100 text-amber-800'
                }`}>
                  {issue.state.type}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-gray-900">
                {new Date(issue.dueDate).toLocaleDateString()}
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
</div>
```

- [ ] **Step 3: Update existing animation delay**

Ensure the "Quick Tip" container and the new table have the correct animation delays as per Task 2 requirements (700ms for table).

- [ ] **Step 4: Commit**

```bash
git add src/features/librarian/LibrarianDashboard.tsx
git commit -m "feat: connect Librarian circulation log to real GraphQL backend"
```

---

### Task 3: Verification

- [ ] **Step 1: Run dev server**

Run: `npm run dev` in `scholario-frontend`

- [ ] **Step 2: Verify data display**

Open the Librarian Dashboard and ensure the table displays data fetched from the backend (or shows the "No recent activity" message if empty).

- [ ] **Step 3: Verify loading/error states**

(Optional) Temporarily mock a slow connection or error to verify UI resilience.
