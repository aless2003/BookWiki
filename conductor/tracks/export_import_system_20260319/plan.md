# Implementation Plan: Export/Import System

## Phase 1: Settings UI & Navigation [checkpoint: 3b61f37]
- [x] Task: Create `frontend/src/pages/Settings.tsx` with basic layout and route navigation.
- [x] Task: Update `frontend/src/App.tsx` and `frontend/src/components/Navigation.tsx` to integrate the Settings page and Gear Icon.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Settings UI & Navigation' (Protocol in workflow.md)

## Phase 2: End-to-End Export [checkpoint: 329a033]
- [x] Task: Implement backend `ExportService` and REST endpoints for full and story-specific exports.
- [x] Task: Create the "Export" UI in `Settings.tsx` (Buttons, Story selection list) and wire it to the backend.
- [x] Task: Conductor - User Manual Verification 'Phase 2: End-to-End Export' (Protocol in workflow.md)

## Phase 3: End-to-End Import [checkpoint: e371a21]
- [x] Task: Implement backend `ImportService` and the `/api/import` endpoint with merge logic.
- [x] Task: Create the "Import" UI in `Settings.tsx` (File upload, status indicators) and wire it to the backend.
- [x] Task: Conductor - User Manual Verification 'Phase 3: End-to-End Import' (Protocol in workflow.md)

## Phase 4: Final Verification & Polishing [checkpoint: b28f205]
- [x] Task: Perform a complete "Round Trip" test (Export project -> Wipe DB -> Import project) via the UI.
- [x] Task: Refine UI feedback (loading states, success/error alerts).
- [x] Task: Conductor - User Manual Verification 'Phase 4: Final Verification & Polishing' (Protocol in workflow.md)