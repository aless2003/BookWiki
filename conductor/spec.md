# Specification: Worldbuilding Table Support

## Overview
Add advanced table support exclusively to the Quill-based Worldbuilding section. This feature will allow users to create and manage structured data (stats, relationships, timelines) directly within Worldbuilding entries.

## Functional Requirements
- **Table Creation**: Insert tables of configurable initial dimensions via a toolbar button.
- **Table Manipulation (CRUD)**: Add/delete rows and columns, delete entire table.
- **Advanced Layout**: Merge and split cells, resize columns.
- **Styling**: Cell background colors, header rows, and clear borders.
- **Compatibility**: Ensure mentions and shortcodes (`#{type:id}`) still function correctly inside table cells.

## Technical Approach
- Utilize the `quill-table-better` module, which is compatible with Quill 2.0 (the underlying engine for `react-quill-new`).
- The native Quill table module will be disabled in favor of `quill-table-better`.
- CSS customizations will be applied globally to ensure dark theme consistency for the table context menus and tooltips.

## Out of Scope
- Table support for the Writing Studio (Tiptap editor).
- Nested tables.
- Spreadsheet-like formulas or calculations.
- CSV/Excel import/export for tables.
