# Implementation Plan: Worldbuilding Rich Text Placeholders

## Phase 1: Research and Component Setup
- [x] Task: Identify text initialization logic.
    - [x] Locate frontend components responsible for creating new Characters, Locations, and adding new Custom Sections.
    - [x] Pinpoint where the default "actual text" is currently set for these fields.
- [x] Task: Evaluate Editor Component Placeholder Support.
    - [x] Identify the specific rich text editor component used for these fields (Tiptap or Quill).
    - [x] Verify how to pass dynamic placeholder strings to this component.
    - [x] If using Tiptap, ensure the `Placeholder` extension is configured; if Quill, verify placeholder prop usage.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Research and Component Setup' (Protocol in workflow.md)

## Phase 2: Implementation
- [ ] Task: Remove default text initialization.
    - [ ] Update creation logic for Characters and Locations to start with empty descriptions.
    - [ ] Update the 'Add Custom Section' logic to initialize section content as an empty string.
- [ ] Task: Pass dynamic placeholders to editors.
    - [ ] For Description fields: Pass a string like "Write a description for this character...".
    - [ ] For 'Where is it?' (Locations): Pass a string like "Describe where this location is...".
    - [ ] For Custom Sections: Dynamically construct the string based on the section title (e.g., "Details for [Section Title]...").
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Implementation' (Protocol in workflow.md)

## Phase 3: Testing and Refinement
- [ ] Task: CSS and Styling Verification.
    - [ ] Ensure the placeholder text is visually distinct (e.g., lower opacity) and behaves like typical "ghost text" (disappears when focused/typed).
- [ ] Task: Manual end-to-end testing.
    - [ ] Create a new Character and verify the Description and Custom Section placeholders.
    - [ ] Create a new Location and verify the 'Where is it?' and Description placeholders.
    - [ ] Confirm that saving an empty field correctly persists an empty state without saving the placeholder text.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Testing and Refinement' (Protocol in workflow.md)