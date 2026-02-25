# Implementation Plan: Species & Nature Worldbuilding Module

## Phase 1: Backend Setup
- [ ] Task: Create Species entity
    - [ ] Create `Species` class with JPA annotations (name, description, pictureUrl, customSections, category (ENUM: SPECIES, RACE, FLORA, FAUNA)).
    - [ ] Add `parentId` (Long) for hierarchical relationships.
    - [ ] Add `physicalTraits` (String) or individual fields (lifespan, size, diet).
    - [ ] Add `habitatId` (Long) linking to a Location.
- [ ] Task: Create Repository, Service, and Controller for Species
    - [ ] Implement `SpeciesRepository`.
    - [ ] Implement `SpeciesService` with CRUD operations and hierarchical fetching logic.
    - [ ] Implement `SpeciesController` with REST endpoints.
- [ ] Task: Update Character Entity
    - [ ] Add `speciesId` (Long) to `Character` entity.
    - [ ] Update `CharacterDTO` and `CharacterService` accordingly.
- [ ] Task: Conductor - User Manual Verification 'Backend Setup' (Protocol in workflow.md)

## Phase 2: Frontend API and UI Setup
- [ ] Task: Generate/Update Frontend Types and API Client
    - [ ] Add `Species` type definitions.
    - [ ] Create API functions for Species CRUD.
    - [ ] Update `Character` type to include `speciesId`.
- [ ] Task: Create "Species & Nature" UI Module
    - [ ] Adapt `Worldbuilding.tsx` to handle the new `Species` module alongside `Character` and `Location`.
    - [ ] Add a Dropdown for Category (Species, Race, Flora, Fauna).
    - [ ] Add Parent Species selection dropdown.
    - [ ] Add Habitat selection dropdown (fetching Locations).
    - [ ] Add Physical Traits input fields.
- [ ] Task: Conductor - User Manual Verification 'Frontend API and UI Setup' (Protocol in workflow.md)

## Phase 3: Integration and Mentions
- [ ] Task: Update Character UI
    - [ ] Add a dropdown in the Character editor to select a Species/Race.
    - [ ] Display the linked Species on the Character view.
- [ ] Task: Update TipTap Editor Mentions
    - [ ] Add `#species` support to the mention plugin and shortcode resolution system.
    - [ ] Ensure deep linking works in both the manuscript and other worldbuilding editors.
- [ ] Task: Update Navigation
    - [ ] Add "Species & Nature" to the main Worldbuilding sidebar navigation.
- [ ] Task: Conductor - User Manual Verification 'Integration and Mentions' (Protocol in workflow.md)