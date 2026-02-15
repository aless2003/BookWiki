# Specification: Story and Chapter Export System

## Overview
This feature enables users to export their work from BookWiki into standard external file formats (PDF and DOCX). The system will allow for granular selection of content (single chapters or full stories) and will be driven by the backend to ensure high-fidelity document generation and future-proofing for more formats.

## Problem Statement
Writers need a way to share their work, submit manuscripts, or maintain backups in widely accepted formats like PDF and Microsoft Word (DOCX). Currently, work is "locked" within the BookWiki database.

## Functional Requirements
- **Selection UI**: A modal or menu within the Writer's Studio allowing users to select:
    - The current chapter.
    - Specific multiple chapters.
    - The entire story.
- **Format Support**:
    - **PDF**: Portable document format with consistent layout.
    - **DOCX**: Microsoft Word format suitable for editing and submission.
- **Backend Generation**: Implementation of a dedicated Export Service in the Spring Boot backend using libraries such as Apache POI (DOCX) and OpenPDF/iText (PDF).
- **Manuscript Formatting**:
    - Default: Standard Manuscript Style (12pt serif font, double-spaced).
    - Architecture: Support for future style customization (custom fonts, margins, etc.).
- **Content Preservation**:
    - Full support for Rich Text (Bold, Italic, Underline).
    - Embedding of images found in the manuscript.
    - Recognition and execution of explicit `#{pagebreak}` shortcodes.
- **UI Integration**: An "Export" button added to the Writer's Studio top toolbar.

## Non-Functional Requirements
- **Performance**: Document generation should handle stories of moderate length (up to 100k words) without timing out.
- **Extensibility**: The export architecture should allow adding new formats (e.g., EPUB, Markdown) with minimal changes to the selection UI.

## Acceptance Criteria
- [ ] Export button is visible in the Writer's Studio.
- [ ] Clicking Export opens a menu to select Format (PDF/DOCX) and Scope (Chapter/Story).
- [ ] PDF export preserves formatting and images.
- [ ] DOCX export preserves formatting and images and is editable in Word.
- [ ] Explicit page breaks in the editor result in page breaks in the exported file.
- [ ] Large story exports work correctly and trigger a file download in the browser.

## Out of Scope
- EPUB or Kindle formats (reserved for future tracks).
- Real-time print preview (export-to-file only).
- Advanced styling editor (CSS/Template editor).
