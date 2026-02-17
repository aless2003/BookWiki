# Specification: Fix "Convert to Inline Image" Dialogue Styling

## Overview
The "Convert to Inline Image" dialogue currently displays with an incorrect light-themed background, which is inconsistent with the BookWiki project's Material UI dark theme. This track aims to ensure the dialogue container and its contents strictly adhere to the project's visual identity.

## Functional Requirements
- **Theme Alignment:** Update the dialogue component to use the project's standardized dark theme background.
- **Visual Consistency:** Ensure all child elements (text, inputs, buttons) within the dialogue are rendered with colors and styles that are legible and consistent with the dark theme.

## Non-Functional Requirements
- **Standardized Components:** Verify that the dialogue is using Material UI's `Dialog`, `DialogTitle`, `DialogContent`, and `DialogActions` components to benefit from automatic theme application.
- **Maintainability:** Avoid hardcoded hex codes; use theme variables (`theme.palette.background.paper`, etc.) where possible.

## Acceptance Criteria
- [ ] The dialogue background matches the rest of the Writing Studio's dark UI.
- [ ] Text within the dialogue is clearly legible (appropriate contrast).
- [ ] No regressions in dialogue functionality (conversion still works).

## Out of Scope
- Adding new features to the conversion dialogue.
- Modifying other dialogues or UI components not related to the "Inline Image" conversion.
