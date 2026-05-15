# Design Spec - BookManagement Enhancements

Improve the `BookManagement` component by replacing placeholder data with real GraphQL query results and adding modern UI effects.

## Data Fetching

### 1. GraphQL Queries
We will define two new GraphQL queries in `BookManagement.tsx`:

```graphql
query GetMyProfile {
  getMyProfile {
    id
    fullName
  }
}

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
```

### 2. Implementation Strategy
- Use two `useQuery` hooks.
- The first hook fetches the current user's profile.
- The second hook fetches books for that specific user, using the `id` from the profile.
- Use the `skip` property on the second hook to prevent it from running until the profile `id` is available.

## UI/UX Enhancements

### 1. Animations
- Apply `animate-slide-up` (defined in `index.css`) to the table container or rows to provide a smooth entrance effect.

### 2. Tactile Feedback
- Apply the `btn-tactile` class (defined in `index.css`) to the following interactive elements:
  - "New Book" button
  - "Filter" button
  - "Edit" buttons in the table

### 3. Search and Filtering
- The search input will perform client-side filtering on the list of books returned by `getBooksByFaculty`.
- This ensures a fast, responsive UI without additional backend requests for every keystroke.

## Verification Plan

### Automated Tests
- N/A (Manual verification of UI and network calls).

### Manual Verification
1. Verify that `getMyProfile` is called on component mount.
2. Verify that `getBooksByFaculty` is called with the correct `facultyId`.
3. Confirm that the table displays the actual books from the database.
4. Test the search input to ensure it correctly filters the table rows.
5. Observe the slide-up animation on page load.
6. Verify tactile feedback (scaling) on button clicks.
