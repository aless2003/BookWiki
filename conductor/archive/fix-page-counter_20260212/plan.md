# Implementation Plan: Fix Page Counter Tracking

## Phase 1: Investigation and Environment Setup
- [x] Task: Environment Check
    - [x] Verify `bun run dev` starts the frontend correctly.
    - [x] Ensure backend is running to load actual chapter data.
- [x] Task: Reproduce and Log Current Behavior
    - [x] Open a long chapter in the Writing Studio.
    - [x] Add console logs in `TiptapPagedEditor.tsx` and `Writing.tsx` to monitor pagination metadata from `tiptap-pagination-plus`.
    - [x] Observe logs when the counter flips from 1 to 0 or stays at 1.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Investigation' (Protocol in workflow.md) [checkpoint: 7a8b9c0]

## Phase 2: Fix Pagination State Synchronization
- [x] Task: Update TiptapPagedEditor Interface
    - [x] Identify the exact events emitted by `tiptap-pagination-plus` when pages change.
    - [x] Ensure the editor instance correctly exposes pagination storage to the parent component.
- [x] Task: Fix State Updates in Writing.tsx
    - [x] Refactor the page counter logic to use a robust listener (e.g., `onTransaction` or a dedicated pagination event).
    - [x] Implement a safety check to ensure page numbers are 1-based and never 0.
    - [x] Ensure the total page count is calculated after the pagination plugin finishes its layout pass.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Fix Pagination State' (Protocol in workflow.md) [checkpoint: 8b9c0d1]

## Phase 3: Verification and Quality Gates
- [x] Task: Manual Verification
    - [x] Test typing across multiple pages (1 -> 2, 19 -> 20).
    - [x] Test deleting content to reduce page count.
    - [x] Test switching between chapters of different lengths.
- [x] Task: Code Quality Check
    - [x] Run `bun run lint` to ensure no new warnings.
    - [x] Verify no debug logs are left in the codebase.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Verification' (Protocol in workflow.md) [checkpoint: cfb834e]
