# Specification: Fix Emote Suggestion Menu in Writing Studio

## Overview
The emote suggestion menu, triggered by typing `:` in the Writing Studio's paged editor, currently fails to display results. Even though the backend returns a successful response with emote data, the UI displays "No result". Mentions (triggered by `#`) continue to function correctly. This issue appeared recently, possibly following a code review or a restart.

## Functional Requirements
1. **Emote Detection:** The editor must correctly trigger the suggestion logic when a `:` character is typed.
2. **Data Integration:** The suggestion menu must correctly receive and process the emote data returned from the `/api/emotes` endpoint.
3. **Display Results:** The `MentionList` (or equivalent suggestion component) must render the list of available emotes instead of "No result" when data is present.
4. **Filtering:** Searching within the suggestion menu (typing after `:`) must filter the emote list based on the name.
5. **Insertion:** Selecting an emote from the menu must insert the corresponding `InlineImage` into the document.

## Technical Context
- **Location:** `frontend/src/pages/Writing.tsx` and `frontend/src/components/TiptapPagedEditor.tsx`.
- **Trigger:** `:`.
- **Backend Endpoint:** `/api/emotes`.
- **Current Behavior:** Network request returns 200 OK with data, but `MentionList` shows "No result".

## Acceptance Criteria
- [ ] Typing `:` in the Writing Studio editor opens the suggestion list.
- [ ] The suggestion list displays the emotes fetched from the backend.
- [ ] Selecting an emote inserts it into the text.
- [ ] Mentions (using `#`) remain unaffected and functional.

## Out of Scope
- Modifications to the Worldbuilding wiki editor (unless shared logic requires it).
- Enhancements to the emote management system.