# Implementation Plan: Arbitrary Image Resizing

This plan outlines the steps to implement manual image resizing with drag handles, aspect ratio control, and page constraints within the Tiptap paged editor.

## Phase 1: Infrastructure & Custom Node
- [x] Task: Create a custom Tiptap Image extension `ResizableImage` that extends the default Image node.
- [x] Task: Define `width` and `height` attributes in the node schema that map to inline CSS styles.
- [x] Task: Implement a custom React component to render the Image node with a selection state.
- [~] Task: Conductor - User Manual Verification 'Phase 1: Infrastructure' (Protocol in workflow.md)

## Phase 2: Resizing Logic & UI
- [x] Task: Add resize handles (corners and edges) to the image component UI, visible only when selected.
- [x] Task: Implement mouse event listeners for dragging handles to calculate new dimensions.
- [x] Task: Implement "Locked Aspect Ratio" logic by default during resize calculations.
- [x] Task: Implement `Shift` key modifier to allow free-form resizing.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Resizing Logic' (Protocol in workflow.md)

## Phase 3: Constraints & Shortcuts
- [x] Task: Implement "Hard Clamp" logic to prevent dimensions from exceeding A4 page width/height (referencing `tiptap-pagination-plus` constraints).
- [x] Task: Implement double-click event handler to toggle between original size and max-page-width.
- [x] Task: Ensure the updated styles are correctly serialized into the document JSON/HTML.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Constraints' (Protocol in workflow.md)

## Phase 4: Export & Integration
- [x] Task: Verify that `style` attributes on images are correctly handled by `PdfExportService` and `DocxExportService`.
- [x] Task: Perform regression testing on the existing base64 image pasting and saving workflow.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Export' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions f917e0d
