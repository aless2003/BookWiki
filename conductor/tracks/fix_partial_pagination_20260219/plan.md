# Implementation Plan: Fix Partial Pagination on Initial Load

This plan focuses on identifying and resolving the race condition that causes Tiptap pagination to stall during the initial application boot or page reload, specifically within the Tauri environment.

## Phase 1: Diagnostics and Reproduction
Goal: Confirm the timing issue and verify why interaction fixes the rendering.

- [ ] Task: Audit Editor Initialization Lifecycle
    - [ ] Trace the data flow from `Writing.tsx` to `TiptapPagedEditor.tsx` during the initial load.
    - [ ] Add logging to `tiptap-pagination-plus` hooks (if accessible) or the `onUpdate` and `onSelectionUpdate` events to capture state during the "stalled" render.
- [ ] Task: Reproduce in Standalone Build
    - [ ] Build and run the Tauri application with a large test chapter (25+ pages).
    - [ ] Verify that paging stalls at a specific point and record the document state.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Diagnostics and Reproduction' (Protocol in workflow.md)

## Phase 2: Implementation of Reliable Pagination
Goal: Ensure pagination completes for the entire document regardless of interaction.

- [ ] Task: Implement MutationObserver Stability Check
    - [ ] Review the existing `MutationObserver` in `TiptapPagedEditor.tsx`.
    - [ ] Ensure it doesn't disconnect prematurely or fail to account for late-loading DOM elements.
- [ ] Task: Robust Lifecycle Syncing
    - [ ] Implement a logic that verifies the total height of the editor content against the sum of the page heights.
    - [ ] Add a "Stability Retry" mechanism: if the document isn't fully paginated after the initial `setContent`, trigger a programmatic re-calculation after a short, non-blocking delay or when the layout stabilizes.
- [ ] Task: Optimize Tauri-Specific Initialization
    - [ ] Investigate if the Tauri `window.show()` or similar events can be used to signal when the webview is fully ready for height-based calculations.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Implementation of Reliable Pagination' (Protocol in workflow.md)

## Phase 3: Verification and Final Polish
Goal: Confirm the fix across environments and clean up debug code.

- [ ] Task: Stress Test with Large Documents
    - [ ] Load a 50+ page document multiple times on boot to ensure 100% success rate.
- [ ] Task: Regression Testing
    - [ ] Ensure chapter-switching (which was working) remains fast and accurate.
    - [ ] Verify that manual page breaks (`#{pagebreak}`) still function correctly.
- [ ] Task: Remove Diagnostic Logs
    - [ ] Clean up any logging or temporary stability checks added during Phase 1 & 2.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Verification and Final Polish' (Protocol in workflow.md)
