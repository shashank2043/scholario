# Scholario - Project Instructions

Scholario is a comprehensive Faculty Book & Academic Resource Management System built with Spring Boot and Spring GraphQL. It follows a multi-module Gradle architecture and utilizes modern Java 21/25 features.

## Project Overview

- **Purpose:** Manage academic resources, faculty-authored books, course materials, lending, reservations, royalties, and analytics.
- **Architecture:** Multi-module Gradle project with 14 specialized modules.
- **API Style:** GraphQL-First. All business logic is exposed via GraphQL queries, mutations, and subscriptions.
- **Communication:** Event-driven using Spring's `ApplicationEventPublisher`.

## Technology Stack

- **Java:** JDK 25 (Toolchain) with Java 21 features.
- **Spring Boot:** 4.0.6
- **Spring GraphQL:** 1.3.x
- **Build Tool:** Gradle 9.4.1
- **Database:** MySQL 8.4+ (Production), H2 (Testing).
- **ORM:** Hibernate 6.x.
- **Concurrency:** Virtual Threads enabled (`spring.threads.virtual.enabled=true`).

## Module Structure

Each module (e.g., `scholario-book-module`) follows this internal structure:

```
scholario-*-module/
├── src/main/java/com/scholario/*/
│   ├── config/        # Module-specific configuration
│   ├── dto/           # GraphQL DTOs (Records preferred)
│   ├── model/         # JPA entities and State Sealed Classes
│   ├── repository/    # Spring Data JPA repositories
│   ├── resolver/      # GraphQL query/mutation resolvers
│   └── service/       # Business logic
└── src/main/resources/graphql/*.graphqls  # GraphQL schema
```

## Core Workflows & Commands

### Building and Running

- **Build Project:** `./gradlew build`
- **Run Application:** `./gradlew :app:bootRun`
- **Run All Tests:** `./gradlew test`
- **Run Module Tests:** `./gradlew :<module-name>:test`
- **Run Single Test:** `./gradlew :<module-name>:test --tests "com.scholario.ClassName"`

### Access Points

- **GraphQL Endpoint:** `http://localhost:8080/graphql`
- **GraphiQL UI:** `http://localhost:8080/graphiql` (Enabled in dev)
- **H2 Console:** `http://localhost:8080/h2-console` (For testing)

## Development Conventions

### 1. GraphQL First
- Define schema in `.graphqls` files within module resources.
- Implement corresponding resolvers in the `resolver` package.
- Use Records for GraphQL DTOs to ensure immutability and clarity.

### 2. Modern Java Features
- **Virtual Threads:** Use for high-concurrency tasks (already enabled globally).
- **Sealed Classes:** Mandatory for representing state machines (e.g., `BookState`, `IssueState`).
- **Pattern Matching:** Use in switch expressions when handling sealed class hierarchies.

### 3. Persistence
- **MySQL JSON:** Use `@JdbcTypeCode(SqlTypes.JSON)` to persist sealed state hierarchies directly as JSON columns.
- **Repositories:** Use Spring Data JPA `JpaRepository` or `CrudRepository`.

### 4. Testing
- **JUnit 5 & Mockito:** Standard for unit and integration testing.
- **Resolver Testing:** Always include tests for GraphQL resolvers using `@GraphQlTest` or manual service mocking.

### 5. Cross-Module Interaction
- Avoid direct dependencies between modules where possible.
- Use Spring's `ApplicationEventPublisher` for asynchronous or decoupled communication between modules.

## Security

- **OAuth 2.0 / JWT:** Managed by `scholario-auth-module`.
- **Roles:** `ADMIN`, `FACULTY`, `LIBRARIAN`, `STUDENT`.
- **Authorization:** Use Spring Security's `@PreAuthorize` or GraphQL-specific interceptors for role-based access control.

## State Machines

- **Book Flow:** `DRAFT` → `REVIEW` → `PUBLISHED` → `ARCHIVED`.
- **Lending Flow:** `REQUESTED` → `ISSUED` → `RETURNED` / `OVERDUE`.
