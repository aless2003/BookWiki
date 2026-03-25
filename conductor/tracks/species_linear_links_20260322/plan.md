# Implementation Plan: Species Evolutionary/Growth Linking

## Phase 1: Database and Backend Setup [checkpoint: b258030]
- [x] Task: Create `SpeciesLink` Entity.
    - [x] Add properties: `id`, `sourceSpeciesId`, `targetSpeciesId`, `label` (String), `isBidirectional` (Boolean).
    - [x] Create corresponding Repository, Service, and DTOs.
- [x] Task: Update Species Service and Controller.
    - [x] Add endpoints to create, update, and delete `SpeciesLink` records.
    - [x] Add an endpoint to fetch the "flow" network (nodes and edges) for a given Species (resolving both incoming and outgoing links).
- [x] Task: Write backend unit and integration tests for `SpeciesLink` operations.
- [ ] Task: Conductor - User Manual Verification 'Phase 1: Database and Backend Setup' (Protocol in workflow.md)

## Phase 2: Frontend Data Management
- [x] Task: Create Frontend API service for Species Links.
    - [x] Define types for `SpeciesLink` requests and responses.
    - [x] Add API functions (fetch) to manage creating, deleting, and fetching links.
- [x] Task: UI for Creating/Managing Links.
    - [x] Add a section on the Species detail page to "Add Related Species".
    - [x] Implement a form to select another species, provide a custom label, and toggle unidirectional/bidirectional.
    - [x] Implement a list view in the edit mode to delete/manage these links.
- [ ] Task: Conductor - User Manual Verification 'Phase 2: Frontend Data Management' (Protocol in workflow.md)

## Phase 3: Visual Flow Diagram Implementation
- [x] Task: Research and select a React diagramming library (e.g., React Flow).
    - [x] Document library choice in `tech-stack.md`.
- [x] Task: Implement `SpeciesFlowDiagram` Component using `reactflow`.
    - [x] Process backend network data into Nodes (Species) and Edges (Links with labels and direction arrows).
    - [x] Render the interactive diagram on the Species detail page.
    - [x] Implement node click handlers to navigate to the respective Species page.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Visual Flow Diagram Implementation' (Protocol in workflow.md)

## Phase: Review Fixes
- [x] Task: Apply review suggestions c9d8fae