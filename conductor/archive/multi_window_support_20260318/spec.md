# Overview
This feature introduces the ability for users to open world-building entries (e.g., characters, items) or writing chapters in additional, native OS-level windows. This allows writers to have reference material or secondary editing views open simultaneously alongside their primary workspace, potentially spread across multiple monitors.

# Functional Requirements
- **Native OS Windows:** The application will utilize Tauri's multi-window capabilities to spawn and manage secondary windows.
- **Trigger Actions:** 
  - Middle-clicking a world-building entry or chapter in the navigation sidebar will open it in a new native window.
  - Middle-clicking a mention (e.g., a character shortcode) within the rich text editor will open the referenced entry in a new native window.
  - Standard `CTRL+Click` on a mention will continue to navigate the current (active) window to that entry.
- **Editable Content:** Content displayed in these secondary windows must be fully editable, mirroring the functionality of the main view.
- **Data Synchronization:** Edits made in the secondary window must be saved properly and synchronized to the backend, ensuring data integrity across the application.

# Non-Functional Requirements
- Spawning new windows should be performant and not significantly degrade the performance of the main application.
- State management and save logic (e.g., auto-save on blur) must function correctly within the context of a secondary window.

# Acceptance Criteria
- Middle-clicking an item in the sidebar successfully launches a new Tauri window containing only that item's view.
- Middle-clicking a mention in the text editor launches a new Tauri window for that specific mention.
- The user can edit text, attributes, or properties within the new window and have those changes save successfully.
- `CTRL+Click` retains its original behavior of navigating within the existing window.

# Out of Scope
- Complex in-app window management (docking, tiling panels); window positioning and management will be handled by the user's Operating System.