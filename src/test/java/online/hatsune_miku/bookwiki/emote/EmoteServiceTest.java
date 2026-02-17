package online.hatsune_miku.bookwiki.emote;

import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

    @Test
    void updateEmote_Success() {
        Story story = new Story();
        story.setId(1L);
        Emote emote = new Emote();
        emote.setId(10L);
        emote.setName("oldName");
        emote.setStory(story);

        when(emoteRepository.findById(10L)).thenReturn(Optional.of(emote));
        when(emoteRepository.existsByStoryIdAndName(1L, "newName")).thenReturn(false);
        when(emoteRepository.save(any(Emote.class))).thenAnswer(i -> i.getArguments()[0]);

        Emote updated = emoteService.updateEmote(10L, "newName");

        assertEquals("newName", updated.getName());
        verify(emoteRepository).save(emote);
    }

    @Test
    void updateEmote_DuplicateName() {
        Story story = new Story();
        story.setId(1L);
        Emote emote = new Emote();
        emote.setId(10L);
        emote.setName("oldName");
        emote.setStory(story);

        when(emoteRepository.findById(10L)).thenReturn(Optional.of(emote));
        when(emoteRepository.existsByStoryIdAndName(1L, "duplicate")).thenReturn(true);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> {
            emoteService.updateEmote(10L, "duplicate");
        });
    }

    @Test
    void deleteEmote_Success() {
        when(emoteRepository.existsById(10L)).thenReturn(true);

        emoteService.deleteEmote(10L);

        verify(emoteRepository).deleteById(10L);
    }

    @Test
    void deleteEmote_NotFound() {
        when(emoteRepository.existsById(10L)).thenReturn(false);

        assertThrows(org.springframework.web.server.ResponseStatusException.class, () -> {
            emoteService.deleteEmote(10L);
        });
    }
}
