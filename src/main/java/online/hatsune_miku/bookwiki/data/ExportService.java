package online.hatsune_miku.bookwiki.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaReference;
import online.hatsune_miku.bookwiki.media.MediaReferenceRepository;
import online.hatsune_miku.bookwiki.media.MediaRepository;
import online.hatsune_miku.bookwiki.species.SpeciesLink;
import online.hatsune_miku.bookwiki.species.SpeciesLinkRepository;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
public class ExportService {

    private final StoryRepository storyRepository;
    private final MediaRepository mediaRepository;
    private final SpeciesLinkRepository speciesLinkRepository;
    private final MediaReferenceRepository mediaReferenceRepository;
    private final ObjectMapper objectMapper;

    private static final Pattern IMAGE_PATTERN = Pattern.compile("#\\{image:([a-fA-F0-9-]{36})\\}");

    public ExportService(StoryRepository storyRepository, 
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

    public byte[] exportFull() throws IOException {
        List<Story> allStories = storyRepository.findAll();
        List<Media> allMedia = mediaRepository.findAll();
        List<SpeciesLink> allLinks = speciesLinkRepository.findAll();
        List<MediaReference> allRefs = mediaReferenceRepository.findAll();
        return createZip(allStories, allMedia, allLinks, allRefs);
    }

    public byte[] exportStories(List<Long> storyIds) throws IOException {
        List<Story> stories = storyRepository.findAllById(storyIds);
        Set<UUID> mediaIds = new HashSet<>();
        Set<Long> speciesIds = new HashSet<>();
        Set<Long> chapterIds = new HashSet<>();
        Set<Long> characterIds = new HashSet<>();
        Set<Long> locationIds = new HashSet<>();
        Set<Long> itemIds = new HashSet<>();
        Set<Long> loreIds = new HashSet<>();

        for (Story story : stories) {
            collectMediaIds(story, mediaIds);
            story.getSpecies().forEach(s -> speciesIds.add(s.getId()));
            story.getChapters().forEach(c -> chapterIds.add(c.getId()));
            story.getCharacters().forEach(c -> characterIds.add(c.getId()));
            story.getLocations().forEach(l -> locationIds.add(l.getId()));
            story.getItems().forEach(i -> itemIds.add(i.getId()));
            story.getLores().forEach(l -> loreIds.add(l.getId()));
        }
        
        List<Media> referencedMedia = mediaRepository.findAllById(mediaIds);
        
        // Filter SpeciesLinks: both source and target must be in the exported species
        List<SpeciesLink> filteredLinks = speciesLinkRepository.findAll().stream()
                .filter(link -> speciesIds.contains(link.getSourceSpeciesId()) && speciesIds.contains(link.getTargetSpeciesId()))
                .toList();
                
        // Filter MediaReferences: entity must be one of the exported ones
        List<MediaReference> filteredRefs = mediaReferenceRepository.findAll().stream()
                .filter(ref -> {
                    switch (ref.getEntityType()) {
                        case "STORY": return storyIds.contains(ref.getEntityId());
                        case "CHAPTER": return chapterIds.contains(ref.getEntityId());
                        case "CHARACTER": return characterIds.contains(ref.getEntityId());
                        case "LOCATION": return locationIds.contains(ref.getEntityId());
                        case "ITEM": return itemIds.contains(ref.getEntityId());
                        case "LORE": return loreIds.contains(ref.getEntityId());
                        case "SPECIES": return speciesIds.contains(ref.getEntityId());
                        default: return false;
                    }
                })
                .toList();

        return createZip(stories, referencedMedia, filteredLinks, filteredRefs);
    }

    private void collectMediaIds(Story story, Set<UUID> mediaIds) {
        // Scan story description
        extractIds(story.getDescription(), mediaIds);
        
        // Chapters
        story.getChapters().forEach(c -> extractIds(c.getContent(), mediaIds));
        
        // Worldbuilding
        story.getCharacters().forEach(c -> {
            extractIds(c.getPictureUrl(), mediaIds);
            extractIds(c.getAppearance(), mediaIds);
            extractIds(c.getDescription(), mediaIds);
            c.getCustomSections().forEach(s -> extractIds(s.getContent(), mediaIds));
        });
        
        story.getLocations().forEach(l -> {
            extractIds(l.getPictureUrl(), mediaIds);
            extractIds(l.getDescription(), mediaIds);
            extractIds(l.getWhereItIs(), mediaIds);
            extractIds(l.getDetails(), mediaIds);
            l.getCustomSections().forEach(s -> extractIds(s.getContent(), mediaIds));
        });
        
        story.getItems().forEach(i -> {
            extractIds(i.getPictureUrl(), mediaIds);
            extractIds(i.getDescription(), mediaIds);
            i.getCustomSections().forEach(s -> extractIds(s.getContent(), mediaIds));
        });
        
        story.getLores().forEach(l -> {
            extractIds(l.getPictureUrl(), mediaIds);
            extractIds(l.getDescription(), mediaIds);
            l.getCustomSections().forEach(s -> extractIds(s.getContent(), mediaIds));
        });

        story.getSpecies().forEach(s -> {
            extractIds(s.getPictureUrl(), mediaIds);
            extractIds(s.getDescription(), mediaIds);
            s.getCustomSections().forEach(cs -> extractIds(cs.getContent(), mediaIds));
        });

        story.getEmotes().forEach(e -> extractIds(e.getImageUrl(), mediaIds));
    }

    private void extractIds(String text, Set<UUID> mediaIds) {
        if (text == null || text.isEmpty()) return;
        Matcher matcher = IMAGE_PATTERN.matcher(text);
        while (matcher.find()) {
            try {
                mediaIds.add(UUID.fromString(matcher.group(1)));
            } catch (IllegalArgumentException e) {
                // Ignore invalid UUIDs
            }
        }
    }

    private byte[] createZip(List<Story> stories, List<Media> media, List<SpeciesLink> links, List<MediaReference> refs) throws IOException {
        List<MediaDTO> mediaDTOs = new ArrayList<>();
        for (Media m : media) {
            try {
                byte[] data = m.getData().getBytes(1, (int) m.getData().length());
                mediaDTOs.add(MediaDTO.builder()
                        .id(m.getId())
                        .filename(m.getFilename())
                        .contentType(m.getContentType())
                        .data(data)
                        .createdAt(m.getCreatedAt())
                        .build());
            } catch (Exception e) {
                System.err.println("Failed to read media data for: " + m.getId());
            }
        }

        DataPackage dataPackage = DataPackage.builder()
                .version("1.1")
                .stories(stories)
                .media(mediaDTOs)
                .speciesLinks(links)
                .mediaReferences(refs)
                .build();

        String json = objectMapper.writeValueAsString(dataPackage);

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            ZipEntry entry = new ZipEntry("data.json");
            zos.putNextEntry(entry);
            zos.write(json.getBytes(StandardCharsets.UTF_8));
            zos.closeEntry();
            zos.finish();
        }
        return baos.toByteArray();
    }
}
