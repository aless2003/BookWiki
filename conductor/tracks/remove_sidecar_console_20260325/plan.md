# Implementation Plan: Remove Command Prompt for Sidecar

## Phase 1: Implementation [checkpoint: 259828f]
- [x] Task: Modify `frontend/src-tauri/src/main.rs` to hide the console for the sidecar process.
    - [ ] Add `#[cfg(windows)] use std::os::windows::process::CommandExt;`
    - [ ] Update the `sidecar_command` spawn logic to include `creation_flags(0x08000000)` (CREATE_NO_WINDOW) on Windows.
- [x] Task: Hide main app console window.
    - [x] Add `#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]` to `frontend/src-tauri/src/main.rs` and `scripts/main.rs`.
- [x] Task: Ensure that the lifecycle logic (kill on exit) is still robust.

## Phase 2: Verification
- [ ] Task: Launch the application on Windows.
- [ ] Task: Confirm no persistent Command Prompt appears for the sidecar.
- [ ] Task: Verify the backend is functional (check API response).
- [ ] Task: Close the application and verify the backend process is terminated.
- [ ] Task: Conductor - User Manual Verification 'Verification' (Protocol in workflow.md)