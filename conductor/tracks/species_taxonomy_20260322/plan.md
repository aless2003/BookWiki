# Implementation Plan: Species Taxonomy Tree View

## Phase 1: Backend API for Taxonomy Tree [checkpoint: 14218ab]
- [x] Task: Define DTOs for Taxonomy Tree.
    - [x] Create `SpeciesTreeNodeDTO` (id, name, pictureUrl, children).
    - [x] Create `SpeciesTaxonomyDTO` (parent node, target node).
- [x] Task: Write Tests for Taxonomy Service.
    - [x] Create unit tests verifying correct parent assignment and recursive descendant mapping.
- [x] Task: Implement Repository/Service methods.
    - [x] Add logic to fetch and construct the tree structure (immediate parent + recursive descendants) for a given species.
- [x] Task: Create Controller Endpoint.
    - [x] Add `GET /api/stories/{storyId}/species/{speciesId}/taxonomy` endpoint.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Backend API for Taxonomy Tree' (Protocol in workflow.md)

## Phase 2: Frontend Setup and Routing
- [~] Task: Create Taxonomy Tree View Component scaffolding.
    - [x] Scaffold `SpeciesTaxonomy.tsx` component.
    - [x] Implement React Router route for `/stories/:storyId/species/:speciesId/taxonomy`.
- [x] Task: Add Navigation Link in Species Detail Page.
    - [x] Add a "View Taxonomy Tree" button on the `Worldbuilding` / `Species` detail view linking to the new route.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Frontend Setup and Routing' (Protocol in workflow.md)

## Phase 3: Frontend Tree Implementation
- [ ] Task: Write Tests for Taxonomy View.
    - [ ] Write frontend component tests ensuring data fetching and correct rendering of the tree nodes.
- [ ] Task: Implement Expandable Tree UI.
    - [ ] Fetch data from the new backend API endpoint.
    - [ ] Render the tree hierarchy using an expandable component structure (e.g., Material UI `TreeView` or custom recursive components).
    - [ ] Render each node with a small thumbnail and the species name.
    - [ ] Configure node click to toggle expansion/collapse.
    - [ ] Add an explicit "View" icon/button to each node to navigate to its respective species page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Frontend Tree Implementation' (Protocol in workflow.md)