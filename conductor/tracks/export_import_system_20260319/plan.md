# Implementation Plan: Export/Import System

## Phase 1: Settings UI & Navigation
- [ ] Task: Create `frontend/src/pages/Settings.tsx` with basic layout and route navigation.
- [ ] Task: Update `frontend/src/App.tsx` and `frontend/src/components/Navigation.tsx` to integrate the Settings page and Gear Icon.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Settings UI & Navigation' (Protocol in workflow.md)

## Phase 2: End-to-End Export
- [ ] Task: Implement backend `ExportService` and REST endpoints for full and story-specific exports.
- [ ] Task: Create the "Export" UI in `Settings.tsx` (Buttons, Story selection list) and wire it to the backend.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: End-to-End Export' (Protocol in workflow.md)

## Phase 3: End-to-End Import
- [ ] Task: Implement backend `ImportService` and the `/api/import` endpoint with merge logic.
- [ ] Task: Create the "Import" UI in `Settings.tsx` (File upload, status indicators) and wire it to the backend.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: End-to-End Import' (Protocol in workflow.md)

## Phase 4: Final Verification & Polishing
- [ ] Task: Perform a complete "Round Trip" test (Export project -> Wipe DB -> Import project) via the UI.
- [ ] Task: Refine UI feedback (loading states, success/error alerts).
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Final Verification & Polishing' (Protocol in workflow.md)