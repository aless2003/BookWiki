# Implementation Plan: Database-Backed Media Storage and Orphan Cleanup

This plan outlines the steps to move media storage to the database, implement a shortcode-based reference tracking system, and automate the cleanup of orphaned files.

## Phase 1: Core Media Infrastructure
Goal: Establish the database schema and services for storing and serving media.

- [ ] Task: Create `Media` Entity and Repository
    - [ ] Write tests for `MediaRepository` (CRUD operations with Blobs).
    - [ ] Implement `Media` entity with `id` (UUID), `filename`, `contentType`, `data` (Blob), and `createdAt`.
    - [ ] Implement `MediaRepository`.
- [ ] Task: Implement `MediaService` for Storage and Streaming
    - [ ] Write tests for `MediaService` (saving files, retrieving as stream).
    - [ ] Implement `save(MultipartFile)` and `getStream(UUID)` in `MediaService`.
- [ ] Task: Implement `MediaController`
    - [ ] Write tests for `GET /api/media/{uuid}` and `POST /api/media/upload`.
    - [ ] Implement endpoint to serve media with correct content-type and streaming.
    - [ ] Update upload endpoint to return the new media ID.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Core Media Infrastructure' (Protocol in workflow.md)

## Phase 2: Reference Tracking and Shortcode Integration
Goal: Implement the logic to track media usage via shortcodes and identify orphans.

- [ ] Task: Extend Shortcode System for Media
    - [ ] Write tests for parsing and resolving `#{image:uuid}` shortcodes.
    - [ ] Update backend shortcode utility to recognize and validate media shortcodes.
- [ ] Task: Implement Reference Tracking Logic
    - [ ] Write tests for reference counting (tracking usage across Chapters, Characters, and Locations).
    - [ ] Implement a `MediaReference` system (e.g., a join table or a reference counter service).
    - [ ] Add hooks to `Chapter`, `Character`, and `Location` save operations to parse content and update references.
- [ ] Task: Implement Orphan Deletion Service
    - [ ] Write tests for orphan identification (deleting media when ref count hits zero).
    - [ ] Implement `deleteIfOrphaned(UUID)` logic.
    - [ ] Ensure entity deletion triggers an orphan check for all associated media.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Reference Tracking and Shortcode Integration' (Protocol in workflow.md)

## Phase 3: Migration System
Goal: Migrate existing files and Base64 strings to the new database system.

- [ ] Task: Implement File System Migration
    - [ ] Write tests for migrating files from `uploads/` to the database.
    - [ ] Implement a one-time migration task that handles file moving and updating `pictureUrl` fields.
- [ ] Task: Implement Base64 and Attribute Migration
    - [ ] Write tests for extracting Base64 strings from HTML/TipTap JSON while preserving `width`, `height`, and styles.
    - [ ] Implement regex/parser to find Base64 images, save them as `Media`, and replace with `#{image:uuid}`.
- [ ] Task: Migration Orchestrator
    - [ ] Implement a `DataInitializer` or startup component to run migration safely.
    - [ ] Add logic to backup/clear `uploads/` only after successful migration.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Migration System' (Protocol in workflow.md)

## Phase 4: Frontend and Final Integration
Goal: Update the UI to support the new system, update project versioning, and perform final verification.

- [ ] Task: Update Frontend Media Handling
    - [ ] Update `Writing.tsx` and Worldbuilding components to use the new `/api/media` endpoints.
    - [ ] Update TipTap extensions (`ResizableImage`, `InlineImage`) to resolve `#{image:uuid}` to URLs.
- [ ] Task: Bump Project Version to 0.2.0
    - [ ] Update version in `build.gradle`, `frontend/package.json`, `frontend/src-tauri/tauri.conf.json`, and `frontend/src-tauri/Cargo.toml`.
- [ ] Task: Final System Verification
    - [ ] Verify migration of existing data.
    - [ ] Verify that new uploads are correctly tracked and deleted when orphaned.
    - [ ] Ensure image dimensions are preserved post-migration.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Frontend and Final Integration' (Protocol in workflow.md)
