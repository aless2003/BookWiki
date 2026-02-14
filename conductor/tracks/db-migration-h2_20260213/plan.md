# Implementation Plan: Move to H2 File-Based Database

## Phase 1: Infrastructure & Dependency Management [checkpoint: d25deb4]
- [x] Task: Update `build.gradle` dependencies
    - [ ] Add `runtimeOnly 'com.h2database:h2'`
    - [ ] Keep `postgresql` for now (to facilitate migration) but remove `spring-boot-docker-compose` or disable it in properties.
- [x] Task: Configure `application.properties` for H2
    - [ ] Set `spring.datasource.url` to `jdbc:h2:file:./data/bookwiki;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH`
    - [ ] Set `spring.datasource.driver-class-name` to `org.h2.Driver`
    - [ ] Update `spring.jpa.properties.hibernate.dialect` to `org.hibernate.dialect.H2Dialect`
    - [ ] Enable H2 Console: `spring.h2.console.enabled=true`
- [x] Task: Create data directory
    - [ ] Ensure the `./data` directory exists or is automatically created by the connection string.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md)

## Phase 2: Feature Validation & Persistence
- [ ] Task: Verify Database Schema Generation
    - [ ] Start the application and check if `data/bookwiki.mv.db` is created.
    - [ ] Access `/h2-console` and verify that all tables (chapters, stories, characters, etc.) are present.
- [ ] Task: Regression Test: Core Writing Features
    - [ ] Create a Story and Chapter.
    - [ ] Verify auto-save and note synchronization.
- [ ] Task: Regression Test: Worldbuilding Features
    - [ ] Create a Character with an image and traits.
    - [ ] Create a Location and an Item.
    - [ ] Verify Deep Linking (CTRL+Click) still resolves correctly.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Feature Validation' (Protocol in workflow.md)

## Phase 3: Documentation & Cleanup
- [ ] Task: Create Manual Data Migration Guide
    - [ ] Create `docs/MANUAL_MIGRATION.md`.
    - [ ] Include instructions for `pg_dump --column-inserts` and H2 console import.
- [ ] Task: Update Project Documentation
    - [ ] Update `README.md` to reflect that PostgreSQL/Docker is no longer required.
    - [ ] Update `compose.yaml` (comment out or remove Postgres service).
- [ ] Task: Final Cleanup
    - [ ] Remove PostgreSQL dependency from `build.gradle` if migration is deemed complete.
    - [ ] Run `bun run lint` and `./gradlew build -x test` to ensure project integrity.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Documentation and Cleanup' (Protocol in workflow.md)

## Phase: Review Fixes
- [ ] Task: Apply review suggestions 5a8967b
