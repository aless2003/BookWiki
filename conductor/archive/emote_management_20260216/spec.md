# Specification: Emote Management System

## Overview
This track introduces a management interface for story-specific emotes within the Writing Studio. It allows authors to view, rename, and delete named emotes. This provides control over the emote shortcut list (`:name`) without affecting emotes already placed in the manuscript. It also includes UI refinements to the Writing Studio sidebar to reflect these changes.

## Functional Requirements

### 1. UI Refinements (Writing Studio)
- **Rename Section:** Change the "Planning" section header in the `Writing.tsx` sidebar to "Story Assets" or "Story Tools".
- **Replace Button:** Replace the "Notes & Ideas" button with a new "Emotes" button.
- **Entry Point:** Clicking the "Emotes" button opens the management interface.

### 2. Management Interface
- **Display:** A panel or modal displaying a list of all named emotes currently associated with the story.
- **List Items:** Each item in the list must show:
    - A square preview of the emote image.
    - The current emote name (the text used for the shortcut).
- **Actions:** Each item should have clear "Edit" (Rename) and "Delete" actions.

### 3. Emote Renaming
- **Action:** Allow users to update the name string of an existing emote.
- **Logic:** Updating the name changes the shortcut trigger (e.g., changing `smile` to `happy` means typing `:happy` will now insert that image).
- **Validation:** Emote names must be unique within a story.

### 4. Emote Deletion
- **Action:** Provide a delete button for each emote in the list.
- **Logic:** Deleting an emote removes it from the database and the suggestion list.
- **Persistence:** Already placed `inlineImage` nodes in the manuscript that refer to this emote name remain intact (as they store the image source directly).

## Non-Functional Requirements
- **Consistency:** Use Material UI components (List, Avatar, IconButton, Dialog) to match the existing project aesthetic.
- **Responsiveness:** The management list should be easy to navigate even as the number of emotes grows.

## Acceptance Criteria
- [ ] Sidebar section "Planning" is renamed.
- [ ] "Notes & Ideas" button is replaced by "Emotes".
- [ ] Users can see a list of all emotes for the current story.
- [ ] Users can successfully rename an emote and use the new name as a shortcut.
- [ ] Users can delete an emote, and it no longer appears in the `:` suggestion list.
- [ ] Deleting or renaming an emote does not break existing emotes in the text.

## Out of Scope
- Global emotes (emotes shared across different stories).
- Bulk deletion or bulk renaming of emotes.
