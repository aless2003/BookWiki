# Implementation Plan: Story and Chapter Export System

## Phase 1: Backend Export Foundation [checkpoint: 2f568a3]
- [x] Task: Research and Select Libraries
    - [x] Evaluate Apache POI for DOCX generation.
    - [x] Evaluate OpenPDF or iText for PDF generation.
- [x] Task: Create Export Service Structure
    - [x] Define `ExportService` interface.
    - [x] Implement `DocxExportService` with basic text support.
    - [x] Implement `PdfExportService` with basic text support.
- [x] Task: Implement Chapter and Story Data Retrieval
    - [x] Add endpoint or service method to fetch all chapters for a story in order.
- [x] Task: TDD - Core Export Logic
    - [x] Write unit tests for text-only export in both formats.
    - [x] Implement HTML-to-Document parsing for rich text (bold, italics).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend Foundation' (Protocol in workflow.md)

## Phase 2: Advanced Content Handling [checkpoint: 7c96d11]
- [x] Task: Image Embedding Support
    - [x] Implement logic to fetch and embed images from `uploads/` into DOCX and PDF.
- [x] Task: Page Break and Formatting
    - [x] Implement handling for `#{pagebreak}` shortcodes.
    - [x] Apply default Manuscript styling (12pt serif, double-spaced).
- [x] Task: TDD - Advanced Export Verification
    - [x] Write tests with mixed content (text + images + page breaks).
    - [x] Verify formatting consistency across formats.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Advanced Content' (Protocol in workflow.md)

## Phase 3: Frontend Integration and UI [checkpoint: 48ad755]
- [x] Task: Create Export Selection Modal
    - [x] Implement UI for format selection (PDF/DOCX).
    - [x] Implement UI for scope selection (Chapter/Story selection).
- [x] Task: Integrate with Writer's Studio Toolbar
    - [x] Add Export button to `Writing.tsx` header.
    - [x] Handle file download trigger from backend response.
- [x] Task: Final Regression and UX Check
    - [x] Verify download behavior on different browsers.
    - [x] Ensure no impact on existing Editor performance.
- [x] Task: Conductor - User Manual Verification 'Phase 3: Frontend & Final' (Protocol in workflow.md)
