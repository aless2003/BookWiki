# Specification: Fix Page Counter Tracking

## Overview
The page counter in the Writing Studio (Writing.tsx) does not accurately reflect the current page or total page count. It frequently defaults to 0 or 1, and in some cases, increments incorrectly (e.g., flipping from 1 to 0 when transitioning from page 19 to 20), despite the content being correctly paginated visually.

## Problem Statement
- **Location:** Writing Studio (`Writing.tsx` using `TiptapPagedEditor.tsx`).
- **Behavior:** The page counter display is out of sync with the actual document state.
- **Impact:** Users cannot reliably know their current position or the total length of their manuscript.

## Functional Requirements
- The page counter must accurately display the current page index (1-based).
- The page counter must accurately display the total number of pages.
- Updates must be reactive to content changes (adding/removing text) and navigation (scrolling/cursor movement).
- The counter should never display "0" as a valid page number for a document with content.

## Technical Constraints / Considerations
- Investigate the `tiptap-pagination-plus` extension's event listeners (e.g., `onUpdate`, `onSelectionUpdate`).
- Verify how `editor.storage.pagination` (or equivalent storage) is being accessed in the UI.
- Ensure state updates in React are not being throttled or dropped during rapid typing.

## Acceptance Criteria
- [ ] Opening a multi-page chapter correctly displays the total page count.
- [ ] Typing across a page boundary updates the "Current Page" and "Total Pages" immediately.
- [ ] The counter never displays "0" when content exists.
- [ ] Switching between chapters resets and correctly initializes the counter for the new content.
