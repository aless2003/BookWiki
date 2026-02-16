# Implementation Plan: Emote Management System

## Phase 1: Backend - Rename and Delete API [ ]

- [ ] **Task:** Update `EmoteService.java`
    - [ ] Sub-task: Implement `updateEmote(Long id, String newName)` with uniqueness check.
    - [ ] Sub-task: Implement `deleteEmote(Long id)`.
- [ ] **Task:** Update `EmoteController.java`
    - [ ] Sub-task: Add `PATCH /api/stories/{storyId}/emotes/{emoteId}` endpoint for renaming.
    - [ ] Sub-task: Add `DELETE /api/stories/{storyId}/emotes/{emoteId}` endpoint for deletion.
- [ ] **Task:** Write backend tests
    - [ ] Sub-task: Add unit tests in `EmoteServiceTest` for update and delete logic.
    - [ ] Sub-task: Add integration tests in `EmoteControllerTest` for the new endpoints.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 1: Backend - Rename and Delete API' (Protocol in workflow.md)

## Phase 2: Frontend - UI Refinement & Modal [ ]

- [ ] **Task:** UI Refinements in `Writing.tsx`
    - [ ] Sub-task: Rename "Planning" section header to "Story Assets".
    - [ ] Sub-task: Replace "Notes & Ideas" button with "Emotes" button (using a suitable icon like `EmojiEmotions`).
- [ ] **Task:** Create `EmoteManagementModal.tsx`
    - [ ] Sub-task: Create a new component that fetches and displays a list of emotes for the current story.
    - [ ] Sub-task: Implement the list view with emote previews and name labels.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 2: Frontend - UI Refinement & Modal' (Protocol in workflow.md)

## Phase 3: Frontend - Implementation of Actions [ ]

- [ ] **Task:** Implement Rename logic
    - [ ] Sub-task: Add an "Edit" button to each list item that opens a small prompt or inline field to change the name.
    - [ ] Sub-task: Connect the rename action to the `PATCH` backend endpoint.
    - [ ] Sub-task: Refresh the emote list (and Tiptap suggestions) upon successful rename.
- [ ] **Task:** Implement Delete logic
    - [ ] Sub-task: Add a "Delete" button to each list item with a confirmation dialog.
    - [ ] Sub-task: Connect the delete action to the `DELETE` backend endpoint.
    - [ ] Sub-task: Refresh the emote list upon successful deletion.
- [ ] **Task:** Conductor - User Manual Verification 'Phase 3: Frontend - Implementation of Actions' (Protocol in workflow.md)
