# Specification: Taxonomy View Design Fix (Dark Mode & MUI)

## Overview
Restyle the `SpeciesTaxonomy` page and its sub-components to be fully consistent with the application's Material UI dark theme. Currently, the taxonomy view lacks a global theme provider and uses hardcoded color values.

## Functional Requirements
- **Theme Integration:**
    - Wrap the `SpeciesTaxonomy` page in the project's `darkTheme` using `ThemeProvider`.
    - Add `CssBaseline` to ensure consistent global styles.
    - Replace all hardcoded hex color values in `SpeciesTaxonomy.tsx` and `SpeciesFlowDiagram.tsx` with MUI theme palette variables (`primary.main`, `background.paper`, `divider`, etc.).
- **Taxonomy Tree (Hierarchy View):**
    - Refactor the tree view to use a more standardized Material UI approach.
    - Pilot the use of `@mui/x-tree-view` for the taxonomy tree.
    - Ensure nodes (Avatar, Name, Actions) follow the Material UI design language.
- **Relationship Network (Flow View):**
    - Update React Flow nodes to use `MUI Card` styling with appropriate padding, border-radius (12px per `theme.ts`), and shadows.
    - Style edges and markers using theme primary colors (`#90caf9`).
    - Use theme background colors for node backgrounds and flow canvas background.

## Non-Functional Requirements
- **Consistency:** Use spacing (sx prop) and component-level overrides from `theme.ts`.
- **Performance:** Maintain smooth zooming and panning in the relationship network.
- **Maintainability:** Avoid hardcoded style constants outside the global theme.

## Acceptance Criteria
- [ ] The `SpeciesTaxonomy` page is correctly rendered with the global dark theme.
- [ ] The Taxonomy Tree view uses Material UI components (either custom or via MUI X).
- [ ] Network view nodes are visually consistent with cards used in the `Worldbuilding` view.
- [ ] All icons and text colors automatically adjust to the dark theme palette.

## Out of Scope
- Adding new data fields to the taxonomy API.
- Changing the underlying tree or network algorithms.
