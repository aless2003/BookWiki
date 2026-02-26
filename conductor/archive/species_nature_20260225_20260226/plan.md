# Implementation Plan: Species & Nature Worldbuilding Module

## Phase 1: Backend Setup [checkpoint: 72e151c]
- [x] Task: Create Species entity
    - [x] Create `Species` class with JPA annotations (name, description, pictureUrl, customSections, category (ENUM: SPECIES, RACE, FLORA, FAUNA)).
    - [x] Add `parentId` (Long) for hierarchical relationships.
    - [x] Add `physicalTraits` (String) or individual fields (lifespan, size, diet).
    - [x] Add `habitatId` (Long) linking to a Location.
- [x] Task: Create Repository, Service, and Controller for Species
    - [x] Implement `SpeciesRepository`.
    - [x] Implement `SpeciesService` with CRUD operations and hierarchical fetching logic.
    - [x] Implement `SpeciesController` with REST endpoints.
- [x] Task: Update Character Entity
    - [x] Add `speciesId` (Long) to `Character` entity.
    - [x] Update `CharacterDTO` and `CharacterService` accordingly.
- [x] Task: Conductor - User Manual Verification 'Backend Setup' (Protocol in workflow.md)

## Phase 2: Frontend API and UI Setup [checkpoint: c27230a]
- [x] Task: Generate/Update Frontend Types and API Client
    - [x] Add `Species` type definitions.
    - [x] Create API functions for Species CRUD. (Handled via generic fetch in Worldbuilding.tsx)
    - [x] Update `Character` type to include `speciesId`.
- [x] Task: Create "Species & Nature" UI Module
    - [x] Adapt `Worldbuilding.tsx` to handle the new `Species` module alongside `Character` and `Location`.
    - [x] Add a Dropdown for Category (Species, Race, Flora, Fauna).
    - [x] Add Parent Species selection dropdown.
    - [x] Add Habitat selection dropdown (fetching Locations).
    - [x] Add Physical Traits input fields.
- [x] Task: Conductor - User Manual Verification 'Frontend API and UI Setup' (Protocol in workflow.md)

## Phase 3: Integration and Mentions
- [x] Task: Update Character UI
    - [x] Add a dropdown in the Character editor to select a Species/Race.
    - [x] Display the linked Species on the Character view.
- [x] Task: Update TipTap Editor Mentions
    - [x] Add `#species` support to the mention plugin and shortcode resolution system.
    - [x] Ensure deep linking works in both the manuscript and other worldbuilding editors.
- [x] Task: Update Navigation
    - [x] Add "Species & Nature" to the main Worldbuilding sidebar navigation.
- [~] Task: Conductor - User Manual Verification 'Integration and Mentions' (Protocol in workflow.md)