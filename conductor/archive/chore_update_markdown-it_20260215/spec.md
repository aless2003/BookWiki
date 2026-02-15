# Specification: Update markdown-it to 14.1.1

## 1. Overview

This track involves updating the `markdown-it` package from version `14.1.0` to `14.1.1`. This is a maintenance chore intended to patch a security vulnerability. The `markdown-it` package is a transitive dependency, pulled in by the Tiptap rich text editor via `prosemirror-markdown`.

## 2. Rationale

Versions of the package `markdown-it` from 13.0.0 and before 14.1.1 are vulnerable to Regular Expression Denial of Service (ReDoS) due to the use of the regex `/*+$/` in the linkify function. An attacker can supply a long sequence of `*` characters followed by a non-matching character, which triggers excessive backtracking and may lead to a denial-of-service condition.

## 3. Functional Requirements

- The `markdown-it` package version used in the project must be exactly `14.1.1`.
- The update will be performed by adding an `overrides` entry in the `frontend/package.json` file.
- The functionality of the Tiptap editor should remain unchanged after the update.

## 4. Acceptance Criteria

- The `markdown-it` version is confirmed to be `14.1.1` by inspecting the lockfile or using `bun why markdown-it`.
- Manual testing of the Tiptap editor's markdown capabilities (e.g., creating links, bolding text, using lists) reveals no regressions or unexpected behavior.

## 5. Out of Scope

- Upgrading any other packages.
- Writing automated tests for this change.
