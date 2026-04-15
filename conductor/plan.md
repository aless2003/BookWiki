# Implementation Plan: Worldbuilding Table Support

## Objective
Implement advanced table features specifically for the Worldbuilding section (Quill editor) using `quill-table-better`. This will override the basic native table module and provide features like cell merging and row/column resizing.

## Phase 1: Package Integration
- [x] Task: Install `quill-table-better` package via `bun add quill-table-better`.

## Phase 2: Editor Configuration (`frontend/src/components/RichTextEditor.tsx`)
- [x] Task: Disable the native `table` module in the Quill configuration.
- [x] Task: Register the `table-better` module from `quill-table-better`.
- [x] Task: Add a table button to the toolbar and configure the `table-better` menus.
- [x] Task: Ensure CSS from `quill-table-better/dist/quill-table-better.css` is imported.

## Phase 3: Shortcode & Media Compatibility
- [x] Task: Update the `toBubbles` function in `RichTextEditor.tsx` to ensure HTML table tags (`<table>`, `<tr>`, `<td>`, etc.) are preserved.
- [x] Task: Update the `toShortcodes` function to properly re-serialize tables with shortcodes inside.

## Phase 4: CSS Refinement
- [x] Task: Review `frontend/src/index.css` to confirm dark mode styles for `ql-table-menus-container`, tooltips, and resize handles apply correctly to the new tables in the Worldbuilding section.
- [x] Task: Remove or comment out Tiptap-specific table instructions if they conflict with the updated direction (since Tiptap tables are out of scope for this feature).

## Verification
- [x] Package `quill-table-better` installed.
- [x] Editor registered with `table-better` module.
- [x] Toolbar updated with table button.
- [x] CSS refined for dark mode.
- [x] Serialization logic updated to support tables with shortcodes.
