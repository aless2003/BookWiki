# Specification: Database-Backed Media Storage and Orphan Cleanup

## Overview
This track transitions the application from local file-system storage for uploads to a database-backed system using Large Objects (LOB). It introduces a robust reference-tracking mechanism using the existing shortcode system (`#{image:uuid}`) and implements automatic cleanup of orphaned media assets.

## Functional Requirements

### 1. Media Entity and Storage
- **Entity Definition:** Create a `Media` entity with fields: `id` (UUID), `filename`, `contentType`, `data` (LOB/Blob), and `createdAt`.
- **Database Table:** Use H2's `BLOB` type for efficient binary storage.
- **Streaming Service:** Implement a service to stream media content from the database to the HTTP response to minimize memory overhead.

### 2. Reference Tracking and Shortcodes
- **Shortcode System:** Extend the current system to support `#{image:uuid}`.
- **Reference Management:** Implement logic to track where each `Media` asset is used (Chapters, Characters, Locations).
- **Update Logic:** When an entity is saved, parse the content for `#{image:uuid}` shortcodes and update the reference association.

### 3. Orphan Cleanup
- **Triggered Deletion:** When the last reference to a `Media` asset is removed (either by editing text or deleting the parent entity), the asset must be deleted from the database.
- **Cleanup Service:** Ensure this process is transactional and handles concurrent edits safely.

### 4. Migration System
- **File System Migration:** On startup, scan the `uploads/` directory, migrate all files to the `Media` table, and update database references (e.g., `pictureUrl` fields) to use the new UUID-based format.
- **Base64 Extraction:** Scan all Chapter, Character, and Location content for Base64 encoded images. These must be extracted, saved as `Media` entries, and replaced with `#{image:uuid}` shortcodes.
- **Metadata Preservation:** **CRITICAL:** The migration logic must extract and preserve existing image attributes (e.g., `width`, `height`, `alt`, or TipTap resizing styles). These attributes must be retained in the resulting document structure so that the visual appearance (size/aspect ratio) remains unchanged.
- **Cleanup:** Once migration is verified, the original `uploads/` directory files should be removed (or moved to a backup).

### 5. API Endpoints
- **Serving Media:** `GET /api/media/{uuid}` for retrieving and displaying images.
- **Upload Endpoint:** Update the existing upload controller to save directly to the database and return the new UUID/URL.

## Non-Functional Requirements
- **Memory Efficiency:** Use LOB streaming for all database-to-frontend transfers.
- **Data Integrity:** Migration must be atomic; any failure should prevent the deletion of original files.

## Acceptance Criteria
- [ ] All files in `uploads/` are successfully moved to the database.
- [ ] All Base64 images in existing documents are replaced with shortcodes.
- [ ] **All migrated images retain their original dimensions and resizing properties.**
- [ ] Images display correctly in the frontend via the `/api/media/{uuid}` endpoint.
- [ ] Deleting an entity or removing an image from text results in the deletion of the database record.
- [ ] No regression in the Writing Studio or Worldbuilding modules.

## Out of Scope
- Support for external cloud storage (S3, etc.).
- Image processing (resizing, cropping) during the migration beyond attribute preservation.
