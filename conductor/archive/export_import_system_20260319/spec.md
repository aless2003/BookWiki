# Overview
This feature adds a data management system to BookWiki, allowing users to export their entire project database or individual stories into a portable format (`.bwiki` ZIP archive). It also enables importing these files to merge data into an existing installation, ensuring data portability and backup capabilities.

# Functional Requirements
- **Settings Page:** A new UI route and view for application-wide settings.
- **Navigation:** A Gear Icon button in the primary navigation bar to access the Settings page.
- **Export (Full):** Export all application data (Stories, Chapters, Worldbuilding entries, and all Media blobs) into a single `.bwiki` archive.
- **Export (Story-specific):** Select specific stories to export. The resulting archive will include the stories, their related chapters and worldbuilding, and only the media blobs referenced by those items.
- **Import:** Ability to upload a `.bwiki` file. The system will extract the data and merge it into the current database.
- **Merge Logic:** Import will append new data. To avoid conflicts, the system should handle ID remapping where necessary or ensure imported UUIDs (for media) and Long IDs (for other entities) are managed correctly during the merge.

# Non-Functional Requirements
- **Data Integrity:** Foreign key relationships must be maintained.
- **Format:** The `.bwiki` archive will contain a structured data file (e.g., JSON) and, if needed, binary files for blobs, or blobs embedded within the data file.

# Acceptance Criteria
- A Gear Icon is visible in the Navbar and navigates to `/settings`.
- User can perform a Full Export or a Story-Specific Export to a `.bwiki` file.
- User can import a `.bwiki` file, and the data is merged into their local database.
- Imported images/media work correctly in the editor and wiki after import.

# Out of Scope
- Direct H2 database file transfer (the portable format is preferred for merging).
- Cloud synchronization.