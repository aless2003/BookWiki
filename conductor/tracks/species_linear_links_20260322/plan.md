# Implementation Plan: Species Evolutionary/Growth Linking

## Phase 1: Database and Backend Setup
- [ ] Task: Create `SpeciesLink` Entity.
    - [ ] Add properties: `id`, `sourceSpeciesId`, `targetSpeciesId`, `label` (String), `isBidirectional` (Boolean).
    - [ ] Create corresponding Repository, Service, and DTOs.
- [ ] Task: Update Species Service and Controller.
    - [ ] Add endpoints to create, update, and delete `SpeciesLink` records.
    - [ ] Add an endpoint to fetch the "flow" network (nodes and edges) for a given Species (resolving both incoming and outgoing links).
- [ ] Task: Write backend unit and integration tests for `SpeciesLink` operations.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database and Backend Setup' (Protocol in workflow.md)

## Phase 2: Frontend Data Management
- [ ] Task: Create Frontend API service for Species Links.
    - [ ] Define types for `SpeciesLink` requests and responses.
    - [ ] Add React Query hooks (or equivalent fetch logic) to manage creating, deleting, and fetching links.
- [ ] Task: UI for Creating/Managing Links.
    - [ ] Add a section on the Species detail page to "Add Related Species".
    - [ ] Implement a modal/form to select another species, provide a custom label, and toggle unidirectional/bidirectional.
    - [ ] Implement a simple list view in the edit mode to delete/manage these links.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Data Management' (Protocol in workflow.md)

## Phase 3: Visual Flow Diagram Implementation
- [ ] Task: Research and select a React diagramming library (e.g., React Flow) or implement a custom Canvas/SVG flow diagram using MUI.
    - [ ] Document library choice in `tech-stack.md` if adding a new dependency.
- [ ] Task: Implement `SpeciesFlowDiagram` Component.
    - [ ] Process backend network data into Nodes (Species) and Edges (Links with labels and direction arrows).
    - [ ] Render the interactive diagram on the Species detail page.
    - [ ] Implement node click handlers to navigate to the respective Species page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visual Flow Diagram Implementation' (Protocol in workflow.md)