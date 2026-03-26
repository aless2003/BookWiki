# Implementation Plan: Species Custom Section Template Inheritance

## Phase 1: Database and Backend Model Updates
- [x] Task: Update `CustomSection` entity.
    - [x] Add `boolean isInheritable` flag.
    - [x] Add `Long inheritedFromSectionId` (nullable) to track lineage and facilitate updates.
- [x] Task: Update DTOs and Mappers. (N/A - entities used directly)
    - [x] Expose the new properties in API responses.
- [x] Task: Write tests for backend model changes.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Database and Backend Model Updates' (Protocol in workflow.md)

## Phase 2: Core Inheritance Logic (Initial Copy) [checkpoint: d47d010]
- [x] Task: Implement backend logic for initial inheritance.
    - [x] Modify the logic for fetching/saving a Species. When a child species is loaded or saved, verify if its parent has `isInheritable` sections that the child does not yet possess (matching by section title or `inheritedFromSectionId`).
    - [x] If missing, automatically instantiate these sections on the child, copying the HTML content from the parent, and setting `inheritedFromSectionId`.
- [x] Task: Write tests for initial inheritance logic.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Core Inheritance Logic (Initial Copy)' (Protocol in workflow.md)

## Phase 3: Smart Merge Logic (Updates) [checkpoint: d999fcf]
- [x] Task: Research and implement HTML/Rich Text Smart Merge algorithm.
    - [ ] **Crucial:** Develop an algorithm (likely in the backend using `jsoup` or similar HTML parsing) that can take an updated Parent HTML string and a customized Child HTML string, and intelligently merge new structural elements (e.g., table rows/columns) without destroying text nodes in the Child.
    - [ ] *Alternative:* If full smart merge is too complex for rich text, implement a fallback strategy (e.g., appending the new parent template below the child's content with a warning).
- [x] Task: Implement Parent Update propagation.
    - [x] When a parent species is saved, detect if any `isInheritable` sections were modified.
    - [x] If so, find all descendant child sections matching the `inheritedFromSectionId`.
    - [x] Apply the Smart Merge algorithm and save the updated child sections.
- [x] Task: Write extensive tests for the Smart Merge algorithm.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Smart Merge Logic (Updates)' (Protocol in workflow.md)

## Phase 4: UI Implementation [checkpoint: d999fcf]
- [x] Task: Update Custom Section UI for Parents.
    - [x] Add a toggle/checkbox when editing a Custom Section: "Make Inheritable Template for Sub-Species".
    - [x] Added Confirmation Dialog for disabling inheritance with removal modes (ALL, UNEDITED, NONE).
- [x] Task: Update Custom Section UI for Children.
    - [x] Render a badge/icon (e.g., `InfoOutlined` or a link icon) next to the section title if `inheritedFromSectionId` is present.
    - [x] Add a tooltip to the badge: "Inherited from parent. You can edit values here without affecting the master template."
- [x] Task: Refinements and Polish.
    - [x] Implement recursive de-propagation (removing children when parent inheritance is disabled).
    - [x] Default `isInheritable` to true for new inherited sections for deep propagation.
    - [x] Improve Smart Merge to handle exact matches without merge markers.
    - [x] Prevent duplicate sections by title matching.
- [x] Task: Conductor - User Manual Verification 'Phase 4: UI Implementation' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions [61d4110]