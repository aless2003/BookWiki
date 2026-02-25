# Specification: Species & Nature Worldbuilding Module

## Overview
Introduce a unified "Species & Nature" worldbuilding module within BookWiki. This module will allow authors to define and categorize species, races, flora, and fauna, enhancing the depth of their story's lore and cross-referencing capabilities.

## Functional Requirements
- **Unified Module Structure:** A single new section in the Worldbuilding navigation for "Species & Nature" with a categorization system (dropdown: Species, Race, Flora, Fauna).
- **Hierarchical Relationships:** Support for parent/child relationships (e.g., a "Race" can be linked as a child to a parent "Species").
- **Core Attributes:** Standard name, picture URL, description, and custom sections (TipTap editor support like Characters/Locations).
- **Physical Traits:** Specific fields for Physical Traits (e.g., Lifespan, Average Size, Diet).
- **Location Linking (Habitat):** Ability to link a species/flora/fauna to specific Locations where they are found.
- **Character Integration:** Update the existing Character entity and UI to include a field linking a character to their corresponding Species/Race.
- **Deep Linking/Shortcodes:** Ensure `#species:id` or similar shortcode works seamlessly in manuscripts and other rich text areas.

## Non-Functional Requirements
- **Consistency:** Use the generic Worldbuilding UI components established by Characters and Locations where applicable.
- **Performance:** Ensure fetching hierarchical species data does not introduce noticeable latency.

## Acceptance Criteria
- [ ] User can create, edit, and delete entries in the "Species & Nature" module.
- [ ] User can categorize an entry as Species, Race, Flora, or Fauna.
- [ ] User can assign a parent Species to a Race/Sub-species.
- [ ] User can link Locations to an entry as its Habitat.
- [ ] User can specify Physical Traits.
- [ ] User can edit a Character and link them to a Species/Race.
- [ ] Mentioning the entity in the text editor auto-completes and deep-links correctly.

## Out of Scope
- Detailed genetic tracking or evolutionary trees beyond simple Parent/Child hierarchies.
- Generating stats or complex numerical simulations based on physical traits.