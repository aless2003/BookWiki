# Specification: Species Taxonomy Tree View

## Overview
This feature introduces the ability to view the hierarchy of Species within a given story's worldbuilding database. From an individual Species detail page, users will be able to navigate to a dedicated Taxonomy Tree view. This view will visualize the immediate parent of the current species, the current species itself, and a fully expandable tree of all its descendants (sub-species).

## Functional Requirements
- **Dedicated Tree View Page:** A new UI page accessible via a button or link from any individual Species detail page.
- **Data Scope:** The tree must display:
  - The immediate parent of the current target species (if one exists).
  - The target species itself as a primary node.
  - All descendant sub-species of the target species, recursively loaded/displayed.
- **Visual Presentation:** The hierarchy will be presented as an Expandable Tree View.
- **Node Content:** Each node in the tree will display:
  - A small thumbnail image of the species (if available).
  - The name of the species.
- **Interaction and Navigation:** 
  - Clicking a node itself will expand or collapse its sub-species.
  - A distinct button or link (e.g., an icon or "View" button) on each node will allow the user to navigate to that species' dedicated detail page.

## Non-Functional Requirements
- **Performance:** Retrieving the recursive descendants should be efficient on the backend, avoiding excessive database queries (e.g., avoiding the N+1 query problem).
- **Styling:** The tree view should use Material UI components (like `TreeView` or equivalent) and match the overall aesthetic of the BookWiki application.

## Out of Scope
- Editing the species hierarchy directly from this tree view (read-only for now).
- Viewing ancestors beyond the immediate parent.