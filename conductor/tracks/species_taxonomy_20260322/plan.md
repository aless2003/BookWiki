# Implementation Plan: Species Taxonomy Tree View

## Phase 1: Backend API for Taxonomy Tree
- [ ] Task: Define DTOs for Taxonomy Tree.
    - [ ] Create `SpeciesTreeNodeDTO` (id, name, pictureUrl, children).
    - [ ] Create `SpeciesTaxonomyDTO` (parent node, target node).
- [ ] Task: Write Tests for Taxonomy Service.
    - [ ] Create unit tests verifying correct parent assignment and recursive descendant mapping.
- [ ] Task: Implement Repository/Service methods.
    - [ ] Add logic to fetch and construct the tree structure (immediate parent + recursive descendants) for a given species.
- [ ] Task: Create Controller Endpoint.
    - [ ] Add `GET /api/stories/{storyId}/species/{speciesId}/taxonomy` endpoint.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Backend API for Taxonomy Tree' (Protocol in workflow.md)

## Phase 2: Frontend Setup and Routing
- [ ] Task: Create Taxonomy Tree View Component scaffolding.
    - [ ] Scaffold `SpeciesTaxonomy.tsx` component.
    - [ ] Implement React Router route for `/stories/:storyId/species/:speciesId/taxonomy`.
- [ ] Task: Add Navigation Link in Species Detail Page.
    - [ ] Add a "View Taxonomy Tree" button on the `Worldbuilding` / `Species` detail view linking to the new route.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Setup and Routing' (Protocol in workflow.md)

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