# Implementation Plan: Specific Save Location for Downloads

## Phase 1: Research and Utility Implementation
- [x] Task: Create a unified Download/Save utility for the frontend.
    - [x] Create a `downloadFile` helper function (e.g., in `src/utils/download.ts`) that handles both Tauri and Web browser environments.
    - [x] Implement Web browser fallback logic: Try `window.showSaveFilePicker`, catch exceptions/unsupported environments, and fallback to `<a>` tag triggering a standard download.
- [x] Task: Research and verify Tauri Dialog API setup.
    - [x] Ensure the `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` are installed and configured in the Tauri setup to allow `save` file picker usage and writing to the filesystem.
    - [x] Update the `downloadFile` helper to use the Tauri `save` API when running in the desktop wrapper.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Research and Utility Implementation' (Protocol in workflow.md)

## Phase 2: Integration
- [ ] Task: Update Document Export flows.
    - [ ] Locate the PDF and DOCX export features in the frontend.
    - [ ] Refactor these features to use the new `downloadFile` utility instead of standard browser downloads.
- [ ] Task: Update Backup Export flow.
    - [ ] Locate the `.bwiki` project/story backup export feature.
    - [ ] Refactor to use the `downloadFile` utility.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Integration' (Protocol in workflow.md)

## Phase 3: Testing and Refinement
- [ ] Task: Test Desktop Wrapper.
    - [ ] Build and run the Tauri app.
    - [ ] Verify that exporting a document triggers the native OS "Save As" dialog and saves correctly.
    - [ ] Verify that exporting a backup triggers the native OS "Save As" dialog and saves correctly.
- [ ] Task: Test Web Browser (Modern).
    - [ ] Run the app in a browser that supports `showSaveFilePicker` (e.g., Chrome/Edge).
    - [ ] Verify that exports trigger the browser's save picker.
- [ ] Task: Test Web Browser (Fallback).
    - [ ] Run the app in a browser that does not support `showSaveFilePicker` (e.g., Firefox or mock the API absence).
    - [ ] Verify that exports gracefully fallback to standard downloads.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Testing and Refinement' (Protocol in workflow.md)