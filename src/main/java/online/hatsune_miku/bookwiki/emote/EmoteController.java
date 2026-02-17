package online.hatsune_miku.bookwiki.emote;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stories/{storyId}/emotes")
@RequiredArgsConstructor
public class EmoteController {
    private final EmoteService emoteService;

    @PostMapping
    public ResponseEntity<Emote> createEmote(@PathVariable Long storyId, @RequestBody CreateEmoteRequest request) {
        Emote emote = emoteService.createEmote(storyId, request.getName(), request.getImageUrl());
        return ResponseEntity.ok(emote);
    }

    @GetMapping
    public ResponseEntity<List<Emote>> getEmotesByStory(@PathVariable Long storyId) {
        List<Emote> emotes = emoteService.getEmotesByStory(storyId);
        return ResponseEntity.ok(emotes);
    }

    @PatchMapping("/{emoteId}")
    public ResponseEntity<Emote> updateEmote(
            @PathVariable Long storyId,
            @PathVariable Long emoteId,
            @RequestBody CreateEmoteRequest request) {
        Emote updated = emoteService.updateEmote(emoteId, request.getName());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{emoteId}")
    public ResponseEntity<Void> deleteEmote(
            @PathVariable Long storyId,
            @PathVariable Long emoteId) {
        emoteService.deleteEmote(emoteId);
        return ResponseEntity.noContent().build();
    }
}
