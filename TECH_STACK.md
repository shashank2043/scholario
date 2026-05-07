# Scholario Technology Stack Inventory

This document provides a comprehensive overview of the technologies, frameworks, and library versions used across the Scholario multi-module project.

## Core Infrastructure

| Technology | Version | Scope |
| :--- | :--- | :--- |
| **Java (JDK)** | 25 (Toolchain) / 21 Features | Global |
| **Gradle** | 9.4.1 | Global |
| **Spring Boot** | 4.0.6 | Global (BOM Managed) |
| **Spring Dependency Management** | 1.1.7 | Global |
| **Spring Framework** | 6.2.x (via Boot 4.0.6) | Global |
| **Spring GraphQL** | 1.3.x (via Boot 4.0.6) | Global |
| **MySQL Connector/J** | Managed by Boot 4.0.6 | Runtime (Persistence) |
| **Hibernate** | Managed by Boot 4.0.6 | Runtime (Persistence) |

---

## Module-Specific Dependencies & Testing

| Module | Core Logic | GraphQL | Persistence | Unit Testing |
| :--- | :--- | :--- | :--- | :--- |
| **app** | Web, Security | Enabled | JPA/MySQL/H2 | No |
| **scholario-user-module** | User/Role | Enabled | JPA/MySQL | **Yes (Service & Resolver)** |
| **scholario-book-module** | Book/State | Enabled | JPA/MySQL | **Yes (Service & Resolver)** |
| **scholario-course-module** | Course/Maps | Enabled | JPA/MySQL | **Yes (Service & Resolver)** |
| **scholario-lending-module** | Issue/Return| Enabled | JPA/MySQL | **Yes (Service & Resolver)** |
| **scholario-auth-module** | JWT/Auth | Enabled | JPA/MySQL | No |
| **scholario-reserve-module**| Reservation | Enabled | JPA/MySQL | No |
| **scholario-review-module** | Peer Review | Enabled | JPA/MySQL | No |
| **scholario-royalty-module**| Royalty/Calc| Enabled | JPA/MySQL | No |
| **scholario-notification**  | Real-time | Enabled | JPA/MySQL | No |
| **scholario-analytics**     | Aggregation | Enabled | JPA/MySQL | No |
| **scholario-content**       | Digital/DRM | Enabled | JPA/MySQL | No |
| **scholario-recommend**     | Suggestions | Enabled | JPA/MySQL | No |
| **scholario-violation**     | Security/Log| Enabled | JPA/MySQL | No |

---

## Shared Technology Standards

- **Java Version:** Java 25 Toolchain targeting Java 21 language features (Virtual Threads, Pattern Matching, Sealed Classes).
- **Virtual Threads:** Enabled project-wide via `spring.threads.virtual.enabled=true`.
- **Database:** MySQL 8.4+ for production; H2 used for local testing in the `app` module.
- **Unit Testing:** JUnit 5 (JUnit Jupiter) and Mockito are used exclusively for the 4 core modules (User, Book, Course, Lending).
- **Lombok:** Used extensively for boilerplate reduction (Getters, Setters, Constructors, Builders).
- **JSON Persistence:** Sealed class hierarchies are persisted as JSON in MySQL using `@JdbcTypeCode(SqlTypes.JSON)`.
