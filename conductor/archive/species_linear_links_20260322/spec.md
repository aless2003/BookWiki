# Specification: Species Evolutionary/Growth Linking

## Overview
This feature introduces the ability to create and visualize linear and branching relationships between Species in the Worldbuilding module. It enables writers to map out evolutionary lines, growth stages, alternative forms, and other sequential transitions (e.g., x -> y -> z, or x <-> y).

## Functional Requirements
- **Relationship Links:** Users MUST be able to define custom links between any two Species.
- **Link Types:** 
  - Unidirectional (x evolves into y)
  - Bidirectional (x and y are alternate forms of each other)
- **Custom Labels:** Every link MUST support a user-defined custom label to describe the relationship (e.g., "Corrupted form", "Adult stage", "Evolves when exposed to X").
- **Branching Paths:** The system MUST support branching, allowing a single species to link to multiple "next" stages or forms.
- **Visual Presentation:** The UI MUST display these relationships as a "Visual Flow Diagram" (e.g., A -> B -> C) on the Species detail page. This diagram will visualize the immediate connections, and optionally extended paths, to help users understand the progression.
- **Navigation:** Nodes within the visual flow diagram MUST be clickable, allowing users to navigate to the related species' detail pages.

## Non-Functional Requirements
- **Performance:** Loading the connected species for the flow diagram should be optimized to prevent slow page loads, particularly for deeply nested or highly branching evolution trees.
- **UX/UI:** The visual flow diagram should utilize Material UI patterns or a suitable diagramming library to ensure clarity and aesthetic consistency with the BookWiki interface.

## Out of Scope
- Automatic migration of existing Taxonomy Trees to this new structure (Taxonomy/Parent-Child is separate from linear Evolution paths).
- Complex conditions or stat requirements for evolutions that affect internal mechanics (this is purely informational worldbuilding).