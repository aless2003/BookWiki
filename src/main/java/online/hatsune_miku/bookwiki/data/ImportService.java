package online.hatsune_miku.bookwiki.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaRepository;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import online.hatsune_miku.bookwiki.species.Species;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.sql.rowset.serial.SerialBlob;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ImportService {

    private final StoryRepository storyRepository;
    private final MediaRepository mediaRepository;
    private final ObjectMapper objectMapper;

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

    private void processImport(DataPackage dataPackage) {
        System.out.println("Processing import. Stories: " + (dataPackage.getStories() != null ? dataPackage.getStories().size() : 0));
        // 1. Import Media first (preserving UUIDs if possible, or remapping if necessary)
        // We preserve UUIDs because they are used in shortcodes within text fields.
        if (dataPackage.getMedia() != null) {
            for (MediaDTO mediaDTO : dataPackage.getMedia()) {
                if (!mediaRepository.existsById(mediaDTO.getId())) {
                    System.out.println("Saving media: " + mediaDTO.getFilename());
                    Media media = new Media();
                    media.setId(mediaDTO.getId());
                    media.setFilename(mediaDTO.getFilename());
                    media.setContentType(mediaDTO.getContentType());
                    media.setCreatedAt(mediaDTO.getCreatedAt());
                    
                    try {
                        media.setData(new SerialBlob(mediaDTO.getData()));
                        mediaRepository.save(media);
                    } catch (Exception e) {
                        System.err.println("Failed to save media: " + mediaDTO.getId());
                    }
                }
            }
        }

        // 2. Import Stories
        // Since we are "Appending", we want to create NEW stories.
        // We must nullify IDs to let JPA generate new ones.
        if (dataPackage.getStories() != null) {
            for (Story story : dataPackage.getStories()) {
                System.out.println("Importing story: " + story.getTitle());
                prepareForImport(story);
                Story saved = storyRepository.save(story);
                System.out.println("Saved story with new ID: " + saved.getId());
            }
        }
    }

    private void prepareForImport(Story story) {
        story.setId(null);
        
        // Chapters
        if (story.getChapters() != null) {
            story.getChapters().forEach(c -> {
                c.setId(null);
                c.setStory(story);
            });
        }
        
        // Characters
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
        
        // Locations
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
        
        // Items
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
        
        // Lore
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

        // Species
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
                // Warning: parentId and habitatId references will be broken if they pointed to other entities in the same export
                // remaping these would require a more complex multi-pass import.
                // For now we accept that internal Long-ID references might break on import merge.
            });
        }

        // Emotes
        if (story.getEmotes() != null) {
            story.getEmotes().forEach(e -> {
                e.setId(null);
                e.setStory(story);
            });
        }
    }
}
