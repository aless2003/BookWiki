# Specification: Version Synchronization Task

**Overview**
Implement a Gradle task named `updateVersion` (or `setVersion`) that synchronizes a new version string across the project's core configuration files. This ensures consistency between the backend (Gradle), frontend (Package), and desktop wrapper (Tauri).

**Functional Requirements**
1. **Version Input:**
    - The task shall interactively prompt the user for a new version string.
    - (Enhancement) Support for `-PnewVersion=...` property to bypass the prompt for automation.
2. **File Synchronization:**
    - **build.gradle**: Update the `version = '...'` line.
    - **frontend/package.json**: Update the `"version": "..."` field.
    - **frontend/src-tauri/tauri.conf.json**: Update the `"version": "..."` field.
3. **Safety:**
    - Perform a regex-based replacement to ensure only the version string is modified without disturbing other configurations.
    - Log the changes made to each file.

**Acceptance Criteria**
- Running the Gradle task updates `build.gradle`, `package.json`, and `tauri.conf.json` to the same version.
- The files remain syntactically correct after the update.
- The task handles the absence of files gracefully (though all three are expected in this project).

**Out of Scope**
- Git commits or tagging.
- Automated release notes.
- Updating compiled binary metadata directly (this is derived from the updated config files).
