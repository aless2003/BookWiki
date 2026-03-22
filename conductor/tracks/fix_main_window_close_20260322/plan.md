# Implementation Plan: Fix Application Exit on Main Window Close

## Phase 1: Investigation and Setup [checkpoint: b64a634]
- [x] Task: Investigate Tauri configuration for window exit behavior.
    - [ ] Locate `main.rs` and identify the application lifecycle event listeners.
    - [ ] Determine if the backend process is killed explicitly on main window close or implicitly on application exit.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Investigation and Setup' (Protocol in workflow.md)

## Phase 2: Implementation
- [ ] Task: Update Tauri event handling.
    - [ ] Modify the `RunEvent::WindowEvent` or `RunEvent::ExitRequested` handler to prevent exit if windows are still open.
    - [ ] Ensure that closing the last window properly triggers the backend shutdown sequence.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Implementation' (Protocol in workflow.md)

## Phase 3: Testing and Refactoring
- [ ] Task: Test multi-window lifecycle.
    - [ ] Open the main window, spawn a secondary window.
    - [ ] Close the main window and verify the secondary window and backend remain running.
    - [ ] Close the secondary window and verify the application fully terminates.
- [ ] Task: Refactor any messy window event handling code.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Testing and Refactoring' (Protocol in workflow.md)