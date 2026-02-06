package online.hatsune_miku.bookwiki.chapter;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import online.hatsune_miku.bookwiki.story.StoryService;
import online.hatsune_miku.bookwiki.story.Story;

@RestController
@RequestMapping("/api/chapters")
@CrossOrigin(origins = "http://localhost:5173") // Allow frontend access
public class ChapterController {

    @Autowired
    private ChapterService chapterService;
    
    @Autowired
    private StoryService storyService;

    @GetMapping
    public List<Chapter> getAllChapters(@RequestParam(required = false) Long storyId) {
        if (storyId != null) {
            return chapterService.getChaptersByStoryId(storyId);
        }
        // If no story ID provided, return chapters from the default story
        Story defaultStory = storyService.getDefaultStory();
        return chapterService.getChaptersByStoryId(defaultStory.getId());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Chapter> getChapterById(@PathVariable Long id) {
        return chapterService.getChapterById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Chapter createChapter(@RequestBody Chapter chapter, @RequestParam(required = false) Long storyId) {
        Story story;
        if (storyId != null) {
            story = storyService.getStoryById(storyId).orElse(null);
        } else {
            story = storyService.getDefaultStory();
        }
        
        if (story == null) {
             // Fallback if somehow no default story exists
             throw new RuntimeException("No story context found for chapter");
        }
        
        chapter.setStory(story);
        return chapterService.saveChapter(chapter);
    }

    @PutMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Chapter> updateChapter(@PathVariable Long id, @RequestBody Chapter chapterDetails) {
        return chapterService.getChapterById(id)
                .map(chapter -> {
                    chapter.setTitle(chapterDetails.getTitle());
                    chapter.setContent(chapterDetails.getContent());
                    
                    // Synchronize notes
                    if (chapterDetails.getNotes() != null) {
                        // Create a map of existing notes for quick lookup
                        java.util.Map<Long, ChapterNote> existingNotes = chapter.getNotes().stream()
                                .filter(n -> n.getId() != null)
                                .collect(java.util.stream.Collectors.toMap(ChapterNote::getId, n -> n));
                        
                        // List to keep track of notes to keep/add
                        java.util.List<ChapterNote> updatedNotes = new java.util.ArrayList<>();
                        
                        for (ChapterNote noteDetails : chapterDetails.getNotes()) {
                            if (noteDetails.getId() != null && existingNotes.containsKey(noteDetails.getId())) {
                                // Update existing note
                                ChapterNote existingNote = existingNotes.get(noteDetails.getId());
                                existingNote.setContent(noteDetails.getContent());
                                updatedNotes.add(existingNote);
                            } else {
                                // Add new note
                                noteDetails.setChapter(chapter);
                                updatedNotes.add(noteDetails);
                            }
                        }
                        
                        // Clear and add back only updated/new notes to maintain orphan removal
                        chapter.getNotes().clear();
                        chapter.getNotes().addAll(updatedNotes);
                    } else {
                        chapter.getNotes().clear();
                    }
                    
                    return ResponseEntity.ok(chapterService.saveChapter(chapter));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChapter(@PathVariable Long id) {
        if (chapterService.getChapterById(id).isPresent()) {
            chapterService.deleteChapter(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
