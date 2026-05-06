# Project Guidelines & Mandates

> **Note:** These instructions take precedence over `requirments.md` and any other module-specific documentation.

## Core Technology Stack Overrides
- **Database:** Use **MySQL 8.4+** exclusively. All references to PostgreSQL should be ignored.
  - Use `json` column definition instead of `jsonb`.
  - Avoid PostgreSQL-specific extensions or types.
- **Java Version:** Use **Java 25** for the build toolchain and execution environment.
- **Coding Standards:** Strictly limit implementation to **Java 21 language features**.
  - **Mandatory Java 21 Features:** Records, Sealed Classes, Pattern Matching for `switch`, Virtual Threads.
  - **Restriction:** Do not use language features or APIs introduced in Java 22, 23, 24, or 25 (e.g., avoid preview features unless explicitly requested).

## Module Implementation Status
- **Module 8 (Review Module):** Completed.
  - Uses Sealed Classes for `ReviewStatus`.
  - Persists status as JSON in MySQL.
  - Decoupled from `BookService` via targeted state transition methods.

## Architectural Requirements
- **Multi-Module Gradle:** Maintain the current subproject structure.
- **GraphQL First:** All business logic must be exposed via GraphQL Queries and Mutations.
- **Persistence:** Use Spring Data JPA with Hibernate. Ensure column definitions are compatible with MySQL 8.4.
- **Concurrency:** Leverage Virtual Threads for performance-critical operations (reservations, concurrent access).
