package online.hatsune_miku.bookwiki.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaRepository;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import online.hatsune_miku.bookwiki.species.Species;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.hibernate.Session;
import java.sql.Blob;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ImportService {

    private final StoryRepository storyRepository;
    private final MediaRepository mediaRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    public ImportService(StoryRepository storyRepository, MediaRepository mediaRepository, ObjectMapper objectMapper) {
        this.storyRepository = storyRepository;
        this.mediaRepository = mediaRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void importPackage(MultipartFile file) throws IOException {
        System.out.println("Importing file: " + file.getOriginalFilename() + " (" + file.getSize() + " bytes)");
        try (InputStream is = file.getInputStream();
             ZipInputStream zis = new ZipInputStream(is)) {
            
            ZipEntry entry;
            boolean found = false;
            while ((entry = zis.getNextEntry()) != null) {
                System.out.println("Found ZIP entry: " + entry.getName());
                if ("data.json".equals(entry.getName())) {
                    found = true;
                    ByteArrayOutputStream buffer = new ByteArrayOutputStream();
                    byte[] data = new byte[4096];
                    int nRead;
                    while ((nRead = zis.read(data, 0, data.length)) != -1) {
                        buffer.write(data, 0, nRead);
                    }
                    DataPackage dataPackage = objectMapper.readValue(buffer.toByteArray(), DataPackage.class);
                    processImport(dataPackage);
                }
                zis.closeEntry();
            }
            if (!found) {
                System.out.println("CRITICAL: data.json not found in the archive!");
            }
        }
    }

    @Transactional
    public void resetAll() {
        System.out.println("CRITICAL: Resetting application data...");
        storyRepository.deleteAll();
        mediaRepository.deleteAll();
        System.out.println("Reset complete.");
    }

    private void processImport(DataPackage dataPackage) {
        try {
            System.out.println("Processing import. Stories: " + (dataPackage.getStories() != null ? dataPackage.getStories().size() : 0));
            
            // 1. Import Media first
            if (dataPackage.getMedia() != null) {
                Session session = entityManager.unwrap(Session.class);
                for (MediaDTO mediaDTO : dataPackage.getMedia()) {
                    System.out.println("Merging media: " + mediaDTO.getId());
                    
                    // Use a clean merge approach: merge always checks if entity exists and updates or inserts accordingly.
                    // We create a new instance each time to avoid any side effects from previously managed instances.
                    Media media = new Media();
                    media.setId(mediaDTO.getId());
                    media.setFilename(mediaDTO.getFilename());
                    media.setContentType(mediaDTO.getContentType());
                    media.setCreatedAt(mediaDTO.getCreatedAt() != null ? mediaDTO.getCreatedAt() : LocalDateTime.now());
                    
                    if (mediaDTO.getData() != null) {
                        // Use the same robust pattern as MigrationService to create Blobs
                        Blob blob = session.doReturningWork(connection -> {
                            try {
                                Blob b = connection.createBlob();
                                b.setBytes(1, mediaDTO.getData());
                                return b;
                            } catch (Exception e) {
                                throw new RuntimeException("Could not create blob from data", e);
                            }
                        });
                        media.setData(blob);
                    }
                    
                    entityManager.merge(media);
                }
                entityManager.flush();
            }

            // 2. Import Stories
            if (dataPackage.getStories() != null) {
                for (Story story : dataPackage.getStories()) {
                    System.out.println("Importing story: " + story.getTitle());
                    prepareForImport(story);
                    entityManager.persist(story);
                }
                entityManager.flush();
            }
        } catch (Exception e) {
            System.err.println("FATAL ERROR DURING IMPORT:");
            e.printStackTrace();
            throw e;
        }
    }

    private void prepareForImport(Story story) {
        story.setId(null);
        
        if (story.getChapters() != null) {
            story.getChapters().forEach(c -> {
                c.setId(null);
                c.setStory(story);
            });
        }
        
        if (story.getCharacters() != null) {
            story.getCharacters().forEach(c -> {
                c.setId(null);
                c.setStory(story);
                if (c.getCustomSections() != null) {
                    c.getCustomSections().forEach(s -> {
                        s.setId(null);
                        s.setCharacter(c);
                    });
                }
            });
        }
        
        if (story.getLocations() != null) {
            story.getLocations().forEach(l -> {
                l.setId(null);
                l.setStory(story);
                if (l.getCustomSections() != null) {
                    l.getCustomSections().forEach(s -> {
                        s.setId(null);
                        s.setLocation(l);
                    });
                }
            });
        }
        
        if (story.getItems() != null) {
            story.getItems().forEach(i -> {
                i.setId(null);
                i.setStory(story);
                if (i.getCustomSections() != null) {
                    i.getCustomSections().forEach(s -> {
                        s.setId(null);
                        s.setItem(i);
                    });
                }
            });
        }
        
        if (story.getLores() != null) {
            story.getLores().forEach(l -> {
                l.setId(null);
                l.setStory(story);
                if (l.getCustomSections() != null) {
                    l.getCustomSections().forEach(s -> {
                        s.setId(null);
                        s.setLore(l);
                    });
                }
            });
        }

        if (story.getSpecies() != null) {
            story.getSpecies().forEach(s -> {
                s.setId(null);
                s.setStory(story);
                if (s.getCustomSections() != null) {
                    s.getCustomSections().forEach(cs -> {
                        cs.setId(null);
                        cs.setSpecies(s);
                    });
                }
            });
        }

        if (story.getEmotes() != null) {
            story.getEmotes().forEach(e -> {
                e.setId(null);
                e.setStory(story);
            });
        }
    }
}
