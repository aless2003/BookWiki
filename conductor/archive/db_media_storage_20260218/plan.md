# Implementation Plan: Database-Backed Media Storage and Orphan Cleanup

This plan outlines the steps to move media storage to the database, implement a shortcode-based reference tracking system, and automate the cleanup of orphaned files.

## Phase 1: Core Media Infrastructure [checkpoint: c0935b0]
Goal: Establish the database schema and services for storing and serving media.

- [x] Task: Create `Media` Entity and Repository
    - [x] Write tests for `MediaRepository` (CRUD operations with Blobs).
    - [x] Implement `Media` entity with `id` (UUID), `filename`, `contentType`, `data` (Blob), and `createdAt`.
    - [x] Implement `MediaRepository`.
- [x] Task: Implement `MediaService` for Storage and Streaming
    - [x] Write tests for `MediaService` (saving files, retrieving as stream).
    - [x] Implement `save(MultipartFile)` and `getStream(UUID)` in `MediaService`.
- [x] Task: Implement `MediaController`
    - [x] Write tests for `GET /api/media/{uuid}` and `POST /api/media/upload`.
    - [x] Implement endpoint to serve media with correct content-type and streaming.
    - [x] Update upload endpoint to return the new media ID.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Core Media Infrastructure' (Protocol in workflow.md)

## Phase 2: Reference Tracking and Shortcode Integration [checkpoint: 3613559]
Goal: Implement the logic to track media usage via shortcodes and identify orphans.

- [x] Task: Extend Shortcode System for Media
    - [x] Write tests for parsing and resolving `#{image:uuid}` shortcodes.
    - [x] Update backend shortcode utility to recognize and validate media shortcodes.
- [x] Task: Implement Reference Tracking Logic
    - [x] Write tests for reference counting (tracking usage across Chapters, Characters, and Locations).
    - [x] Implement a `MediaReference` system (e.g., a join table or a reference counter service).
    - [x] Add hooks to `Chapter`, `Character`, and `Location` save operations to parse content and update references.
- [x] Task: Implement Orphan Deletion Service
    - [x] Write tests for orphan identification (deleting media when ref count hits zero).
    - [x] Implement `deleteIfOrphaned(UUID)` logic.
    - [x] Ensure entity deletion triggers an orphan check for all associated media.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Reference Tracking and Shortcode Integration' (Protocol in workflow.md)

## Phase 3: Migration System [checkpoint: 1c7af46]
Goal: Migrate existing files and Base64 strings to the new database system.

- [x] Task: Implement File System Migration
    - [x] Write tests for migrating files from `uploads/` to the database.
    - [x] Implement a one-time migration task that handles file moving and updating `pictureUrl` fields.
- [x] Task: Implement Base64 and Attribute Migration
    - [x] Write tests for extracting Base64 strings from HTML/TipTap JSON while preserving `width`, `height`, and styles.
    - [x] Implement regex/parser to find Base64 images, save them as `Media`, and replace with `#{image:uuid}`.
- [x] Task: Migration Orchestrator
    - [x] Implement a `DataInitializer` or startup component to run migration safely.
    - [x] Add logic to backup/clear `uploads/` only after successful migration.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Migration System' (Protocol in workflow.md)

## Phase 4: Frontend and Final Integration [checkpoint: b3253e5]
Goal: Update the UI to support the new system, update project versioning, and perform final verification.

- [x] Task: Update Frontend Media Handling
    - [x] Update `Writing.tsx` and Worldbuilding components to use the new `/api/media` endpoints.
    - [x] Update TipTap extensions (`ResizableImage`, `InlineImage`) to resolve `#{image:uuid}` to URLs.
- [x] Task: Bump Project Version to 0.2.0
    - [x] Update version in `build.gradle`, `frontend/package.json`, `frontend/src-tauri/tauri.conf.json`, and `frontend/src-tauri/Cargo.toml`.
- [x] Task: Final System Verification
    - [x] Verify migration of existing data.
    - [x] Verify that new uploads are correctly tracked and deleted when orphaned.
    - [x] Ensure image dimensions are preserved post-migration.
- [x] Task: Conductor - User Manual Verification 'Phase 4: Frontend and Final Integration' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 1444f09
