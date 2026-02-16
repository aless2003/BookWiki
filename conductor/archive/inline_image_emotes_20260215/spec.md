# Specification: Inline Images & Emotes

## 1. Overview

This feature introduces the ability to convert standard block-level images into inline, non-resizable, emoji-like images. These can be single-use inline images, or they can be optionally named to become reusable "emotes" that can be inserted via a shortcut.

## 2. Functional Requirements

- **Conversion:** A user can convert a standard `ResizableImage` block into an inline image/emote.
- **Optional Naming:**
    - Upon conversion, the user will be prompted to optionally provide a unique name.
    - If a name is provided, the image becomes a reusable "emote".
    - If no name is provided, it becomes a single-use inline image.
- **Rendering:**
    - All inline images/emotes will render inline with the text.
    - They **must** have a square aspect ratio.
    - Their size will be relative to the surrounding font size (e.g., `height: 1.5em; width: 1.5em;`).
- **Reuse (Emotes only):** Named emotes can be inserted by typing a colon-prefixed shortcut (e.g., `:emoteName:`), which will trigger a suggestion list.
- **Storage (Emotes only):** Named emotes (name and image URL) must be stored and associated with the current story or project to be available for reuse.

## 3. Technical Implementation

- **New Tiptap Node:** A new Tiptap extension, `inlineImage`, will be created.
    - The node will have attributes for `src`, and an optional `emoteName`.
    - It will render as an `<img>` tag with styling to enforce a square aspect ratio and relative size (e.g., `display: inline-block; height: 1.5em; width: 1.5em; object-fit: cover;`).
- **Conversion Flow:**
    - The `ResizableImage` component's floating menu will have a "Convert to Inline Image" button.
    - This will trigger a modal where the user can optionally enter a name.
- **Emote Shortcut:**
    - Tiptap's `Mention` extension will be configured to trigger on the `:` character.
    - It will be fed the list of available named emotes.
- **Data Persistence (Emotes only):**
    - A new backend API endpoint and database table will be required to store and retrieve named emotes if a name is provided.

## 4. Acceptance Criteria

- A user can convert a standard image into an inline image without providing a name.
- A user can convert a standard image into a named emote.
- Both types render as square, inline, and scale with font size.
- Typing `:...` brings up a list of *named* emotes only.
- Unnamed inline images are not available in the shortcut menu.
- Named emotes persist and are available for reuse.

## 5. Out of Scope

- Managing (editing, deleting) named emotes after they are created.
- Global emotes available across all projects.
