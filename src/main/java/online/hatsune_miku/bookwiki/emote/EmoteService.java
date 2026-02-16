package online.hatsune_miku.bookwiki.emote;

import lombok.RequiredArgsConstructor;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmoteService {
    private final EmoteRepository emoteRepository;
    private final StoryRepository storyRepository;

    public Emote createEmote(Long storyId, String name, String imageUrl) {
        Story story = storyRepository.findById(storyId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Story not found"));

        Emote emote = new Emote();
        emote.setName(name);
        emote.setImageUrl(imageUrl);
        emote.setStory(story);

        return emoteRepository.save(emote);
    }

    public List<Emote> getEmotesByStory(Long storyId) {
        return emoteRepository.findByStoryId(storyId);
    }
}
