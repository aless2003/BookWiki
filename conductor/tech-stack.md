# Technology Stack

## Backend
- **Language:** Java 25
- **Framework:** Spring Boot 4.0.2 (Spring Initializr based)
- **Data Access:** Spring Data JPA with H2 (File-based)
- **Build System:** Gradle
- **Key Dependencies:**
  - `lombok`: For reducing boilerplate code.
  - `apache-tika`: For content detection and parsing.
  - `spring-boot-docker-compose`: For containerized development support.
  - `apache-poi`: For DOCX document generation.
  - `openpdf`: For PDF document generation.
  - `jsoup`: For HTML content parsing during export.
  - `jackson-datatype-jsr310`: For modern Java Date/Time serialization support.

## Frontend
- **Language:** TypeScript
- **Runtime & Package Manager:** Bun
- **Framework:** React 19
- **Build Tool:** Vite
- **UI Frameworks:** 
  - Material UI (MUI) - Primary for structured components.
  - React Bootstrap - Secondary for layout and specific components.
  - `notistack`: For standardized toast notifications across the application.
- **Rich Text Editing:** 
  - Tiptap v3 (Primary paged editor)
  - React Quill (Standardized robust editor)
- **Editor Extensions:**
  - `tiptap-pagination-plus`: For A4 paged layout and automatic pagination.
- `Custom ResizableImage`: Custom Tiptap extension for handle-based image resizing with A4 constraints and aspect ratio lock.
- `Custom InlineImage`: Tiptap extension for emoji-like inline images/emotes.
- **Routing:** React Router DOM

## Desktop Wrapper`n- **Framework:** Tauri v2 (Rust-based native wrapper)`n- **Sidecar:** Rust-based process orchestrator for the Spring Boot backend`n- **Bundled Runtime:** Minimal Java Runtime (JRE) generated via jlink`n`n## Infrastructure & DevOps
- **Database:** H2 (File-based)`n- **Persistence:** System-standard AppData folder for database and uploads in standalone mode
- **Portable Data Format:** `.bwiki` archives (ZIP-compressed JSON + Binary blobs) for backups and data exchange.
- **Development Environment:** Zero-install local development (Docker Compose no longer required for DB).
- **Frontend Integration:** Gradle-managed Bun build and sync process.`n- **Installer Automation:** Gradle-integrated Tauri build and packaging pipeline
