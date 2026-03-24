# Specification: Global Save Indicator (Toast Notifications)

## Overview
This feature introduces a global visual feedback system to inform the user about the state of their data across the application (Writing Studio, Worldbuilding Wiki, etc.). It will use toast/snackbar notifications to clearly communicate when changes are unsaved, successfully saved, or when a save operation fails.

## Functional Requirements
- **Global Availability:** The save indicator system MUST be available and implemented across all data-entry areas of the application (Writing Studio, Worldbuilding, Settings, etc.).
- **Visual Style:** The feedback MUST be presented as non-intrusive Toast/Snackbar notifications (e.g., using MUI's Snackbar component).
- **Supported States:**
  - **Success State:** Display a brief notification (e.g., "Saved successfully") when an auto-save or manual save operation completes without errors. This notification should dismiss itself automatically.
  - **Error State:** Display a prominent notification (e.g., "Failed to save. Please try again.") if a save operation encounters a network or server error. This notification should ideally persist until dismissed by the user or until a subsequent save succeeds.
  - **Unsaved Changes State:** Display a subtle, persistent indicator (or a specific warning if attempting to navigate away) when there are local edits that have not yet been synced to the database.

## Non-Functional Requirements
- **Non-blocking UX:** The notifications must not interrupt the user's workflow or steal focus from the editor.
- **Consistency:** The design and wording of the notifications must be consistent across all modules.

## Out of Scope
- Detailed version history or rollback mechanisms.
- Changing the existing auto-save trigger mechanisms (e.g., blur events, timers); this feature only adds visual feedback *to* those existing mechanisms.