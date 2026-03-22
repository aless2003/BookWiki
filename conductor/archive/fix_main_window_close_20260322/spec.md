# Specification: Fix Application Exit on Main Window Close

## Overview
Currently, the BookWiki application backend terminates if the main window is closed, regardless of whether secondary windows (such as popped-out worldbuilding entries or chapters) are still open. The goal of this track is to fix this behavior so the application only shuts down when *all* application windows are closed.

## Bug Description
When closing the main window in the Tauri desktop wrapper, the application initiates an exit sequence that kills the Spring Boot backend sidecar. This disrupts the user experience if they have other secondary windows actively open.

## Functional Requirements
- The application (Tauri frontend and Spring Boot backend) MUST NOT terminate when the main window is closed, provided other secondary windows are still open.
- The application MUST completely terminate (including killing the Spring Boot backend sidecar) when the absolute last remaining window is closed.

## Non-Functional Requirements
- The shutdown sequence must safely clean up the Java backend process.

## Out of Scope
- Minimizing the application to the system tray.
- Changes to how secondary windows are created.