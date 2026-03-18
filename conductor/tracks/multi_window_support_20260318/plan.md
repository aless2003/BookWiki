# Implementation Plan

## Phase 1: Tauri Window Management & Capabilities [checkpoint: 2fa71f0]
- [x] Task: Ensure Tauri v2 configuration (`tauri.conf.json` or capabilities files) allows the frontend to dynamically create new windows (`window:create` capability, etc.).
- [x] Task: Create a frontend utility (`WindowService.ts` or similar) that uses Tauri's window APIs to spawn a new `WebviewWindow` targeted at a specific React Route (e.g., `/story/:id/chapter/:chapterId`).
- [x] Task: Conductor - User Manual Verification 'Phase 1: Tauri Window Management & Capabilities' (Protocol in workflow.md)

## Phase 2: Middle-Click Integration in Sidebar
- [ ] Task: Update the sidebar navigation components to detect middle-click events (`onAuxClick` or checking `e.button === 1`).
- [ ] Task: Connect the middle-click event to the window creation utility, passing the correct route for the selected item, preventing default navigation behavior.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Middle-Click Integration in Sidebar' (Protocol in workflow.md)

## Phase 3: Middle-Click Integration in Editor Mentions
- [ ] Task: Update the rich text editor's mention extension logic. Modify the click handler to distinguish between left-click (`CTRL+Click`) and middle-click.
- [ ] Task: Route the middle-click on a mention to open a new Tauri window via the utility, while preserving the existing in-window navigation for `CTRL+Click`.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Middle-Click Integration in Editor Mentions' (Protocol in workflow.md)

## Phase 4: State & Context Verification
- [ ] Task: Verify that opening multiple windows allows editing without breaking backend synchronization or auto-saving functionality (ensure parallel windows maintain isolated state or sync via the backend correctly).
- [ ] Task: (Optional Refactor) Add URL parameters or state to the new window to optionally hide the main layout (sidebar/header) if it should look more like a dedicated pop-up, depending on UX testing.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: State & Context Verification' (Protocol in workflow.md)