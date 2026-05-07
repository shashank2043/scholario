# Scholario Project Guidelines & Mandates

## Core Technology Stack
- **Java Version:** Java 25 (Toolchain), implementing **Java 21 language features**.
- **Framework:** Spring Boot 4.0.6 with Spring GraphQL.
- **Database:** **MySQL 8.4+** (Relational).
  - Use `json` column definitions for persisting state/objects.
  - Hibernate Dialect: `org.hibernate.dialect.MySQLDialect`.
- **Build Tool:** Gradle (Multi-module).
- **Security:** OAuth 2.0 with JWT (Spring Security).

## Architectural Patterns
- **GraphQL First:** All business logic exposed via GraphQL Queries and Mutations.
- **Sealed Classes:** Used for state machines across modules (BookState, IssueState, ReviewStatus, etc.).
- **Persistence:** Hibernate `@JdbcTypeCode(SqlTypes.JSON)` for persisting Sealed Class hierarchies in MySQL.
- **Event-Driven:** Spring `ApplicationEventPublisher` for cross-module decoupled communication (e.g., Access Violations).
- **Concurrency:** Virtual Threads enabled (`spring.threads.virtual.enabled=true`).
- **Global Exception Handling:** `@ControllerAdvice` with `@GraphQlExceptionHandler` mapping exceptions (IllegalArgument, AccessDenied, etc.) to GraphQL `ErrorType` (BAD_REQUEST, FORBIDDEN, etc.).

## Security & Role-Based Access Control (RBAC)
All GraphQL resolvers must implement method-level security using `@PreAuthorize`.

### Role Hierarchy & Responsibilities:
- **`ADMIN`**: Full system access, financial management (royalties), security monitoring, and surgical data deletion.
- **`FACULTY`**: Authorial control over books, course materials, and the review process.
- **`LIBRARIAN`**: Circulation management (lending), catalog maintenance (publish/archive), and reservation allocation.
- **`STUDENT`**: Consumption of resources, self-service reservations, and profile management.

### Implementation Patterns:
- **Resource Creation/Editing**: Restricted to the owner role (e.g., `FACULTY` for books) or `ADMIN`.
  - `@PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")`
- **Catalog/Status Management**: Shared between owners and catalog staff.
  - `@PreAuthorize("hasAnyRole('FACULTY', 'LIBRARIAN', 'ADMIN')")`
- **Circulation/Operations**: Restricted to staff roles.
  - `@PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")`
- **Sensitive/System Actions**: Restricted to administrators.
  - `@PreAuthorize("hasRole('ADMIN')")`
- **Self-Service**: Open to all authenticated users or specific roles.
  - `@PreAuthorize("hasAnyRole('STUDENT', 'LIBRARIAN', 'ADMIN')")`

> **Mandate:** Any mutation that deletes records must be restricted exclusively to `ADMIN`.

## Module Implementation Status

### Module 1: Faculty Books (`scholario-book-module`)
- **Status:** Completed.
- **State Machine:** `BookState` (Sealed: DRAFT, REVIEW, PUBLISHED, ARCHIVED).
- **Features:** 
  - ISBN uniqueness and versioning control.
  - **Role-Based Access:** Mutations restricted to `FACULTY` and `ADMIN` (Librarians can also publish/archive).
  - **Faculty Ownership Validation:** `createBook` verifies the associated `facultyId` belongs to a user with the `FACULTY` role.
  - **Surgical Deletion:** Only `ADMIN` can delete book records.

### Module 2: Users & Faculty (`scholario-user-module`)
- **Status:** Completed.
- **Roles:** ADMIN, FACULTY, STUDENT, LIBRARIAN.
- **Features:** Academic hierarchy (Departments), User registration, Role assignment.

### Module 3: Courses (`scholario-course-module`)
- **Status:** Completed.
- **Features:** Course material mapping (Mandatory/Optional), Faculty-course linking.

### Module 4: Lending (`scholario-lending-module`)
- **Status:** Completed.
- **State Machine:** `IssueState` (Sealed: REQUESTED, ISSUED, RETURNED, OVERDUE).
- **Features:** 
  - Lending history, due dates, return processing.
  - **Role-Based Access:** Managed by `LIBRARIAN` and `ADMIN`.

### Module 5: Reservations (`scholario-reserve-module`)
- **Status:** Completed.
- **State Machine:** `ReservationStatus` (Sealed: PENDING, ALLOCATED, CANCELLED, EXPIRED).
- **Features:** 
  - FIFO queueing, allocation logic.
  - **Role-Based Access:** Students can reserve/cancel; `LIBRARIAN` and `ADMIN` can allocate.

### Module 6: Digital Content Access (`scholario-content-module`)
- **Status:** Completed.
- **Features:** 
  - Uploading digital content linked to books.
  - Role-based access control and DRM enforcement.
  - Access logging (VIEW, DOWNLOAD).
  - **Role-Based Access:** `FACULTY` can upload; `LIBRARIAN` and `ADMIN` manage access; All users can access if granted.

### Module 7: Licensing & Royalties (`scholario-royalty-module`)
- **Status:** Completed.
- **Features:** Royalty policies, percentage-based calculations, payout records.

### Module 8: Approval & Review (`scholario-review-module`)
- **Status:** Completed.
- **State Machine:** `ReviewStatus` (Sealed: PENDING, APPROVED, REJECTED, CHANGES_REQUESTED).
- **Features:** Feedback loops, multi-level review history.

### Module 10: Violation Detection (`scholario-violation-module`)
- **Status:** Completed.
- **Features:** 
  - `AccessLog` tracking (success/failure).
  - `ViolationReport` generation (UNAUTHORIZED_ACCESS, ACCESS_ABUSE).
  - Automatic detection of brute-force/unauthorized access (threshold-based).
  - Decoupled via `AccessDeniedEvent`.

### Module 11: Authentication (`scholario-auth-module`)
- **Status:** Completed.
- **Features:** JWT generation/validation, password encoding (BCrypt), Login/Token refresh.

### Module 12: Academic Usage & Reports (`scholario-analytics-module`)
- **Status:** Completed.
- **Features:** 
  - Aggregation of book usage (issues, reservations, digital access).
  - Course material statistics (mandatory vs optional).
  - Faculty performance tracking (authored books, courses taught, engagement).
  - Student engagement analytics (borrowing habits, content consumption).
  - **Role-Based Access:** Restricted to `LIBRARIAN`, `ADMIN`, and `FACULTY`.

### Module 13: Recommendation & Optimization (`scholario-recommendation-module`)
- **Status:** Completed.
- **Features:** 
  - Personalized book recommendations based on user history and academic context.
  - Course material suggestions based on faculty authorship and academic trends.
  - Resource demand prediction using usage analytics and risk assessment.
  - **Role-Based Access:** Recommendations for all authenticated users; Predictions/Suggestions for `FACULTY`, `LIBRARIAN`, and `ADMIN`.

## Project Metadata
- **Project Name:** Scholario
- **Base Package:** `com.scholario`
- **Port:** 8080
- **Database Name:** `scholario`
- **GraphQL Endpoint:** `/graphql`
- **GraphiQL:** Enabled
