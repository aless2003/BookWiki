# Implementation Plan: Emote Management System

## Phase 1: Backend - Rename and Delete API [x]

- [x] **Task:** Update `EmoteService.java` [2572610]
    - [x] Sub-task: Implement `updateEmote(Long id, String newName)` with uniqueness check.
    - [x] Sub-task: Implement `deleteEmote(Long id)`.
- [x] **Task:** Update `EmoteController.java` [2572610]
    - [x] Sub-task: Add `PATCH /api/stories/{storyId}/emotes/{emoteId}` endpoint for renaming.
    - [x] Sub-task: Add `DELETE /api/stories/{storyId}/emotes/{emoteId}` endpoint for deletion.
- [x] **Task:** Write backend tests [2572610]
    - [x] Sub-task: Add unit tests in `EmoteServiceTest` for update and delete logic.
    - [x] Sub-task: Add integration tests in `EmoteControllerTest` for the new endpoints.
- [x] **Task:** Conductor - User Manual Verification 'Phase 1: Backend - Rename and Delete API' (Protocol in workflow.md)

## Phase 2: Frontend - UI Refinement & Modal [x]

- [x] **Task:** UI Refinements in `Writing.tsx`
    - [x] Sub-task: Rename "Planning" section header to "Story Assets".
    - [x] Sub-task: Replace "Notes & Ideas" button with "Emotes" button (using a suitable icon like `EmojiEmotions`).
- [x] **Task:** Create `EmoteManagementModal.tsx`
    - [x] Sub-task: Create a new component that fetches and displays a list of emotes for the current story.
    - [x] Sub-task: Implement the list view with emote previews and name labels.
- [x] **Task:** Conductor - User Manual Verification 'Phase 2: Frontend - UI Refinement & Modal' (Protocol in workflow.md)

## Phase 3: Frontend - Implementation of Actions [x]

- [x] **Task:** Implement Rename logic
    - [x] Sub-task: Add an "Edit" button to each list item that opens a small prompt or inline field to change the name.
    - [x] Sub-task: Connect the rename action to the `PATCH` backend endpoint.
    - [x] Sub-task: Refresh the emote list (and Tiptap suggestions) upon successful rename.
- [x] **Task:** Implement Delete logic
    - [x] Sub-task: Add a "Delete" button to each list item with a confirmation dialog.
    - [x] Sub-task: Connect the delete action to the `DELETE` backend endpoint.
    - [x] Sub-task: Refresh the emote list upon successful deletion.
- [x] **Task:** Conductor - User Manual Verification 'Phase 3: Frontend - Implementation of Actions' (Protocol in workflow.md)
