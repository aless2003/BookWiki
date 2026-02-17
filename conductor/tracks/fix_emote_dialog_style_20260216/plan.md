# Implementation Plan: Fix "Convert to Inline Image" Dialogue Styling

## Phase 1: Styling Fix [ ]

- [ ] **Task:** Identify and refactor the dialogue component
    - [ ] Sub-task: Locate the component responsible for the "Convert to Inline Image" dialogue (likely `EmoteNamingModal.tsx` or similar).
    - [ ] Sub-task: Verify it uses Material UI components (`Dialog`, `TextField`, `Button`) instead of raw HTML.
    - [ ] Sub-task: Ensure the component is wrapped in the project's `ThemeProvider` or correctly inherits the dark theme context.
- [ ] **Task:** Apply theme-consistent styling
    - [ ] Sub-task: Remove any hardcoded background or color styles that force a light theme.
    - [ ] Sub-task: Use `sx` props or MUI styling to ensure the background and text contrast correctly with the dark theme.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Styling Fix' (Protocol in workflow.md)

## Phase 2: Verification [ ]

- [ ] **Task:** Visual Regression Check
    - [ ] Sub-task: Open the "Convert to Inline Image" dialogue in the Writing Studio.
    - [ ] Sub-task: Confirm the background matches the editor's dark theme.
    - [ ] Sub-task: Confirm all text and buttons are clearly visible and styled correctly.
- [ ] **Task:** Functionality Smoke Test
    - [ ] Sub-task: Complete a conversion to ensure the styling changes didn't break the logic.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Verification' (Protocol in workflow.md)
