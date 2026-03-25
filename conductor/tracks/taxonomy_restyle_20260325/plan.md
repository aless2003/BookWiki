# Implementation Plan: Taxonomy View Design Fix (Dark Mode & MUI)

## Phase 1: Environment Setup & MUI X Integration [checkpoint: 77b2b2d]
- [x] Task: Install `@mui/x-tree-view` package for standard Material UI tree structures.
- [x] Task: Wrap `SpeciesTaxonomy.tsx` in `ThemeProvider` using the global `darkTheme`.
- [x] Task: Add `CssBaseline` to ensure consistent global background and text colors.
- [x] Task: Conductor - User Manual Verification 'Phase 1: Environment Setup & MUI X Integration' (Protocol in workflow.md)

## Phase 2: Restyling the Taxonomy Tree View [checkpoint: 7a8da29]
- [x] Task: Refactor `TreeNode` in `SpeciesTaxonomy.tsx` to use `useTheme()` for all dynamic styles.
- [x] Task: Pilot `@mui/x-tree-view` implementation for the hierarchy tree to replace custom recursive components if applicable.
- [x] Task: Ensure node avatars and actions (view button) follow the established design patterns from the `Worldbuilding` page.
- [x] Task: Conductor - User Manual Verification 'Phase 2: Restyling the Taxonomy Tree View' (Protocol in workflow.md)

## Phase 3: Relationship Network (React Flow) Restyle
- [x] Task: Refactor `SpeciesNode` in `SpeciesFlowDiagram.tsx` to use Material UI `Card` and `Paper` components with `nodrag` on buttons.
- [x] Task: Implement expansion toggle (collapse) logic in `SpeciesFlowDiagram.tsx`.
- [x] Task: Implement theme-based colors for edges, markers, and labels (removing all hardcoded hex values).
- [~] Task: Update the `ReactFlow` container and background to use consistent theme background colors.
- [ ] Task: Conductor - User Manual Verification 'Phase 3: Relationship Network (React Flow) Restyle' (Protocol in workflow.md)

## Phase 4: Consistency Audit & Final Polishing
- [ ] Task: Audit the entire `SpeciesTaxonomy` page for spacing (using `sx` or `Theme`) and font consistency.
- [ ] Task: Verify that navigation and interactions match the "native" feel of the desktop application.
- [ ] Task: Perform a side-by-side comparison with the `Worldbuilding` view to ensure seamless visual transition.
- [ ] Task: Conductor - User Manual Verification 'Phase 4: Consistency Audit & Final Polishing' (Protocol in workflow.md)
