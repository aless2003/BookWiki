package online.hatsune_miku.bookwiki.export;

import online.hatsune_miku.bookwiki.chapter.Chapter;
import online.hatsune_miku.bookwiki.chapter.ChapterService;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/export")
@CrossOrigin(origins = "http://localhost:5173")
public class ExportController {

    private final List<ExportService> exportServices;
    private final ChapterService chapterService;
    private final StoryService storyService;

    public ExportController(List<ExportService> exportServices, ChapterService chapterService, StoryService storyService) {
        this.exportServices = exportServices;
        this.chapterService = chapterService;
        this.storyService = storyService;
    }

    @PostMapping("/{format}")
    public ResponseEntity<byte[]> export(@PathVariable String format, @RequestBody ExportRequest request) throws IOException {
        ExportService service = exportServices.stream()
                .filter(s -> s.getFormat().equalsIgnoreCase(format))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Unknown format: " + format));

        List<Chapter> chaptersToExport = new ArrayList<>();
        String title = "Export";

        if (request.getStoryId() != null) {
            Optional<Story> story = storyService.getStoryById(request.getStoryId());
            if (story.isPresent()) {
                title = story.get().getTitle();
                if (request.getChapterIds() != null && !request.getChapterIds().isEmpty()) {
                    // Export specific chapters in the order provided by the request (which should be the UI order)
                    for (Long id : request.getChapterIds()) {
                        chapterService.getChapterById(id).ifPresent(chaptersToExport::add);
                    }
                } else {
                    // Export all chapters of the story
                    chaptersToExport.addAll(chapterService.getChaptersByStoryId(request.getStoryId()));
                }
            }
        } else if (request.getChapterIds() != null && !request.getChapterIds().isEmpty()) {
            for (Long id : request.getChapterIds()) {
                chapterService.getChapterById(id).ifPresent(chaptersToExport::add);
            }
        }

        // Always apply natural sort to the final list to ensure correct document order
        chaptersToExport.sort((a, b) -> compareNaturally(a.getTitle(), b.getTitle()));

        byte[] content = service.export(title, chaptersToExport);

        String filename = title.replaceAll("[^a-zA-Z0-9.-]", "_") + "." + format;
        
        MediaType mediaType = format.equalsIgnoreCase("pdf") 
                ? MediaType.APPLICATION_PDF 
                : MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(mediaType)
                .body(content);
    }

    private int compareNaturally(String s1, String s2) {
        if (s1 == null || s2 == null) return 0;
        
        java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("(\\d+)|(\\D+)");
        java.util.regex.Matcher m1 = pattern.matcher(s1);
        java.util.regex.Matcher m2 = pattern.matcher(s2);
        
        while (m1.find() && m2.find()) {
            String g1 = m1.group();
            String g2 = m2.group();
            
            int result;
            if (Character.isDigit(g1.charAt(0)) && Character.isDigit(g2.charAt(0))) {
                result = Long.compare(Long.parseLong(g1), Long.parseLong(g2));
            } else {
                result = g1.compareToIgnoreCase(g2);
            }
            
            if (result != 0) return result;
        }
        
        return s1.length() - s2.length();
    }
}
