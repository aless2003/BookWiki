# Implementation Plan: Global Save Indicator (Toast Notifications)

## Phase 1: Setup Toast Infrastructure [checkpoint: dd91904]
- [x] Task: Evaluate and integrate a Toast/Snackbar library.
    - [x] Research options suitable for React/MUI (e.g., `notistack`, or build a custom context using MUI's `<Snackbar>`).
    - [x] Add the chosen library to dependencies or implement the custom context provider at the root of the application (`App.tsx` or similar).
    - [x] Create a globally accessible hook (e.g., `useToast()`) to trigger notifications from any component.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Setup Toast Infrastructure' (Protocol in workflow.md)

## Phase 2: Integrate with Save Operations
- [x] Task: Update Worldbuilding Wiki save handlers.
    - [x] Locate the API call/save handlers for Characters, Locations, Species, etc.
    - [x] Inject `useToast().success("Saved")` on successful promises.
    - [x] Inject `useToast().error("Failed to save")` on rejected promises.
- [x] Task: Update Writing Studio save handlers.
    - [x] Locate the auto-save and manual save handlers for Chapter content and notes.
    - [x] Inject success and error toasts appropriately.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Integrate with Save Operations' (Protocol in workflow.md)

## Phase 3: Unsaved Changes State [checkpoint: d742489]
- [x] Task: Implement 'Unsaved Changes' tracking.
    - [x] For key editors (Writing Studio, Worldbuilding forms), introduce a state boolean (e.g., `isDirty`).
    - [x] Set `isDirty` to true on any input change. Set to false upon successful save.
- [x] Task: Display 'Unsaved' warning.
    - [x] When `isDirty` is true, trigger a specific, non-dismissing (or long-duration) toast or a visual indicator in the header: "Unsaved changes...".
    - [x] Optionally, implement a `beforeunload` or router transition block to warn the user if they try to navigate away while `isDirty` is true.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Unsaved Changes State' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions 49b618d