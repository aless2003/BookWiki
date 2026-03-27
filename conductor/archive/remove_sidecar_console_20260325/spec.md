# Specification: Chore - Remove Command Prompt for Sidecar

## Overview
The BookWiki desktop application (Tauri-based) launches a Spring Boot backend as a sidecar. On Windows, this sidecar currently spawns a persistent Command Prompt window that remains visible alongside the main application. This window is unsightly and can be accidentally closed by the user, terminating the backend. The goal is to hide this window completely while keeping the backend process running in the background.

## Functional Requirements
- **Hidden Sidecar Window:** The sidecar's console/command prompt window must be hidden on Windows systems.
- **Background Execution:** The backend process must continue to run in the background after startup.
- **Process Lifecycle:** The backend process must still be terminated when the main application exits.

## Non-Functional Requirements
- **Performance:** No negative impact on startup time or general application performance.
- **Stability:** Ensure that hiding the window doesn't interfere with standard stdout/stderr logging or process communication.

## Acceptance Criteria
- Launching BookWiki on Windows (both in development and production) does not display a persistent command prompt window for the sidecar.
- The backend API (e.g., `localhost:3906`) is accessible and responsive after the application starts.
- Closing the main application correctly terminates the backend process.

## Out of Scope
- Hiding the main application window.
- Modifying how the backend is packaged or the bundled JRE.