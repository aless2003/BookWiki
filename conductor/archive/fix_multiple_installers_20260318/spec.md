# Overview
Currently, the installer generation process (`gradle clean packageInstaller`) incorrectly builds installers for outdated versions (0.2.1, 0.2.2) alongside the current version (0.3.0). This track aims to fix the build configuration so that only the current version is packaged.

# Functional Requirements
- The `packageInstaller` Gradle task (or underlying Tauri/Rust build process) must only generate an installer for the single, currently defined application version (e.g., 0.3.0).
- Existing old artifacts from previous builds should not be automatically cleaned up by this specific fix (focus is on configuring the build to only target the current version).

# Non-Functional Requirements
- The fix should not disrupt the overall build pipeline or the integrity of the generated installer.

# Acceptance Criteria
- Running `gradle clean packageInstaller` results in only one set of installer artifacts being created, corresponding exactly to the current project version.

# Out of Scope
- Automatic deletion of historical installer artifacts from the output directory.