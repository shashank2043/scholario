# Scholario GraphiQL Operations Manual

This document provides a step-by-step testing manual for the Scholario GraphQL API using GraphiQL.

## How to Use
1.  **Query Pane:** Copy the GraphQL code into the main "Query" pane.
2.  **Variables Pane:** Copy the JSON from the "Variables" section into the "Query Variables" pane (bottom left).
3.  **Auth Headers:** For authenticated requests, add the following to the "HTTP HEADERS" pane:
    ```json
    { "Authorization": "Bearer YOUR_TOKEN_HERE" }
    ```

---

## 1. Authentication & Registration

### [1.1] Register a New User
Run this to create an account. Change the role to `ADMIN`, `FACULTY`, `STUDENT`, or `LIBRARIAN`.

**Query:**
```graphql
mutation RegisterUser($input: UserInput!) {
  registerUser(input: $input) {
    id
    username
    email
    fullName
    role
  }
}
```

**Variables:**
```json
{
  "input": {
    "username": "faculty_jane",
    "password": "Password123!",
    "email": "jane@scholario.edu",
    "fullName": "Jane Doe",
    "role": "FACULTY"
  }
}
```

### [1.2] Login
Use the credentials you registered with. Copy the `accessToken` for future requests.

**Query:**
```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    accessToken
    refreshToken
    tokenType
    expiresIn
    user {
      id
      username
      role
    }
  }
}
```

**Variables:**
```json
{
  "input": {
    "username": "faculty_jane",
    "password": "Password123!"
  }
}
```

### [1.3] Refresh Token
**Query:**
```graphql
mutation RefreshToken($refreshToken: String!) {
  refreshToken(refreshToken: $refreshToken) {
    accessToken
    refreshToken
    tokenType
  }
}
```

### [1.4] Validate Token
**Query:**
```graphql
query ValidateToken($token: String!) {
  validateToken(token: $token) {
    valid
    username
    role
    expiresAt
  }
}
```

---

## 2. User & Profile Management

### [2.1] Get My Profile
**Query:**
```graphql
query GetUserById($id: ID!) {
  getUserById(id: $id) {
    id
    username
    fullName
    role
    department {
      name
      code
    }
  }
}
```

### [2.2] Update My Profile
**Query:**
```graphql
mutation UpdateUserProfile($id: ID!, $input: ProfileInput!) {
  updateUserProfile(id: $id, input: $input) {
    id
    fullName
    email
  }
}
```

### [2.3] List All Faculty
**Query:**
```graphql
query GetFacultyList {
  getFacultyList {
    id
    fullName
    email
  }
}
```

### [2.4] Assign Role (ADMIN ONLY)
**Query:**
```graphql
mutation AssignRole($userId: ID!, $role: Role!) {
  assignRole(userId: $userId, role: $role) {
    id
    role
  }
}
```

---

## 3. Book Management

### [3.1] Create a New Book (DRAFT)
**Query:**
```graphql
mutation CreateBook($input: BookInput!) {
  createBook(input: $input) {
    id
    title
    isbn
    state {
      type
    }
  }
}
```

### [3.2] Publish Book
**Query:**
```graphql
mutation PublishBook($id: ID!) {
  publishBook(id: $id) {
    id
    state {
      type
    }
  }
}
```

### [3.3] Search Books
**Query:**
```graphql
query SearchBooks($title: String, $isbn: String) {
  searchBooks(title: $title, isbn: $isbn) {
    id
    title
    isbn
    state {
      type
    }
  }
}
```

---

## 4. Reviews & Approvals

### [4.1] Submit Book for Review
**Query:**
```graphql
mutation SubmitForReview($bookId: ID!, $reviewerId: ID) {
  submitBookForReview(bookId: $bookId, reviewerId: $reviewerId) {
    id
    status
  }
}
```

### [4.2] Approve Review
**Query:**
```graphql
mutation ApproveBook($requestId: ID!, $feedback: String) {
  approveBook(requestId: $requestId, feedback: $feedback) {
    id
    status
    feedback
  }
}
```

---

## 5. Courses & Materials

### [5.1] Create a Course
**Query:**
```graphql
mutation CreateCourse($input: CourseInput!) {
  createCourse(input: $input) {
    id
    courseCode
    title
  }
}
```

### [5.2] Assign Book to Course
**Query:**
```graphql
mutation AssignBookToCourse($input: CourseMaterialInput!) {
  assignBookToCourse(input: $input) {
    id
    mandatory
  }
}
```

---

## 6. Reservations

### [6.1] Reserve a Book
**Query:**
```graphql
mutation ReserveBook($input: ReservationInput!) {
  reserveBook(input: $input) {
    id
    status
    reservedAt
  }
}
```

### [6.2] Allocate Reserved Book
**Query:**
```graphql
mutation AllocateReservedBook($bookId: ID!) {
  allocateReservedBook(bookId: $bookId) {
    id
    userId
    status
    expiresAt
  }
}
```

---

## 7. Lending

### [7.1] Issue Book
**Query:**
```graphql
mutation IssueBook($input: IssueInput!) {
  issueBook(input: $input) {
    id
    dueDate
    state {
      type
    }
  }
}
```

### [7.2] Return Book
**Query:**
```graphql
mutation ReturnBook($input: ReturnInput!) {
  returnBook(input: $input) {
    id
    returnDate
    penaltyAmount
    state {
      type
    }
  }
}
```

---

## 8. Royalties

### [8.1] Define Royalty Policy
**Query:**
```graphql
mutation DefineRoyaltyPolicy($input: RoyaltyPolicyInput!) {
  defineRoyaltyPolicy(input: $input) {
    id
    royaltyPercentage
  }
}
```

### [8.2] Calculate Payout
**Query:**
```graphql
mutation CalculateRoyalty($bookId: ID!, $totalRevenue: Float!) {
  calculateRoyalty(bookId: $bookId, totalRevenue: $totalRevenue) {
    id
    calculatedRoyalty
    payoutStatus
  }
}
```

---

## 9. Violations

### [9.1] Get Violation Reports
**Query:**
```graphql
query GetViolationReports {
  getViolationReports {
    username
    type
    severity
    description
  }
}
```

---

## 10. Digital Content

### [10.1] Upload Digital Content
**Query:**
```graphql
mutation UploadContent($input: DigitalContentInput!) {
  uploadDigitalContent(input: $input) {
    id
    contentUrl
  }
}
```

---

## 11. Analytics

### [11.1] Get Book Usage Analytics
**Query:**
```graphql
query BookAnalytics($bookId: ID!) {
  getBookUsageAnalytics(bookId: $bookId) {
    totalIssues
    totalReservations
    digitalAccessCount
  }
}
```

---

## 12. Recommendations

### [12.1] Recommend Books
**Query:**
```graphql
query Recommend($userId: ID!) {
  recommendBooks(userId: $userId) {
    bookId
    title
    recommendationReason
    confidenceScore
  }
}
```

---

## 13. Notifications

### [13.1] Get My Notifications
**Query:**
```graphql
query GetNotifications($userId: ID!) {
  getNotificationsByUser(userId: $userId) {
    id
    message
    read
  }
}
```

---

## 14. Subscriptions (Real-Time)

### [14.1] Watch Book Publications
**Subscription:**
```graphql
subscription OnBookPublished {
  bookPublished {
    message
    relatedEntityId
  }
}
```
