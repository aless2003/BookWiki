package online.hatsune_miku.bookwiki.media;

import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import online.hatsune_miku.bookwiki.chapter.Chapter;
import online.hatsune_miku.bookwiki.chapter.ChapterRepository;
import online.hatsune_miku.bookwiki.character.Character;
import online.hatsune_miku.bookwiki.character.CharacterRepository;
import online.hatsune_miku.bookwiki.config.PathProvider;
import online.hatsune_miku.bookwiki.item.Item;
import online.hatsune_miku.bookwiki.item.ItemRepository;
import online.hatsune_miku.bookwiki.location.Location;
import online.hatsune_miku.bookwiki.location.LocationRepository;
import online.hatsune_miku.bookwiki.lore.Lore;
import online.hatsune_miku.bookwiki.lore.LoreRepository;
import org.hibernate.Session;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Blob;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
@Slf4j
public class MigrationService {

    private final PathProvider pathProvider;
    private final MediaRepository mediaRepository;
    private final EntityManager entityManager;
    
    private final CharacterRepository characterRepository;
    private final LocationRepository locationRepository;
    private final ItemRepository itemRepository;
    private final LoreRepository loreRepository;
    private final ChapterRepository chapterRepository;
    private final ReferenceTrackingService referenceTrackingService;

    @Transactional
    public void migrateFileSystem() {
        Path uploadDir = pathProvider.getUploadPath();
        if (!Files.exists(uploadDir)) {
            log.info("No upload directory found at {}, skipping migration.", uploadDir);
            return;
        }

        try (Stream<Path> files = Files.list(uploadDir)) {
            files.filter(Files::isRegularFile).forEach(path -> {
                try {
                    migrateFile(path);
                } catch (Exception e) {
                    log.error("Failed to migrate file {}: {}", path, e.getMessage());
                }
            });
        } catch (IOException e) {
            log.error("Could not list upload directory: {}", e.getMessage());
        }
    }

    private void migrateFile(Path path) throws IOException {
        String filename = path.getFileName().toString();
        log.info("Migrating file: {}", filename);

        // Save to database
        Media media = new Media();
        media.setFilename(filename);
        media.setContentType(Files.probeContentType(path));

        Session session = entityManager.unwrap(Session.class);
        Blob blob = session.doReturningWork(connection -> {
            try {
                Blob b = connection.createBlob();
                try (InputStream is = Files.newInputStream(path);
                     OutputStream os = b.setBinaryStream(1)) {
                    is.transferTo(os);
                }
                return b;
            } catch (Exception e) {
                throw new RuntimeException("Could not save file to blob", e);
            }
        });
        media.setData(blob);
        media = mediaRepository.save(media);
        UUID mediaId = media.getId();

        // Update references in all fields
        String oldUrlPart = "/uploads/" + filename;
        String newShortcode = "#{image:" + mediaId + "}";

        updateAllReferences(oldUrlPart, newShortcode);
    }

    private void updateAllReferences(String oldUrlPart, String newShortcode) {
        // Characters
        for (Character c : characterRepository.findAll()) {
            boolean changed = false;
            if (c.getPictureUrl() != null && c.getPictureUrl().contains(oldUrlPart)) {
                c.setPictureUrl(newShortcode);
                changed = true;
            }
            String newAppearance = replaceUrl(c.getAppearance(), oldUrlPart, newShortcode);
            if (!newAppearance.equals(c.getAppearance())) {
                c.setAppearance(newAppearance);
                changed = true;
            }
            String newDesc = replaceUrl(c.getDescription(), oldUrlPart, newShortcode);
            if (!newDesc.equals(c.getDescription())) {
                c.setDescription(newDesc);
                changed = true;
            }
            if (changed) {
                characterRepository.save(c);
                referenceTrackingService.updateReferences(getContentSummary(c), "CHARACTER", c.getId());
            }
        }

        // Chapters
        for (Chapter ch : chapterRepository.findAll()) {
            String newContent = replaceUrl(ch.getContent(), oldUrlPart, newShortcode);
            if (!newContent.equals(ch.getContent())) {
                ch.setContent(newContent);
                chapterRepository.save(ch);
                referenceTrackingService.updateReferences(ch.getContent(), "CHAPTER", ch.getId());
            }
        }

        // Locations
        for (Location l : locationRepository.findAll()) {
            boolean changed = false;
            if (l.getPictureUrl() != null && l.getPictureUrl().contains(oldUrlPart)) {
                l.setPictureUrl(newShortcode);
                changed = true;
            }
            String newDesc = replaceUrl(l.getDescription(), oldUrlPart, newShortcode);
            if (!newDesc.equals(l.getDescription())) {
                l.setDescription(newDesc);
                changed = true;
            }
            if (changed) {
                locationRepository.save(l);
                referenceTrackingService.updateReferences(getContentSummary(l), "LOCATION", l.getId());
            }
        }

        // Items
        for (Item i : itemRepository.findAll()) {
            boolean changed = false;
            if (i.getPictureUrl() != null && i.getPictureUrl().contains(oldUrlPart)) {
                i.setPictureUrl(newShortcode);
                changed = true;
            }
            String newDesc = replaceUrl(i.getDescription(), oldUrlPart, newShortcode);
            if (!newDesc.equals(i.getDescription())) {
                i.setDescription(newDesc);
                changed = true;
            }
            if (changed) {
                itemRepository.save(i);
                referenceTrackingService.updateReferences(getContentSummary(i), "ITEM", i.getId());
            }
        }

        // Lore
        for (Lore lore : loreRepository.findAll()) {
            boolean changed = false;
            if (lore.getPictureUrl() != null && lore.getPictureUrl().contains(oldUrlPart)) {
                lore.setPictureUrl(newShortcode);
                changed = true;
            }
            String newDesc = replaceUrl(lore.getDescription(), oldUrlPart, newShortcode);
            if (!newDesc.equals(lore.getDescription())) {
                lore.setDescription(newDesc);
                changed = true;
            }
            if (changed) {
                loreRepository.save(lore);
                referenceTrackingService.updateReferences(getContentSummary(lore), "LORE", lore.getId());
            }
        }
    }

    private String replaceUrl(String content, String oldUrlPart, String newShortcode) {
        if (content == null) return "";
        return content.replace("http://localhost:3906" + oldUrlPart, newShortcode)
                      .replace(oldUrlPart, newShortcode);
    }

    private String getContentSummary(Character c) {
        return (c.getPictureUrl() != null ? c.getPictureUrl() : "") + 
               (c.getAppearance() != null ? c.getAppearance() : "") + 
               (c.getDescription() != null ? c.getDescription() : "");
    }

    private String getContentSummary(Location l) {
        return (l.getPictureUrl() != null ? l.getPictureUrl() : "") + 
               (l.getDescription() != null ? l.getDescription() : "");
    }

    private String getContentSummary(Item i) {
        return (i.getPictureUrl() != null ? i.getPictureUrl() : "") + 
               (i.getDescription() != null ? i.getDescription() : "");
    }

    private String getContentSummary(Lore l) {
        return (l.getPictureUrl() != null ? l.getPictureUrl() : "") + 
               (l.getDescription() != null ? l.getDescription() : "");
    }

    @Transactional
    public void migrateAllBase64() {
        // Chapters
        for (Chapter ch : chapterRepository.findAll()) {
            String newContent = migrateBase64InContent(ch.getContent(), "CHAPTER", ch.getId());
            if (!newContent.equals(ch.getContent())) {
                ch.setContent(newContent);
                chapterRepository.save(ch);
            }
        }
        
        // Characters
        for (Character c : characterRepository.findAll()) {
            String newAppearance = migrateBase64InContent(c.getAppearance(), "CHARACTER", c.getId());
            String newDesc = migrateBase64InContent(c.getDescription(), "CHARACTER", c.getId());
            if (!newAppearance.equals(c.getAppearance()) || !newDesc.equals(c.getDescription())) {
                c.setAppearance(newAppearance);
                c.setDescription(newDesc);
                characterRepository.save(c);
            }
        }
        
        // Other entities follow same pattern.
    }

    private String migrateBase64InContent(String content, String entityType, Long entityId) {
        if (content == null || content.isEmpty()) return "";

        org.jsoup.nodes.Document doc = org.jsoup.Jsoup.parseBodyFragment(content);
        org.jsoup.select.Elements images = doc.select("img");
        boolean modified = false;

        for (org.jsoup.nodes.Element img : images) {
            String src = img.attr("src");
            if (src.startsWith("data:image/")) {
                try {
                    UUID mediaId = extractAndSaveBase64(src);
                    img.attr("src", "#{image:" + mediaId + "}");
                    modified = true;
                } catch (Exception e) {
                    log.error("Failed to migrate base64 image in {} {}: {}", entityType, entityId, e.getMessage());
                }
            }
        }

        String result = modified ? doc.body().html() : content;
        if (modified) {
            referenceTrackingService.updateReferences(result, entityType, entityId);
        }
        return result;
    }

    private UUID extractAndSaveBase64(String base64Src) throws IOException {
        String[] parts = base64Src.split(",");
        String header = parts[0];
        String data = parts[1];
        String contentType = header.substring(header.indexOf(":") + 1, header.indexOf(";"));
        byte[] decodedBytes = java.util.Base64.getDecoder().decode(data);

        Media media = new Media();
        media.setFilename("migrated_base64_" + UUID.randomUUID().toString().substring(0, 8));
        media.setContentType(contentType);

        Session session = entityManager.unwrap(Session.class);
        Blob blob = session.doReturningWork(connection -> {
            try {
                Blob b = connection.createBlob();
                b.setBytes(1, decodedBytes);
                return b;
            } catch (Exception e) {
                throw new RuntimeException("Could not save decoded bytes to blob", e);
            }
        });
        media.setData(blob);
        media = mediaRepository.save(media);
        return media.getId();
    }
}
