package online.hatsune_miku.bookwiki.emote;

import jakarta.transaction.Transactional;
import online.hatsune_miku.bookwiki.story.Story;
import online.hatsune_miku.bookwiki.story.StoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import tools.jackson.databind.json.JsonMapper;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EmoteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private StoryRepository storyRepository;
    
    @Autowired
    private EmoteRepository emoteRepository;
    
    private Story testStory;

    @BeforeEach
    void setUp() {
        emoteRepository.deleteAll();
        storyRepository.deleteAll();
        
        testStory = new Story();
        testStory.setTitle("Test Story");
        testStory = storyRepository.save(testStory);
    }

    @Test
    void createEmote() throws Exception {
        CreateEmoteRequest request = new CreateEmoteRequest();
        request.setName("test");
        request.setImageUrl("http://example.com/test.png");

        mockMvc.perform(post("/api/stories/{storyId}/emotes", testStory.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("test"));
    }

    @Test
    void getEmotesByStory() throws Exception {
        Emote emote = new Emote();
        emote.setName("test");
        emote.setImageUrl("http://example.com/test.png");
        emote.setStory(testStory);
        emoteRepository.save(emote);
        
        mockMvc.perform(get("/api/stories/{storyId}/emotes", testStory.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("test"));
    }

    @Test
    void updateEmote() throws Exception {
        Emote emote = new Emote();
        emote.setName("oldName");
        emote.setImageUrl("http://example.com/test.png");
        emote.setStory(testStory);
        emote = emoteRepository.save(emote);

        CreateEmoteRequest request = new CreateEmoteRequest();
        request.setName("newName");

        mockMvc.perform(patch("/api/stories/{storyId}/emotes/{emoteId}", testStory.getId(), emote.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("newName"));
    }

    @Test
    void deleteEmote() throws Exception {
        Emote emote = new Emote();
        emote.setName("test");
        emote.setImageUrl("http://example.com/test.png");
        emote.setStory(testStory);
        emote = emoteRepository.save(emote);

        mockMvc.perform(delete("/api/stories/{storyId}/emotes/{emoteId}", testStory.getId(), emote.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/stories/{storyId}/emotes", testStory.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }
}
