# Specification: Specific Save Location for Downloads

## Overview
This feature enhances the user experience by allowing users to choose the specific save location whenever a file is downloaded or exported from the BookWiki application. This applies to document exports (PDF, DOCX), project backups (.bwiki), and any other user-initiated file downloads.

## Functional Requirements
- **Always Prompt for Location:** Whenever a user triggers a download or export, the application MUST open a "Save As" file picker dialog, allowing them to choose the exact destination folder and filename.
- **Desktop Application (Tauri):** The Tauri desktop wrapper MUST intercept download requests and utilize native OS file picker dialogs to save the file.
- **Web Browser Support:** The web version MUST attempt to use the modern browser File System Access API (`window.showSaveFilePicker`) to prompt for a save location. If the browser does not support this API, it should gracefully fall back to a standard browser download (which typically saves to the default Downloads folder).
- **Scope Limitation:** This feature ONLY applies to explicit user-initiated downloads and exports. It DOES NOT affect the internal auto-save mechanism for stories, which will continue to save to the internal database/app data folder.

## Non-Functional Requirements
- **Consistent User Experience:** The prompt behavior should feel as native and seamless as possible on both desktop and supported web browsers.

## Out of Scope
- Configuring a default permanent workspace directory for the internal database.
- Changing the internal autosave mechanism.