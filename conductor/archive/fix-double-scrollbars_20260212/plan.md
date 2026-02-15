# Implementation Plan: Resolve Double Scrollbars in Writing Module

## Phase 1: Layout Diagnosis and Investigation
- [x] Task: Identify Overflowing Containers
    - [ ] Run the frontend using `bun run dev`.
    - [ ] Use Browser DevTools to inspect the `Writing.tsx` layout.
    - [ ] Identify which parent elements have `overflow: auto` or `overflow: scroll` causing the outer scrollbar.
    - [ ] Identify why the inner container has restricted height (causing the "few pixels" scroll).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Layout Diagnosis' (Protocol in workflow.md)

## Phase 2: CSS and Layout Correction
- [x] Task: Fix Application Shell Overflow
    - [ ] Update the main layout wrapper (likely in `App.tsx` or a layout component) to prevent global scrolling when the Writing module is active.
- [x] Task: Implement Fixed Header & Fluid Scroll Area
    - [ ] Adjust `Writing.tsx` styles to use a flexbox layout or `calc(100vh - headerHeight)`.
    - [ ] Ensure the inner manuscript container has `overflow-y: auto` and a correctly calculated height.
- [x] Task: Verify Component Constraints
    - [ ] Check if `TiptapPagedEditor.tsx` or its parent `Box`/`Container` components have hardcoded heights or padding that interfere with the scroll.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Layout Correction' (Protocol in workflow.md)

## Phase 3: Final Verification and Cleanup
- [x] Task: Regression Testing
    - [ ] Verify that the Story Selector and Worldbuilding pages still scroll correctly (if they were intended to have outer scrollbars).
    - [ ] Ensure no horizontal scrollbars were accidentally introduced.
- [x] Task: Code Quality Check
    - [ ] Run `bun run lint` to ensure no styling or TypeScript errors.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Final Verification' (Protocol in workflow.md)
