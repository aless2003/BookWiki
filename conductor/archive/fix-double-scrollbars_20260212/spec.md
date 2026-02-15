# Specification: Resolve Double Scrollbars in Writing Module

## Overview
The Writing module currently exhibits "double scrollbars": one on the outer application window and one on the inner writing container. The inner scrollbar is currently dysfunctional (only scrolling a few pixels), while the outer scrollbar moves the entire content area.

## Problem Statement
- **Location:** Writing Studio (`Writing.tsx`).
- **Behavior:** Two scrollbars appear simultaneously. The inner one has an extremely small scrollable range, while the outer one manages the primary page movement.
- **User Preference:** **Inner Scrollbar Only**. The navigation bar and layout should remain fixed, and only the manuscript area should be scrollable.
- **Scope:** This fix is specifically targeted at the Writing module, even if similar issues exist elsewhere.

## Functional Requirements
- **Single Scrollbar:** Only one scrollbar should be visible within the Writing module's content area.
- **Fixed Layout:** The top navigation and any sidebar elements must remain fixed to the viewport.
- **Full Manuscript Access:** The inner scrollbar must allow scrolling through the entire length of the document.
- **Overflow Management:** `overflow: hidden` should be applied to the outer containers (like `body` or the main app wrapper) specifically when in this module, or the inner container's height must be correctly set to `100%` of the available viewport minus the header.

## Technical Constraints / Considerations
- Investigate the CSS for the main layout wrapper and the `Writing.tsx` container.
- Check for `height: 100vh` vs `height: 100%` issues.
- Ensure the `TiptapPagedEditor` container has its height explicitly defined or flex-calculated to enable its own internal scrolling.
- Verify if Material UI (MUI) `Box` or `Container` components are adding default overflow behavior.

## Acceptance Criteria
- [ ] Only one scrollbar is visible in the Writing Studio.
- [ ] The navigation bar stays fixed at the top while scrolling the manuscript.
- [ ] The inner scrollbar correctly scrolls from the beginning to the end of the manuscript.
- [ ] No "content jumping" or layout shifting occurs when switching to/from the Writing module.
