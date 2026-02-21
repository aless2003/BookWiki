# Specification: Fix Partial Pagination on Initial Load

## Overview
This track addresses a rendering bug where large chapters are only partially paginated during the initial application load or page reload in the Tauri environment. While the first several pages (e.g., 17) render correctly in A4 format, the remaining content is displayed as a single vertically overflowing block until the user clicks into or edits the document.

## Problem Description
- **Symptoms:** Pagination stops mid-document. The "big page" at the end ignores A4 height constraints.
- **Scope:** Primarily observed in the Tauri (standalone) version.
- **Triggers:** Initial application startup or browser-level page reload.
- **Recovery:** Any interaction that focuses the editor (click, keystroke) or a chapter switch forces a full re-pagination which resolves the visual error.

## Functional Requirements
1. **Automatic Full Pagination:** The editor must ensure 100% of the loaded content is paginated according to the A4 configuration immediately upon data retrieval.
2. **User-Interaction Independence:** Paging must complete correctly without requiring the user to click or focus the editor.
3. **Accuracy:** The page count in the UI and the visual breaks must reflect the true length of the document (e.g., showing all 24 pages instead of stalling at 17).

## Technical Hypothesis
The issue likely stems from a race condition or initialization timing in the `tiptap-pagination-plus` extension. In the Tauri webview, the editor may be injecting content before the rendering engine has provided stable layout metrics (widths/heights), causing the pagination logic to conclude early or fail to trigger for the remainder of the DOM.

## Acceptance Criteria
- [ ] A chapter exceeding 20 pages loads fully paginated on first boot.
- [ ] No "overflowing" content exists beyond the last valid A4 page.
- [ ] Page count in the UI is accurate immediately after loading.
- [ ] The fix does not introduce regressions in chapter-switching performance.

## Out of Scope
- Performance optimization for documents exceeding 500+ pages.
- Changes to the visual style of the A4 pages themselves.
