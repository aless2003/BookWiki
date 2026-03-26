# Specification: Species Custom Section Template Inheritance

## Overview
This feature allows a Parent Species to define "Templates" within its Custom Sections that are automatically inherited by all of its descendant sub-species. This is particularly useful for establishing standardized data structures, like "Stats" tables (e.g., in a Pokemon-like taxonomy), where the parent dictates the format, and the children provide the specific values.

## Functional Requirements
- **Inheritable Custom Sections:** On a Species page, users MUST be able to mark any Custom Section as "Inheritable" (a template for children).
- **Dynamic Initial Inheritance:** When a child species is viewed or created, it MUST automatically possess the Custom Sections marked as inheritable by its parent(s).
- **Child Customization:** The child species receives the *template* (the rich text structure, like tables or headings) from the parent. The user MUST be able to edit this inherited section on the child to input specific values, add rows, or remove irrelevant parts without affecting the parent's master template.
- **Smart Merge Updates:** If a parent modifies an inheritable Custom Section (e.g., adds a new column to a stats table) *after* a child has already customized it:
  - The system MUST attempt a "Smart Merge". It should try to inject the new structural elements from the parent into the child's customized version without overwriting or deleting the data the child has already entered.
  - *Note: This is a complex requirement involving rich text diffing/merging.*
- **UI Indicators:** 
  - On the Parent: A toggle or icon to indicate a section is "Inheritable".
  - On the Child: A visual badge/icon next to the section title indicating "Inherited from [Parent Name]".

## Non-Functional Requirements
- **Performance:** The "Smart Merge" algorithm must be efficient enough not to cause significant lag when updating a parent with many descendants.
- **Data Safety:** The merging process MUST prioritize preserving user-entered data on the child species over strict adherence to the parent template.

## Out of Scope
- Inheriting core fields (Description, Thumbnail, etc.). This feature strictly applies to dynamic Custom Sections.
- "Strict" templates where the child is physically locked out of modifying the structure (e.g., preventing them from deleting a table row). The child retains full editing rights.