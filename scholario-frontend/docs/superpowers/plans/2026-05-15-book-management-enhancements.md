# BookManagement Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect `BookManagement` to the real GraphQL backend using `getMyProfile` and `getBooksByFaculty`, and add tactile animations.

**Architecture:** Sequential data fetching with Apollo hooks (Profile -> Books) and client-side filtering for search.

**Tech Stack:** React, Apollo Client, Tailwind CSS.

---

### Task 1: Define GraphQL Queries

**Files:**
- Modify: `src/features/faculty/BookManagement.tsx`

- [ ] **Step 1: Define GET_MY_PROFILE and GET_BOOKS_BY_FACULTY queries**

```typescript
const GET_MY_PROFILE = gql`
  query GetMyProfile {
    getMyProfile {
      id
      fullName
    }
  }
`;

const GET_BOOKS_BY_FACULTY = gql`
  query GetBooksByFaculty($facultyId: ID!) {
    getBooksByFaculty(facultyId: $facultyId) {
      id
      title
      isbn
      state {
        type
      }
      createdAt
    }
  }
`;
```

- [ ] **Step 2: Commit**

```bash
git add src/features/faculty/BookManagement.tsx
git commit -m "feat(faculty): define GraphQL queries for profile and books"
```

---

### Task 2: Implement Data Fetching Logic

**Files:**
- Modify: `src/features/faculty/BookManagement.tsx`

- [ ] **Step 1: Replace SEARCH_BOOKS_QUERY with sequential fetching hooks**

```typescript
// Replace SEARCH_BOOKS_QUERY usage with:
const { data: profileData, loading: profileLoading, error: profileError } = useQuery(GET_MY_PROFILE);

const { data: booksData, loading: booksLoading, error: booksError } = useQuery(GET_BOOKS_BY_FACULTY, {
  variables: { facultyId: profileData?.getMyProfile?.id },
  skip: !profileData?.getMyProfile?.id
});
```

- [ ] **Step 2: Update loading and error states to handle both queries**

```typescript
const loading = profileLoading || booksLoading;
const error = profileError || booksError;
const books = booksData?.getBooksByFaculty || [];
```

- [ ] **Step 3: Commit**

```bash
git add src/features/faculty/BookManagement.tsx
git commit -m "feat(faculty): implement sequential data fetching for BookManagement"
```

---

### Task 3: Implement Client-side Search and UI Enhancements

**Files:**
- Modify: `src/features/faculty/BookManagement.tsx`

- [ ] **Step 1: Add search state and filter logic**

```typescript
const [searchTerm, setSearchTerm] = useState("");

const filteredBooks = books.filter(book => 
  book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  book.isbn.toLowerCase().includes(searchTerm.toLowerCase())
);
```

- [ ] **Step 2: Update UI with animations and tactile classes**

```tsx
// Add animate-slide-up to table container
<div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden animate-slide-up">

// Add btn-tactile to buttons
<button className="btn-tactile flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
<button className="btn-tactile flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
<button className="btn-tactile text-indigo-600 hover:text-indigo-800 font-medium text-sm">Edit</button>

// Update Search input to use searchTerm state
<input
  type="text"
  placeholder="Search your books..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
/>
```

- [ ] **Step 3: Update table mapping to use filteredBooks**

```tsx
{filteredBooks.map((book: any) => ( ... ))}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/faculty/BookManagement.tsx
git commit -m "feat(faculty): add client-side search and tactile UI enhancements"
```
