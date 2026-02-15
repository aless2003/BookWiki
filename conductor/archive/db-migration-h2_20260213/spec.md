# Specification: Move to H2 File-Based Database

## Overview
Transition the BookWiki application from a PostgreSQL server-based architecture to a single-file, embedded database solution using **H2 (File-based mode)**. This change aims to simplify local development, improve project portability, and reduce the system's resource footprint.

## Functional Requirements
- **Database Engine Migration**: Replace PostgreSQL configuration with H2 in file-persistent mode.
- **Compatibility**: Enable H2's `PostgreSQL Compatibility Mode` to ensure existing Hibernate mappings and queries function with minimal modification.
- **Persistence**: Ensure the database file is stored within the project directory (e.g., `data/bookwiki.mv.db`) so that data persists across application restarts.
- **Developer Tooling**: Enable the H2 Web Console for easy inspection and debugging of the database during development.
- **Migration Documentation**: Provide a clear, step-by-step guide for manually exporting data from the current PostgreSQL setup and importing it into the new H2 file.

## Non-Functional Requirements
- **Resource Efficiency**: Reduced memory and CPU usage by eliminating the PostgreSQL background process.
- **Zero-Install Development**: A new developer should be able to run the project without installing or starting a database server/Docker container.

## Acceptance Criteria
- [ ] The application starts successfully without a running PostgreSQL instance.
- [ ] A `.mv.db` file is automatically created on first run in the designated directory.
- [ ] All existing features (Writing, Worldbuilding, etc.) function correctly using H2.
- [ ] The H2 Console is accessible via a browser at the designated endpoint.
- [ ] A markdown guide for manual data migration (PG to H2) is included in the project.

## Out of Scope
- Automated data migration logic implemented within the Spring Boot application code.
- Support for concurrent multi-user server environments (H2 in file mode is optimized for single-process/single-user access).