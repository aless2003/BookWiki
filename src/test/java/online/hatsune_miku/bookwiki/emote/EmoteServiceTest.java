package online.hatsune_miku.bookwiki.emote;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmoteServiceTest {

    @Mock
    private EmoteRepository emoteRepository;

    @Mock
    private StoryRepository storyRepository;

    @InjectMocks
    private EmoteService emoteService;

    @Test
    void createEmote() {
        Story story = new Story();
        story.setId(1L);

        when(storyRepository.findById(1L)).thenReturn(Optional.of(story));
        when(emoteRepository.save(any(Emote.class))).thenAnswer(i -> i.getArguments()[0]);

        emoteService.createEmote(1L, "test", "http://example.com/test.png");

        verify(storyRepository).findById(1L);
        verify(emoteRepository).save(any(Emote.class));
    }

    @Test
    void getEmotesByStory() {
        emoteService.getEmotesByStory(1L);
        verify(emoteRepository).findByStoryId(1L);
    }
}
