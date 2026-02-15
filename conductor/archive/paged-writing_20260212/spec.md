# Specification: Paged Writing Module

## Overview
Transform the Writing Studio from a single continuous text area into a paged interface that mimics a professional word processor (e.g., MS Word, Google Docs). This ensures that writers can visualize the final print/PDF layout while drafting their manuscripts.

## Functional Requirements
- **A4 Layout Standard**: Default page dimensions set to A4 (210mm x 297mm).
- **Customizable Dimensions**: Infrastructure to allow users to change page sizes or margins in the future.
- **Automatic Pagination**: Text flows seamlessly from the bottom of one page to the top of the next as the user types.
- **Manual Page Breaks**: Support for a "Page Break" command/element that forces content following it onto a new page.
- **Continuous Vertical Scroll**: A UI layout where pages are stacked vertically with distinct visual separation (shadows/gaps).
- **Inline Image Support**: Images are treated as inline blocks within the text flow.
- **Smart Image Handling**: If an inline image exceeds the remaining vertical space on a page, it is automatically moved to the start of the next page.
- **Flexible Tooling**: The use of new libraries or specialized Tiptap extensions is explicitly permitted if they provide a more robust or maintainable path to achieving pagination.

## Non-Functional Requirements
- **Performance**: Pagination calculations must happen in real-time or near-real-time without significant typing lag.
- **Visual Consistency**: Ensure that the Tiptap editor styling matches the paged layout precisely.

## Acceptance Criteria
- [ ] The editor renders content within distinct A4-sized containers.
- [ ] Typing at the end of Page 1 automatically creates Page 2 and moves the cursor/text appropriately.
- [ ] Deleting text across page boundaries merges pages correctly.
- [ ] Inserting a manual page break immediately moves subsequent content to a new page.
- [ ] Images that don't fit at the bottom of a page are pushed to the next page.

## Out of Scope
- Multi-column layouts.
- Complex text wrapping (around images).
- PDF Export (This track focuses on the *interface* and *editor* behavior; export is a separate feature).
