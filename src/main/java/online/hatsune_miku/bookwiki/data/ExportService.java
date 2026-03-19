package online.hatsune_miku.bookwiki.data;

import com.fasterxml.jackson.databind.ObjectMapper;
import online.hatsune_miku.bookwiki.media.Media;
import online.hatsune_miku.bookwiki.media.MediaRepository;
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
    private final ObjectMapper objectMapper;

    private static final Pattern IMAGE_PATTERN = Pattern.compile("#\\{image:([a-fA-F0-9-]{36})\\}");

    public ExportService(StoryRepository storyRepository, MediaRepository mediaRepository, ObjectMapper objectMapper) {
        this.storyRepository = storyRepository;
        this.mediaRepository = mediaRepository;
        this.objectMapper = objectMapper;
    }

    public byte[] exportFull() throws IOException {
        List<Story> allStories = storyRepository.findAll();
        List<Media> allMedia = mediaRepository.findAll();
        return createZip(allStories, allMedia);
    }

    public byte[] exportStories(List<Long> storyIds) throws IOException {
        List<Story> stories = storyRepository.findAllById(storyIds);
        Set<UUID> mediaIds = new HashSet<>();
        
        for (Story story : stories) {
            collectMediaIds(story, mediaIds);
        }
        
        List<Media> referencedMedia = mediaRepository.findAllById(mediaIds);
        return createZip(stories, referencedMedia);
    }

    private void collectMediaIds(Story story, Set<UUID> mediaIds) {
        // This is a bit manual but necessary since we use shortcodes in strings
        // In a real app we might have a better reference tracking system
        
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

    private byte[] createZip(List<Story> stories, List<Media> media) throws IOException {
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
                .version("1.0")
                .stories(stories)
                .media(mediaDTOs)
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
