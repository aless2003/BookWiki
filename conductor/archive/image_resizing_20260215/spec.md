# Specification: Arbitrary Image Resizing in Manuscript

## Overview
This feature enables writers to resize images within the Tiptap-based 'Writer's Studio'. Users will be able to manually adjust image dimensions to fit their layout needs while staying within the physical boundaries of the A4 paged editor.

## Functional Requirements
- **Manual Resizing:** 
    - Display drag handles on corners and edges when an image is selected.
    - Implement resizing logic that updates the image dimensions in real-time.
- **Aspect Ratio Control:**
    - Proportions are locked by default during resizing.
    - Holding the `Shift` key allows for "Free Transform" (stretching/squashing).
- **Double-Click Shortcut:**
    - Double-clicking an image toggles its width between its original size and the full width of the page margins.
- **Page Constraints:**
    - Resizing is "Hard Clamped": Dimensions cannot exceed the maximum printable width or height of the A4 page.
- **Persistence:**
    - Custom dimensions are saved as inline CSS `style` attributes (width/height) on the image tag to ensure compatibility with base64 encoded images.

## Non-Functional Requirements
- **UI Consistency:** Drag handles should match the Material UI aesthetic of the application.
- **Performance:** Resizing should be smooth and performant without causing layout lag in the paged editor.

## Acceptance Criteria
- [ ] Clicking an image reveals resize handles.
- [ ] Dragging handles resizes the image.
- [ ] `Shift` key toggles aspect ratio lock correctly.
- [ ] Double-clicking toggles between original size and full-width.
- [ ] Image dimensions are strictly capped by page margins.
- [ ] Resized dimensions are preserved after saving and reloading the document.
- [ ] Resized images are correctly rendered in PDF and DOCX exports (as much as the export libraries allow).

## Out of Scope
- Image cropping or rotation.
- Advanced image filters or editing within the browser.
