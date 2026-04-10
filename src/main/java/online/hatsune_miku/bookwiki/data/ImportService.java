package online.hatsune_miku.bookwiki.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaReference;
import online.hatsune_miku.bookwiki.media.MediaReferenceRepository;
import online.hatsune_miku.bookwiki.media.MediaRepository;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import online.hatsune_miku.bookwiki.species.Species;
import online.hatsune_miku.bookwiki.species.SpeciesLink;
import online.hatsune_miku.bookwiki.species.SpeciesLinkRepository;
import online.hatsune_miku.bookwiki.chapter.Chapter;
import online.hatsune_miku.bookwiki.chapter.ChapterNote;
import online.hatsune_miku.bookwiki.character.Character;
import online.hatsune_miku.bookwiki.location.Location;
import online.hatsune_miku.bookwiki.item.Item;
import online.hatsune_miku.bookwiki.lore.Lore;
import org.hibernate.Hibernate;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

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
    private final SpeciesLinkRepository speciesLinkRepository;
    private final MediaReferenceRepository mediaReferenceRepository;
    private final ObjectMapper objectMapper;

    // Mapping: EntityType -> (OldID -> NewID)
    private final Map<String, Map<Long, Long>> idMap = new HashMap<>();

    public ImportService(StoryRepository storyRepository, 
                         MediaRepository mediaRepository,
                         SpeciesLinkRepository speciesLinkRepository,
                         MediaReferenceRepository mediaReferenceRepository,
                         ObjectMapper objectMapper) {
        this.storyRepository = storyRepository;
        this.mediaRepository = mediaRepository;
        this.speciesLinkRepository = speciesLinkRepository;
        this.mediaReferenceRepository = mediaReferenceRepository;
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
        speciesLinkRepository.deleteAll();
        mediaReferenceRepository.deleteAll();
        System.out.println("Reset complete.");
    }

    private void processImport(DataPackage dataPackage) {
        try {
            idMap.clear();
            System.out.println("Processing import. Stories: " + (dataPackage.getStories() != null ? dataPackage.getStories().size() : 0));
            
            // 1. Import Media first
            if (dataPackage.getMedia() != null) {
                for (MediaDTO mediaDTO : dataPackage.getMedia()) {
                    Media media = new Media();
                    media.setId(mediaDTO.getId());
                    media.setFilename(mediaDTO.getFilename());
                    media.setContentType(mediaDTO.getContentType());
                    media.setCreatedAt(mediaDTO.getCreatedAt() != null ? mediaDTO.getCreatedAt() : LocalDateTime.now());
                    
                    if (mediaDTO.getData() != null) {
                        var blob = Hibernate.getLobHelper().createBlob(mediaDTO.getData());
                        media.setData(blob);
                    }
                    mediaRepository.save(media);
                }
            }

            // 2. Import Stories and build ID mapping
            List<Story> importedStories = new ArrayList<>();
            if (dataPackage.getStories() != null) {
                for (Story story : dataPackage.getStories()) {
                    Long oldStoryId = story.getId();
                    
                    // Store old IDs for mapping
                    Map<Object, Long> oldIds = new IdentityHashMap<>();
                    collectOldIds(story, oldIds);
                    
                    prepareForImport(story);
                    Story savedStory = storyRepository.save(story);
                    importedStories.add(savedStory);
                    
                    // Build mapping
                    buildMapping(savedStory, oldIds);
                    if (oldStoryId != null) {
                        recordMapping("STORY", oldStoryId, savedStory.getId());
                    }
                }
            }

            // 3. Fixup relationships in stories
            for (Story story : importedStories) {
                fixupRelationships(story);
            }
            storyRepository.saveAll(importedStories);

            // 4. Import SpeciesLinks
            if (dataPackage.getSpeciesLinks() != null) {
                for (SpeciesLink link : dataPackage.getSpeciesLinks()) {
                    link.setId(null);
                    link.setSourceSpeciesId(getNewId("SPECIES", link.getSourceSpeciesId()));
                    link.setTargetSpeciesId(getNewId("SPECIES", link.getTargetSpeciesId()));
                    if (link.getSourceSpeciesId() != null && link.getTargetSpeciesId() != null) {
                        speciesLinkRepository.save(link);
                    }
                }
            }

            // 5. Import MediaReferences
            if (dataPackage.getMediaReferences() != null) {
                for (MediaReference ref : dataPackage.getMediaReferences()) {
                    ref.setId(null);
                    Long newEntityId = getNewId(ref.getEntityType(), ref.getEntityId());
                    if (newEntityId != null) {
                        ref.setEntityId(newEntityId);
                        mediaReferenceRepository.save(ref);
                    }
                }
            }

        } catch (Exception e) {
            System.err.println("FATAL ERROR DURING IMPORT:");
            e.printStackTrace();
            throw e;
        }
    }

    private void collectOldIds(Story story, Map<Object, Long> oldIds) {
        if (story.getChapters() != null) story.getChapters().forEach(c -> {
            oldIds.put(c, c.getId());
            if (c.getNotes() != null) c.getNotes().forEach(n -> oldIds.put(n, n.getId()));
        });
        if (story.getCharacters() != null) story.getCharacters().forEach(c -> {
            oldIds.put(c, c.getId());
            if (c.getCustomSections() != null) c.getCustomSections().forEach(s -> oldIds.put(s, s.getId()));
        });
        if (story.getLocations() != null) story.getLocations().forEach(l -> {
            oldIds.put(l, l.getId());
            if (l.getCustomSections() != null) l.getCustomSections().forEach(s -> oldIds.put(s, s.getId()));
        });
        if (story.getItems() != null) story.getItems().forEach(i -> {
            oldIds.put(i, i.getId());
            if (i.getCustomSections() != null) i.getCustomSections().forEach(s -> oldIds.put(s, s.getId()));
        });
        if (story.getLores() != null) story.getLores().forEach(l -> {
            oldIds.put(l, l.getId());
            if (l.getCustomSections() != null) l.getCustomSections().forEach(s -> oldIds.put(s, s.getId()));
        });
        if (story.getSpecies() != null) story.getSpecies().forEach(s -> {
            oldIds.put(s, s.getId());
            if (s.getCustomSections() != null) s.getCustomSections().forEach(cs -> oldIds.put(cs, cs.getId()));
        });
    }

    private void buildMapping(Story story, Map<Object, Long> oldIds) {
        if (story.getChapters() != null) story.getChapters().forEach(c -> {
            recordMapping("CHAPTER", oldIds.get(c), c.getId());
            if (c.getNotes() != null) c.getNotes().forEach(n -> recordMapping("CHAPTER_NOTE", oldIds.get(n), n.getId()));
        });
        if (story.getCharacters() != null) story.getCharacters().forEach(c -> {
            recordMapping("CHARACTER", oldIds.get(c), c.getId());
            if (c.getCustomSections() != null) c.getCustomSections().forEach(s -> recordMapping("CHARACTER_SECTION", oldIds.get(s), s.getId()));
        });
        if (story.getLocations() != null) story.getLocations().forEach(l -> {
            recordMapping("LOCATION", oldIds.get(l), l.getId());
            if (l.getCustomSections() != null) l.getCustomSections().forEach(s -> recordMapping("LOCATION_SECTION", oldIds.get(s), s.getId()));
        });
        if (story.getItems() != null) story.getItems().forEach(i -> {
            recordMapping("ITEM", oldIds.get(i), i.getId());
            if (i.getCustomSections() != null) i.getCustomSections().forEach(s -> recordMapping("ITEM_SECTION", oldIds.get(s), s.getId()));
        });
        if (story.getLores() != null) story.getLores().forEach(l -> {
            recordMapping("LORE", oldIds.get(l), l.getId());
            if (l.getCustomSections() != null) l.getCustomSections().forEach(s -> recordMapping("LORE_SECTION", oldIds.get(s), s.getId()));
        });
        if (story.getSpecies() != null) story.getSpecies().forEach(s -> {
            recordMapping("SPECIES", oldIds.get(s), s.getId());
            if (s.getCustomSections() != null) s.getCustomSections().forEach(cs -> recordMapping("SPECIES_SECTION", oldIds.get(cs), cs.getId()));
        });
    }

    private void recordMapping(String type, Long oldId, Long newId) {
        if (oldId == null || newId == null) return;
        idMap.computeIfAbsent(type, k -> new HashMap<>()).put(oldId, newId);
    }

    private Long getNewId(String type, Long oldId) {
        if (oldId == null) return null;
        Map<Long, Long> typeMap = idMap.get(type);
        return typeMap != null ? typeMap.get(oldId) : null;
    }

    private void fixupRelationships(Story story) {
        if (story.getCharacters() != null) {
            story.getCharacters().forEach(c -> {
                c.setSpeciesId(getNewId("SPECIES", c.getSpeciesId()));
            });
        }
        if (story.getSpecies() != null) {
            story.getSpecies().forEach(s -> {
                s.setParentId(getNewId("SPECIES", s.getParentId()));
                s.setHabitatId(getNewId("LOCATION", s.getHabitatId()));
                if (s.getCustomSections() != null) {
                    s.getCustomSections().forEach(cs -> {
                        cs.setInheritedFromSectionId(getNewId("SPECIES_SECTION", cs.getInheritedFromSectionId()));
                    });
                }
            });
        }
    }

    private void prepareForImport(@NonNull Story story) {
        story.setId(null);
        if (story.getChapters() != null) {
            story.getChapters().forEach(c -> {
                c.setId(null);
                c.setStory(story);
                if (c.getNotes() != null) {
                    c.getNotes().forEach(n -> {
                        n.setId(null);
                        n.setChapter(c);
                    });
                }
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
