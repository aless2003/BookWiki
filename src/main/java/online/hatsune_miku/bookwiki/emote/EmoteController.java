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
}
