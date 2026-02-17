# Specification: Standalone Installer with Tauri

## Overview
Create a cross-platform installer and a lightweight standalone desktop wrapper for BookWiki using Tauri. This will allow users to install and run the application locally without manually installing Java or using a web browser directly.

## Functional Requirements
- **Lightweight Wrapper:** Use Tauri to wrap the React frontend in a native system webview (WebView2 on Windows, WebKit on macOS/Linux).
- **Self-Contained Runtime:** Bundle a minimal Java Runtime (JRE) via `jlink` to run the Spring Boot backend sidecar.
- **Backend Orchestration:** Tauri will manage the Spring Boot JAR as a sidecar process, handling automatic startup and shutdown.
- **Persistent Data (Critical):** The H2 database and file uploads must be stored in the user's system-standard AppData folder (e.g., `%APPDATA%/BookWiki` on Windows) instead of the local project directory when running in standalone mode.
- **Installer Generation:** Produce platform-specific installers (e.g., `.msi` for Windows).

## Non-Functional Requirements
- **Performance:** Maintain a low memory footprint by avoiding Electron.
- **User Experience:** Provide a "one-click" launch experience after installation.

## Acceptance Criteria
- [ ] Running the generated installer correctly installs BookWiki.
- [ ] Launching the application opens a native window with the BookWiki interface.
- [ ] The backend starts automatically and the UI functions correctly (e.g., loading stories).
- [ ] Data is saved to and loaded from the system's AppData directory.
- [ ] Closing the application window terminates the backend process.

## Out of Scope
- Automatic "over-the-air" updates.
- Code signing certificates (initial installers will be unsigned).
