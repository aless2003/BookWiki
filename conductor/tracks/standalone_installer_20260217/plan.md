# Implementation Plan: Standalone Installer with Tauri

This plan outlines the steps to package BookWiki as a standalone desktop application using Tauri, including a bundled JRE for the backend and persistent storage in the system AppData folder.

## Phase 1: Environment Setup & Backend Adaptation
Focus on preparing the build environment and ensuring the Spring Boot backend can handle system-specific data paths.

- [x] **Task: Setup Development Environment**
    - [x] Install Rust and Tauri CLI (via `bun install -g @tauri-apps/cli`).
    - [x] Verify `cargo` and `rustc` are accessible.
- [x] **Task: Implement Standalone Mode & AppData Path Logic**
    - [x] Create a mechanism (e.g., a custom `production` profile or a specific environment variable) to trigger "Standalone Mode".
    - [x] Implement a `PathProvider` service to resolve `%APPDATA%/BookWiki` (Windows) or equivalent (Mac/Linux) for the H2 database URL and file upload directory *only* when Standalone Mode is active.
    - [x] **Write Tests:** Add unit tests to verify that paths default to the local `data/` folder in dev mode and the system AppData folder in Standalone Mode.
    - [x] **Implement:** Update `FileUploadController` and DataSource configuration to use the resolved paths from the `PathProvider`.
- [x] **Task: Conductor - User Manual Verification 'Phase 1: Environment Setup & Backend Adaptation' (Protocol in workflow.md)**

## Phase 2: JRE Bundling & Sidecar Preparation
Create the portable Java environment and prepare the JAR for distribution.

- [x] **Task: Create Minimal JRE Bundle**
    - [x] Identify required Java modules using `jdeps` on the backend JAR.
    - [ ] Use `jlink` to generate a stripped-down JRE.
    - [x] Create a script (e.g., `bundle-jre.sh/bat`) to automate this for the build process.
- [x] **Task: Configure Sidecar Metadata**
    - [x] Define the naming convention for the sidecar binary (Tauri requires `<name>-<target-triple>`).
    - [x] Ensure the Spring Boot JAR can be executed by the bundled JRE via a simple wrapper script or direct binary execution if possible.
- [x] **Task: Conductor - User Manual Verification 'Phase 2: JRE Bundling & Sidecar Preparation' (Protocol in workflow.md)**

## Phase 3: Tauri Integration
Scaffold the Tauri app and bridge it with the Spring Boot backend.

- [ ] **Task: Initialize Tauri**
    - [ ] Run `bun tauri init` in the `frontend` directory.
    - [ ] Configure `tauri.conf.json` (window title, dimensions, etc.).
- [ ] **Task: Implement Sidecar Orchestration**
    - [ ] Update `src-tauri/src/main.rs` to launch the Spring Boot JAR (using the bundled JRE) on app startup.
    - [ ] Pass the "Standalone Mode" flag/profile to the Spring Boot process via command-line arguments.
    - [ ] Ensure the backend process is killed when the Tauri window is closed.
- [ ] **Task: Frontend Port Synchronization**
    - [ ] Ensure the Tauri frontend correctly proxies or points to the Spring Boot port.
- [ ] **Task: Conductor - User Manual Verification 'Phase 3: Tauri Integration' (Protocol in workflow.md)**

## Phase 4: Packaging & Installer Generation
Generate the final distributable artifacts.

- [ ] **Task: Configure Bundling in Tauri**
    - [ ] Set up icons and installer metadata in `tauri.conf.json`.
    - [ ] Include the bundled JRE and backend JAR as "resources" or "sidecars".
- [ ] **Task: Build and Test Installer**
    - [ ] Run `bun tauri build` to generate the Windows `.msi`.
    - [ ] Install the generated package on a test machine/environment.
    - [ ] Verify that stories are saved to `%APPDATA%` and images persist after re-installation.
- [ ] **Task: Conductor - User Manual Verification 'Phase 4: Packaging & Installer Generation' (Protocol in workflow.md)**
