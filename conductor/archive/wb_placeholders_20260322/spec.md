# Specification: Worldbuilding Rich Text Placeholders

## Overview
Currently, newly created Worldbuilding entries (Characters, Locations, etc.) initialize their rich text fields with actual text nodes. This creates friction, as users must manually select and delete this text before writing. This feature will replace those actual text initializations with "ghost text" (UI placeholders) that disappear immediately when the user starts typing.

## Functional Requirements
- **Placeholder Implementation**: All rich text editors used in the Worldbuilding feature (Description, Custom Sections, and type-specific fields like 'Where is it?') MUST use native editor placeholders instead of actual text content when empty.
- **Context-Aware Text**: The placeholders MUST display context-aware hints based on the field they represent.
  - Example for Character Description: "Write a description for this character..."
  - Example for a Custom Section named 'History': "Details for History..."
  - Example for Location 'Where is it?': "Describe where this location is..."
- **New Entries Initialization**: Newly created entries or newly added custom sections MUST have their text content initialized as truly empty strings or null in the database/state, relying entirely on the frontend placeholder for visual guidance.

## Non-Functional Requirements
- **User Experience**: The placeholder text must be visually distinct from actual text (e.g., using a lighter font color) and immediately yield to user input when clicked.

## Out of Scope
- **Data Migration**: Existing entries that already have the old "actual text" saved to the database will NOT be automatically migrated. Users will be responsible for manually deleting the old text in those existing entries if they wish.
- **Modifications to the Writing Studio**: This change is restricted to Worldbuilding entry fields, not the main manuscript editor.