# Implementation Plan: Inline Images & Emotes

## Phase 1: Backend for Emote Storage [checkpoint: c83ac8e]

- [x] **Task:** Create Emote entity and repository
    - [ ] Sub-task: Create `Emote.java` entity with `name`, `imageUrl`, and `story` relationship.
    - [ ] Sub-task: Create `EmoteRepository.java` extending `JpaRepository`.
- [x] **Task:** Create Emote service and controller
    - [ ] Sub-task: Create `EmoteService.java` with methods to `createEmote` and `getEmotesByStory`.
    - [ ] Sub-task: Create `EmoteController.java` with REST endpoints for `POST /api/stories/{storyId}/emotes` and `GET /api/stories/{storyId}/emotes`.
- [x] **Task:** Write backend tests # WARNING: Unable to run tests due to out-of-memory errors.
    - [ ] Sub-task: Write unit tests for `EmoteService`.
    - [ ] Sub-task: Write integration tests for `EmoteController`.
- [x] **Task:** Conductor - User Manual Verification 'Phase 1: Backend for Emote Storage' (Protocol in workflow.md)

## Phase 2: Frontend - Inline Image Node and Conversion [checkpoint: 6c16c55]

- [x] **Task:** Create `inlineImage` Tiptap extension
    - [ ] Sub-task: Create a new file for the `inlineImage` node extension.
    - [ ] Sub-task: Define the node's schema with `src` and optional `emoteName` attributes.
    - [ ] Sub-task: Implement the rendering logic to display a square, relatively-sized `<img>` tag.
- [x] **Task:** Implement conversion UI
    - [ ] Sub-task: Add a "Convert to Inline Image" button to the `ResizableImage` floating menu.
    - [ ] Sub-task: Create a modal component that prompts the user to optionally enter an emote name.
- [x] **Task:** Implement conversion logic
    - [ ] Sub-task: When the "Convert" button is clicked and confirmed in the modal, replace the `ResizableImage` node with the new `inlineImage` node.
    - [ ] Sub-task: If a name was provided, make a POST request to the new backend endpoint to save the emote.
- [x] **Task:** Conductor - User Manual Verification 'Phase 2: Frontend - Inline Image Node and Conversion' (Protocol in workflow.md)

## Phase 3: Frontend - Emote Shortcut and UI [checkpoint: c0db4c0]

- [x] **Task:** Integrate `Mention` extension for emotes
    - [x] Sub-task: Configure the `Mention` extension to trigger on the `:` character.
    - [x] Sub-task: Fetch the list of named emotes for the current story from the backend when the editor loads.
    - [x] Sub-task: Provide the list of emotes to the `Mention` extension's suggestion utility.
- [x] **Task:** Create emote suggestion list component
    - [x] Sub-task: Create a React component to render the list of suggested emotes, showing the image and name.
- [x] **Task:** Implement emote insertion
    - [x] Sub-task: On selection from the suggestion list, insert the corresponding `inlineImage` node into the editor.
- [x] **Task:** Conductor - User Manual Verification 'Phase 3: Frontend - Emote Shortcut and UI' (Protocol in workflow.md)

## Phase 4: Review Fixes

- [x] Task: Apply review suggestions [checkpoint: d1979bb]
- [x] Task: Fix pagination regression caused by toBubbles dependency change [checkpoint: f475e97]
