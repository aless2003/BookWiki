package online.hatsune_miku.bookwiki.story;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "http://localhost:5173")
public class StoryController {

    @Autowired
    private StoryService storyService;

    @GetMapping
    public List<Story> getAllStories() {
        return storyService.getAllStories();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryById(@PathVariable Long id) {
        return storyService.getStoryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Story createStory(@RequestBody Story story) {
        return storyService.saveStory(story);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Story> updateStory(@PathVariable Long id, @RequestBody Story storyDetails) {
        return storyService.getStoryById(id)
                .map(story -> {
                    story.setTitle(storyDetails.getTitle());
                    story.setDescription(storyDetails.getDescription());
                    return ResponseEntity.ok(storyService.saveStory(story));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStory(@PathVariable Long id) {
        if (storyService.getStoryById(id).isPresent()) {
            storyService.deleteStory(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
